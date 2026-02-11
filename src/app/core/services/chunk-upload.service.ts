import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, throwError, firstValueFrom } from 'rxjs';
import { catchError, finalize, timeout, takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface UploadProgress {
  uploadId: string;
  fileName: string;
  fileType: string;
  loaded: number;       // bytes cargados
  total: number;        // bytes totales
  percentage: number;   // 0-100
  status: 'uploading' | 'completed' | 'error' | 'cancelled';
  error?: string;
  tempPath?: string;    // path temporal en backend cuando completa
}

@Injectable({
  providedIn: 'root'
})
export class ChunkUploadService {
  private readonly CHUNK_SIZE = 1.5 * 1024 * 1024; // 1.5MB (compatible con límite PHP de 2MB)
  private readonly API_URL = `${environment.apiUrl}/upload/chunk`;

  constructor(private http: HttpClient) {}

  /**
   * Upload a file in chunks
   * @param file File to upload
   * @param fileType Type of file (picking_list, invoice, performa_pdf)
   * @param chunkSize Size of each chunk in bytes (default 1.5MB)
   * @returns Observable that emits upload progress
   */
  uploadFile(
    file: File,
    fileType: 'picking_list' | 'invoice' | 'performa_pdf',
    chunkSize: number = this.CHUNK_SIZE
  ): Observable<UploadProgress> {
    return new Observable(observer => {
      const uploadId = this.generateUploadId();
      const totalChunks = Math.ceil(file.size / chunkSize);
      let uploadCancelled = false;
      let uploadCompleted = false; // ✅ Nuevo flag para rastrear si completó exitosamente

      // Subject para cancelar el HTTP request en curso
      const cancelSubject = new Subject<void>();

      const progress: UploadProgress = {
        uploadId,
        fileName: file.name,
        fileType,
        loaded: 0,
        total: file.size,
        percentage: 0,
        status: 'uploading'
      };

      // Función para cancelar el upload
      const cancelUpload = () => {
        uploadCancelled = true;
        progress.status = 'cancelled';
        observer.next(progress);
        observer.complete();

        // Llamar al backend para limpiar chunks
        this.cancelUploadOnServer(uploadId).subscribe();
      };

      // Función recursiva para subir chunks secuencialmente
      const uploadChunk = async (chunkIndex: number) => {
        if (uploadCancelled) {
          return;
        }

        if (chunkIndex >= totalChunks) {
          // Todos los chunks se subieron exitosamente
          return;
        }

        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('chunkIndex', chunkIndex.toString());
        formData.append('totalChunks', totalChunks.toString());
        formData.append('fileName', file.name);
        formData.append('uploadId', uploadId);
        formData.append('fileType', fileType);

        try {
          // Usar firstValueFrom en lugar de toPromise (deprecado en RxJS 7+)
          // ✅ Timeout de 5 minutos (300000ms) para cada chunk
          // ✅ takeUntil para permitir cancelación del HTTP request en curso
          const response = await firstValueFrom(
            this.http.post<{
              completed: boolean;
              tempPath?: string;
              received?: number;
              total?: number;
              message?: string;
            }>(this.API_URL, formData).pipe(
              takeUntil(cancelSubject), // Permite cancelar el request en curso
              timeout(300000) // 5 minutos de timeout por chunk
            )
          );

          if (uploadCancelled) {
            return;
          }

          // Actualizar progreso
          progress.loaded = end;
          progress.percentage = Math.round((end / file.size) * 100);

          // 🔍 DEBUG: Log del progreso
          console.log(`[ChunkUpload] Chunk ${chunkIndex + 1}/${totalChunks} completado`, {
            fileName: file.name,
            percentage: progress.percentage,
            loaded: end,
            total: file.size,
            responseCompleted: response?.completed
          });

          // Emitir progreso actual
          observer.next({ ...progress });

          // Si es el último chunk y está completo
          if (response?.completed) {
            progress.status = 'completed';
            progress.percentage = 100;
            progress.tempPath = response.tempPath;
            uploadCompleted = true; // ✅ Marcar como completado exitosamente

            // 🔍 DEBUG: Log de completado
            console.log(`[ChunkUpload] ✅ Upload completado`, {
              fileName: file.name,
              tempPath: response.tempPath,
              status: progress.status,
              uploadCompleted: true
            });

            observer.next({ ...progress });
            observer.complete();
          } else {
            // Subir siguiente chunk
            await uploadChunk(chunkIndex + 1);
          }

        } catch (error) {
          if (uploadCancelled) {
            return;
          }

          progress.status = 'error';
          progress.error = this.getErrorMessage(error);
          observer.next({ ...progress });
          observer.error(error);
        }
      };

      // Iniciar upload del primer chunk
      uploadChunk(0);

      // ✅ FIX: Retornar función de cleanup que solo cancela si NO completó exitosamente
      return () => {
        // Solo cancelar en el servidor si NO se completó exitosamente
        if (!uploadCompleted && !uploadCancelled) {
          // Marcar como cancelado para evitar que continúen subiendo chunks
          uploadCancelled = true;

          // ✅ Cancelar el HTTP request en curso
          cancelSubject.next();
          cancelSubject.complete();

          // Emitir estado de cancelado
          progress.status = 'cancelled';
          observer.next({ ...progress });

          console.log(`[ChunkUpload] ⚠️ Cleanup: Cancelando upload incompleto (incluyendo HTTP request en curso)`, {
            uploadId,
            fileName: file.name,
            uploadCompleted,
            uploadCancelled: true
          });

          // Limpiar chunks en el servidor
          this.cancelUploadOnServer(uploadId).subscribe({
            next: () => {
              console.log(`[ChunkUpload] ✅ Chunks eliminados del servidor`, { uploadId });
            },
            error: (err) => {
              console.error(`[ChunkUpload] ❌ Error eliminando chunks del servidor:`, {
                uploadId,
                error: err
              });
            }
          });

          // Completar el observable
          observer.complete();
        } else if (uploadCompleted) {
          // Asegurarse de completar el subject incluso si ya se completó el upload
          cancelSubject.complete();

          console.log(`[ChunkUpload] ✅ Cleanup: Upload completado, NO se cancela en servidor`, {
            uploadId,
            fileName: file.name
          });
        }
      };
    });
  }

  /**
   * Cancel upload on server and cleanup temporary files
   * @param uploadId Upload ID to cancel
   */
  cancelUploadOnServer(uploadId: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/upload/chunk/${uploadId}`).pipe(
      catchError(error => {
        console.error('Error cancelling upload:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Generate a unique upload ID using crypto.randomUUID or fallback
   */
  private generateUploadId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Fallback para navegadores antiguos
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Extract error message from HTTP error
   */
  private getErrorMessage(error: any): string {
    if (error instanceof HttpErrorResponse) {
      if (error.error?.message) {
        return error.error.message;
      }
      if (error.status === 0) {
        return 'Error de conexión. Verifica tu conexión a internet.';
      }
      return `Error del servidor: ${error.status} ${error.statusText}`;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Error desconocido al cargar el archivo';
  }

  /**
   * Validate file before upload
   * @param file File to validate
   * @param maxSizeMB Maximum file size in MB
   * @param allowedExtensions Allowed file extensions
   * @returns Validation result with error message if invalid
   */
  validateFile(
    file: File,
    maxSizeMB: number = 250,
    allowedExtensions: string[] = ['pdf', 'xlsx', 'xls']
  ): { valid: boolean; message?: string } {
    // Validar tamaño
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        message: `El archivo excede el tamaño máximo permitido de ${maxSizeMB}MB`
      };
    }

    // Validar extensión
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        valid: false,
        message: `Extensión no permitida. Solo se permiten: ${allowedExtensions.join(', ')}`
      };
    }

    // Validar tipo MIME (solo si está disponible)
    // Nota: file.type puede estar vacío en algunos navegadores/sistemas
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel.sheet.macroEnabled.12',
      'application/octet-stream', // Algunos navegadores usan esto para archivos desconocidos
    ];

    // Solo validar si el tipo MIME está presente y no es genérico
    if (file.type && file.type !== '' && file.type !== 'application/octet-stream') {
      if (!allowedMimeTypes.includes(file.type)) {
        return {
          valid: false,
          message: 'Tipo de archivo no válido. El archivo debe ser PDF, XLS o XLSX'
        };
      }
    }

    return { valid: true };
  }
}
