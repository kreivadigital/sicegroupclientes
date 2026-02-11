import { Component, Input, Output, EventEmitter, OnInit, inject, signal, computed, DestroyRef, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { Modal } from '../modal/modal';
import { SearchableSelect, SelectOption } from '../searchable-select/searchable-select';
import { OrderService } from '../../../core/services/order.service';
import { ClientService } from '../../../core/services/client.service';
import { ContainerService } from '../../../core/services/container.service';
import { ToastService } from '../../../core/services/toast.service';
import { ChunkUploadService } from '../../../core/services/chunk-upload.service';
import { Auth } from '../../../core/services/auth';
import { Order, OrderFormData } from '../../../core/models/order.model';
import { Client } from '../../../core/models/client.model';
import { Container } from '../../../core/models/container.model';
import { isOrderStatusLocked, getAutoOrderStatus, ContainerStatusLabels } from '../../../core/models/enums';

@Component({
  selector: 'app-order-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Modal, SearchableSelect],
  templateUrl: './order-modal.html',
  styleUrl: './order-modal.scss',
})
export class OrderModal implements OnInit {
  // Dependency Injection usando inject() - Angular 20 best practice
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private clientService = inject(ClientService);
  private containerService = inject(ContainerService);
  private toast = inject(ToastService);
  private chunkUploadService = inject(ChunkUploadService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  public auth = inject(Auth);

  // Constantes para validación de archivos
  private readonly MAX_FILE_SIZE = 250 * 1024 * 1024; // 250MB en bytes
  private readonly ALLOWED_EXTENSIONS = ['.pdf', '.xlsx', '.xls'];

  @Input() mode: 'create' | 'edit' | 'view' = 'create';
  @Input() orderId?: number;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Order>();

  // Referencias a los inputs de archivo
  @ViewChild('performaInput') performaInput?: ElementRef<HTMLInputElement>;
  @ViewChild('packinInput') packinInput?: ElementRef<HTMLInputElement>;
  @ViewChild('invoiceInput') invoiceInput?: ElementRef<HTMLInputElement>;

  form!: FormGroup;
  loading = signal(false);
  order = signal<Order | null>(null);
  clients = signal<Client[]>([]);
  containers = signal<Container[]>([]);

  // Opciones para el searchable select de clientes
  clientOptions = computed<SelectOption[]>(() =>
    this.clients().map((client) => ({
      value: client.id,
      label: client.company_name,
    }))
  );

  // Control de bloqueo de estado según contenedor
  statusLocked = signal(false);
  statusLockedMessage = signal('');

  // Estados de archivos con información de progreso
  fileStates = {
    performa: {
      file: null as File | null,
      uploading: false,
      progress: 0,
      completed: false,
      tempPath: null as string | null,
      error: null as string | null
    },
    picking: {
      file: null as File | null,
      uploading: false,
      progress: 0,
      completed: false,
      tempPath: null as string | null,
      error: null as string | null
    },
    invoice: {
      file: null as File | null,
      uploading: false,
      progress: 0,
      completed: false,
      tempPath: null as string | null,
      error: null as string | null
    }
  };

  // Referencias a las suscripciones de upload para cancelación explícita
  private uploadSubscriptions: {
    performa: Subscription | null;
    picking: Subscription | null;
    invoice: Subscription | null;
  } = { performa: null, picking: null, invoice: null };

  ngOnInit() {
    this.initForm();
    this.loadClients();
    this.loadContainers();

    if (this.mode !== 'create' && this.orderId) {
      this.loadOrder();
    }
  }

  initForm() {
    this.form = this.fb.group({
      client_id: ['', [Validators.required]],
      description: [''],
      delivery_address: ['', [Validators.required]],
      package_count: ['', [Validators.required, Validators.min(1)]],
      status: ['pending', [Validators.required]],
      container_id: [''],
    });

    if (this.mode === 'view') {
      this.form.disable();
    }

    // Suscribirse a cambios en el contenedor para actualizar el estado automáticamente
    this.form.get('container_id')?.valueChanges.subscribe((containerId) => {
      this.onContainerChange(containerId);
    });
  }

  /**
   * Maneja el cambio de contenedor y actualiza el estado de la orden si corresponde
   */
  onContainerChange(containerId: string | number | null) {
    if (!containerId) {
      // Sin contenedor, el estado es editable
      this.statusLocked.set(false);
      this.statusLockedMessage.set('');
      return;
    }

    const container = this.containers().find(c => c.id === +containerId);
    if (!container) {
      this.statusLocked.set(false);
      this.statusLockedMessage.set('');
      return;
    }

    if (isOrderStatusLocked(container.status)) {
      const autoStatus = getAutoOrderStatus(container.status);
      if (autoStatus) {
        this.form.get('status')?.setValue(autoStatus);
        this.statusLocked.set(true);
        const containerStatusLabel = ContainerStatusLabels[container.status as keyof typeof ContainerStatusLabels] || container.status;
        this.statusLockedMessage.set(`Estado asignado automáticamente porque el contenedor está "${containerStatusLabel}"`);
      }
    } else {
      this.statusLocked.set(false);
      this.statusLockedMessage.set('');
    }
  }

  loadClients() {
    // Cargar TODOS los clientes para el select (sin paginación)
    this.clientService.getAllClients().subscribe({
      next: (response) => {
        this.clients.set(response.data || []);
      },
      error: (error) => console.error('Error cargando clientes:', error)
    });
  }

  loadContainers() {
    // Cargar todos los contenedores para el select (sin paginación)
    this.containerService.getAllContainers().subscribe({
      next: (response) => {
        this.containers.set(response.data || []);
      },
      error: (error) => console.error('Error cargando contenedores:', error)
    });
  }

  loadOrder() {
    if (!this.orderId) return;

    this.loading.set(true);
    this.orderService.getOrder(this.orderId).subscribe({
      next: (response) => {
        const order = response.data;
        this.order.set(order);

        this.form.patchValue({
          client_id: order.client_id,
          description: order.description || '',
          delivery_address: order.delivery_address || '',
          package_count: order.package_count || '',
          status: order.status,
          container_id: order.container_id || '',
        });

        // Verificar si el contenedor bloquea el estado (usando el container de la orden)
        if (order.container && order.container.status) {
          if (isOrderStatusLocked(order.container.status)) {
            this.statusLocked.set(true);
            const containerStatusLabel = ContainerStatusLabels[order.container.status as keyof typeof ContainerStatusLabels] || order.container.status;
            this.statusLockedMessage.set(`Estado asignado automáticamente porque el contenedor está "${containerStatusLabel}"`);
          }
        }

        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error cargando orden:', error);
        this.loading.set(false);
      }
    });
  }

  onFileSelect(event: Event, type: 'performa' | 'picking' | 'invoice') {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];
      const fileState = this.fileStates[type];

      // 🔍 DEBUG: Log del intento de upload
      console.log(`[OrderModal] 📁 Intento de seleccionar archivo:`, {
        type,
        fileName: file.name,
        sizeMB: (file.size / (1024 * 1024)).toFixed(2),
        currentlyUploading: fileState.uploading,
        otherUploads: {
          picking: this.fileStates.picking.uploading,
          performa: this.fileStates.performa.uploading,
          invoice: this.fileStates.invoice.uploading
        }
      });

      // ✅ FIX 1: Validar si ya hay un archivo del MISMO tipo cargando
      if (fileState.uploading) {
        this.toast.warning('Ya hay un archivo en proceso de carga. Espera a que termine.');
        input.value = ''; // ⚠️ Solo resetea este input, NO cancela el upload
        console.log(`[OrderModal] ⚠️ Bloqueado: ${type} ya está subiendo`);
        return; // ✅ Salir sin tocar el fileState en curso
      }

      // Validar archivo
      const validation = this.chunkUploadService.validateFile(file, 250, ['pdf', 'xlsx', 'xls']);

      if (!validation.valid) {
        this.toast.error(validation.message || 'Archivo no válido');
        input.value = '';
        return;
      }

      // ✅ NUEVO: Validar límite de uploads simultáneos
      const concurrentUploadCheck = this.checkConcurrentUploadLimit(file);
      if (!concurrentUploadCheck.allowed) {
        this.toast.warning(concurrentUploadCheck.message);
        // ⚠️ IMPORTANTE: Solo reseteamos el input del archivo actual
        // NO tocamos el fileState ni cancelamos uploads de otros archivos
        input.value = '';

        // 🔍 DEBUG: Confirmar que NO se interrumpe nada
        console.log(`[OrderModal] ⚠️ Upload bloqueado para ${type}:`, {
          reason: concurrentUploadCheck.message,
          currentUploads: {
            picking: this.fileStates.picking.uploading,
            performa: this.fileStates.performa.uploading,
            invoice: this.fileStates.invoice.uploading
          }
        });

        return; // ✅ Salir SIN modificar ningún fileState
      }

      // ⚠️ IMPORTANTE: Solo llegamos aquí si el upload está permitido
      // Resetear estado del archivo SOLO del tipo actual
      fileState.file = file;
      fileState.uploading = true;
      fileState.progress = 0;
      fileState.completed = false;
      fileState.tempPath = null;
      fileState.error = null;

      // Mapear tipo de archivo a nombre esperado por backend
      const fileTypeMap: { [key: string]: 'picking_list' | 'invoice' | 'performa_pdf' } = {
        'performa': 'performa_pdf',
        'picking': 'picking_list',
        'invoice': 'invoice'
      };

      // Iniciar upload por chunks
      // takeUntilDestroyed() automáticamente limpia la suscripción cuando el componente se destruye
      // Almacenar la suscripción para poder cancelarla explícitamente cuando se cierra el modal
      this.uploadSubscriptions[type] = this.chunkUploadService.uploadFile(file, fileTypeMap[type])
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (progress) => {
            // 🔍 DEBUG: Log del progreso recibido
            console.log(`[OrderModal] Progreso recibido para ${type}:`, {
              fileName: progress.fileName,
              percentage: progress.percentage,
              status: progress.status,
              tempPath: progress.tempPath
            });

            // ✅ FIX 2: Actualizar progreso solo si es el mismo archivo
            if (fileState.file === file) {
              fileState.progress = progress.percentage;

              // ✅ FIX 4: Forzar detección de cambios para actualizar la barra de progreso
              this.cdr.detectChanges();

              // ✅ FIX 3: Solo mostrar toast cuando realmente complete (status 'completed')
              if (progress.status === 'completed' && progress.tempPath) {
                fileState.uploading = false;
                fileState.completed = true;
                fileState.tempPath = progress.tempPath;
                fileState.progress = 100; // Asegurar que esté en 100%

                // Limpiar la referencia de suscripción ya que se completó
                this.uploadSubscriptions[type] = null;

                // 🔍 DEBUG: Log de completado en el componente
                console.log(`[OrderModal] ✅ Archivo completado:`, {
                  type,
                  tempPath: progress.tempPath,
                  uploading: fileState.uploading,
                  completed: fileState.completed
                });

                // ✅ FIX 4: Forzar detección de cambios para actualizar la vista
                this.cdr.detectChanges();

                this.toast.success(`${file.name} cargado exitosamente`);
              } else if (progress.status === 'error') {
                fileState.uploading = false;
                fileState.error = progress.error || 'Error al cargar archivo';

                // Limpiar la referencia de suscripción ya que terminó con error
                this.uploadSubscriptions[type] = null;

                console.log(`[OrderModal] ❌ Error en upload de ${type}:`, progress.error);

                this.toast.error(progress.error || 'Error al cargar archivo');

                // ✅ FIX 4: Forzar detección de cambios
                this.cdr.detectChanges();

                // Resetear input para permitir re-selección
                input.value = '';
              } else if (progress.status === 'cancelled') {
                // Manejar el estado de cancelado
                fileState.uploading = false;
                fileState.error = null;

                // Limpiar la referencia de suscripción
                this.uploadSubscriptions[type] = null;

                console.log(`[OrderModal] 🚫 Upload cancelado:`, { type });

                // Forzar detección de cambios
                this.cdr.detectChanges();

                // Resetear input para permitir re-selección
                input.value = '';
              }
            } else {
              // ⚠️ IMPORTANTE: Si el file no coincide, significa que se seleccionó otro archivo
              // mientras este upload estaba en curso. Esto NO debería pasar con nuestras validaciones.
              console.warn(`[OrderModal] ⚠️ Progreso recibido para archivo diferente:`, {
                type,
                currentFile: fileState.file?.name,
                progressFile: progress.fileName,
                action: 'Ignorando progreso'
              });
            }
          },
          error: (error) => {
            if (fileState.file === file) {
              fileState.uploading = false;
              fileState.error = 'Error al cargar archivo';

              // Limpiar la referencia de suscripción ya que terminó con error
              this.uploadSubscriptions[type] = null;

              this.toast.error('Error al cargar archivo. Intenta nuevamente.');
              console.error('Error uploading file:', error);
              // Resetear input para permitir re-selección
              input.value = '';
            }
          }
        });
    }
  }

  removeFile(type: 'performa' | 'picking' | 'invoice') {
    const fileState = this.fileStates[type];

    // Si el archivo está en proceso de carga, no permitir eliminarlo
    if (fileState.uploading) {
      this.toast.info('Espera a que termine la carga actual');
      return;
    }

    // ✅ FIX 4: Resetear el valor del input para permitir re-seleccionar el mismo archivo
    const inputRefs: { [key: string]: ElementRef<HTMLInputElement> | undefined } = {
      'performa': this.performaInput,
      'picking': this.packinInput,
      'invoice': this.invoiceInput
    };

    const inputRef = inputRefs[type];
    if (inputRef?.nativeElement) {
      inputRef.nativeElement.value = '';
    }

    // Resetear estado del archivo
    fileState.file = null;
    fileState.uploading = false;
    fileState.progress = 0;
    fileState.completed = false;
    fileState.tempPath = null;
    fileState.error = null;
  }

  getTitle(): string {
    const titles = {
      'create': 'Agregar nueva orden',
      'edit': 'Editar orden',
      'view': 'Orden'
    };
    return titles[this.mode];
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'pending': 'Pendiente',
      'processing': 'En Proceso',
      'shipped': 'En tránsito',
      'delivered': 'Entregada',
      'cancelled': 'Cancelada'
    };
    return statusLabels[status] || status;
  }

  downloadFile(type: 'picking-list' | 'invoice' | 'performa-pdf') {
    if (!this.orderId) return;
    this.orderService.downloadFile(this.orderId, type);
  }

  // Extrae el nombre del archivo desde el path del servidor
  getFileName(path: string | undefined): string | null {
    if (!path) return null;
    const parts = path.split('/');
    return parts[parts.length - 1] || null;
  }

  // Trunca el nombre del archivo a 20 caracteres
  truncateFileName(name: string | null | undefined): string {
    if (!name) return '';
    if (name.length <= 20) return name;
    return name.substring(0, 17) + '...';
  }

  onClose() {
    this.cancelActiveUploads();
    this.close.emit();
  }

  /**
   * Verifica si hay algún archivo subiendo actualmente
   */
  isAnyFileUploading(): boolean {
    return this.fileStates.picking.uploading ||
           this.fileStates.performa.uploading ||
           this.fileStates.invoice.uploading;
  }

  /**
   * Verifica si el botón de carga para un tipo específico debe estar deshabilitado
   * Se deshabilita si:
   * 1. El archivo del mismo tipo está subiendo, O
   * 2. Cualquier otro archivo está subiendo (para prevenir uploads simultáneos)
   */
  isFileUploadDisabled(type: 'performa' | 'picking' | 'invoice'): boolean {
    return this.isAnyFileUploading();
  }

  /**
   * Maneja el click en un botón de selección de archivo
   * Si hay uploads activos, muestra advertencia y no abre el file picker
   */
  handleFileButtonClick(type: 'performa' | 'picking' | 'invoice', inputElement: HTMLInputElement): void {
    // Si está deshabilitado por upload activo, mostrar advertencia
    if (this.isFileUploadDisabled(type)) {
      // Buscar qué archivo está subiendo
      const uploadingFiles: string[] = [];
      if (this.fileStates.picking.uploading && this.fileStates.picking.file) {
        uploadingFiles.push(`Picking list (${this.fileStates.picking.file.name})`);
      }
      if (this.fileStates.performa.uploading && this.fileStates.performa.file) {
        uploadingFiles.push(`Proforma (${this.fileStates.performa.file.name})`);
      }
      if (this.fileStates.invoice.uploading && this.fileStates.invoice.file) {
        uploadingFiles.push(`Factura (${this.fileStates.invoice.file.name})`);
      }

      this.toast.warning(`Ya hay un archivo cargando: ${uploadingFiles[0]}. Por favor espera a que termine.`);
      return;
    }

    // Si no está deshabilitado, abrir el file picker
    inputElement.click();
  }

  /**
   * Cancela todas las cargas activas de archivos
   * Se llama automáticamente cuando el modal se cierra
   */
  private cancelActiveUploads(): void {
    // Cancelar cada subscripción activa
    Object.entries(this.uploadSubscriptions).forEach(([type, subscription]) => {
      if (subscription && !subscription.closed) {
        subscription.unsubscribe();
        // Resetear la referencia
        this.uploadSubscriptions[type as keyof typeof this.uploadSubscriptions] = null;
      }
    });
  }

  /**
   * Valida si se puede subir un archivo dado el límite de uploads simultáneos
   * POLÍTICA: Solo se permite subir UN archivo a la vez para evitar timeouts y errores de concurrencia
   */
  private checkConcurrentUploadLimit(newFile: File): { allowed: boolean; message: string } {
    // Verificar si hay CUALQUIER archivo subiendo actualmente
    const uploadingFiles: string[] = [];

    if (this.fileStates.picking.uploading && this.fileStates.picking.file) {
      uploadingFiles.push(`Picking list (${this.fileStates.picking.file.name})`);
    }

    if (this.fileStates.performa.uploading && this.fileStates.performa.file) {
      uploadingFiles.push(`Proforma (${this.fileStates.performa.file.name})`);
    }

    if (this.fileStates.invoice.uploading && this.fileStates.invoice.file) {
      uploadingFiles.push(`Factura (${this.fileStates.invoice.file.name})`);
    }

    // Si no hay nada subiendo, permitir
    if (uploadingFiles.length === 0) {
      return { allowed: true, message: '' };
    }

    // Si hay archivos subiendo, bloquear el nuevo upload
    return {
      allowed: false,
      message: `Ya hay un archivo cargando: ${uploadingFiles[0]}. Por favor espera a que termine antes de subir otro archivo.`
    };
  }

  /**
   * Verifica si se puede guardar la orden
   * No se puede guardar si hay archivos en proceso de carga
   */
  canSaveOrder(): boolean {
    if (this.mode === 'view' || this.form.invalid) {
      return false;
    }

    const anyUploading =
      this.fileStates.performa.uploading ||
      this.fileStates.picking.uploading ||
      this.fileStates.invoice.uploading;

    return !anyUploading && !this.loading();
  }

  onSubmit() {
    if (!this.canSaveOrder()) return;

    this.loading.set(true);

    // Preparar datos del formulario
    const formData: OrderFormData = {
      ...this.form.value,
      // Enviar paths temporales en lugar de archivos directos
      temp_performa_pdf_path: this.fileStates.performa.tempPath || undefined,
      temp_packing_list_path: this.fileStates.picking.tempPath || undefined,
      temp_invoice_path: this.fileStates.invoice.tempPath || undefined,
    };

    // 🔍 DEBUG: Log de datos que se enviarán
    console.log('[OrderModal] Enviando orden con datos:', {
      mode: this.mode,
      formData,
      fileStates: {
        performa: {
          completed: this.fileStates.performa.completed,
          tempPath: this.fileStates.performa.tempPath
        },
        picking: {
          completed: this.fileStates.picking.completed,
          tempPath: this.fileStates.picking.tempPath
        },
        invoice: {
          completed: this.fileStates.invoice.completed,
          tempPath: this.fileStates.invoice.tempPath
        }
      }
    });

    if (this.mode === 'create') {
      this.orderService.createOrder(formData).subscribe({
        next: (response) => {
          this.loading.set(false);
          this.toast.success('Orden creada correctamente');
          this.save.emit(response.data);
          this.close.emit();
        },
        error: (error) => {
          console.error('Error creando orden:', error);
          this.toast.error(error.error?.message || 'Error al crear la orden');
          this.loading.set(false);
        }
      });
    } else if (this.mode === 'edit' && this.orderId) {
      this.orderService.updateOrder(this.orderId, formData).subscribe({
        next: (response) => {
          this.loading.set(false);
          this.toast.success('Orden actualizada correctamente');
          this.save.emit(response.data);
          this.close.emit();
        },
        error: (error) => {
          console.error('Error actualizando orden:', error);
          this.toast.error(error.error?.message || 'Error al actualizar la orden');
          this.loading.set(false);
        }
      });
    }
  }

  // ✅ No necesitamos ngOnDestroy con DestroyRef + takeUntilDestroyed
  // La limpieza es automática cuando el componente se destruye
}
