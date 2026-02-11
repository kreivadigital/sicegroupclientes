import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, OrderFormData } from '../models/order.model';
import { Note } from '../models/notification.model';
import { ApiResponse, PaginatedResponse } from '../interfaces/api-response.interface';

export interface OrderFilters {
  search?: string;
  estados?: string[];
  fechaDesde?: string;
  fechaHasta?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBase}/orders`;

  getOrders(page: number = 1, filters?: OrderFilters): Observable<PaginatedResponse<Order>> {
    let params = new HttpParams().set('page', page.toString());

    if (filters?.search) {
      params = params.set('search', filters.search);
    }

    if (filters?.estados && filters.estados.length > 0) {
      params = params.set('status', filters.estados.join(','));
    }

    if (filters?.fechaDesde) {
      params = params.set('fecha_desde', filters.fechaDesde);
    }

    if (filters?.fechaHasta) {
      params = params.set('fecha_hasta', filters.fechaHasta);
    }

    return this.http.get<PaginatedResponse<Order>>(this.apiUrl, { params });
  }

  getMyOrders(page: number = 1, filters?: OrderFilters): Observable<PaginatedResponse<Order>> {
    let params = new HttpParams().set('page', page.toString());

    if (filters?.search) {
      params = params.set('search', filters.search);
    }

    if (filters?.estados && filters.estados.length > 0) {
      params = params.set('status', filters.estados.join(','));
    }

    return this.http.get<PaginatedResponse<Order>>(`${this.apiUrl}/my`, { params });
  }

  getOrder(id: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.apiUrl}/${id}`);
  }

  createOrder(data: OrderFormData): Observable<ApiResponse<Order>> {
    const formData = new FormData();
    formData.append('client_id', data.client_id.toString());
    formData.append('delivery_address', data.delivery_address);
    formData.append('package_count', data.package_count.toString());
    formData.append('status', data.status);

    if (data.container_id) {
      formData.append('container_id', data.container_id.toString());
    }

    if (data.description) {
      formData.append('description', data.description);
    }

    // ✅ FIX: Agregar archivos directos (legacy - para compatibilidad)
    if (data.performa_pdf_file) {
      formData.append('performa_pdf_file', data.performa_pdf_file);
    }

    if (data.picking_list_file) {
      formData.append('picking_list_file', data.picking_list_file);
    }

    if (data.invoice_file) {
      formData.append('invoice_file', data.invoice_file);
    }

    // ✅ FIX: Agregar rutas temporales de archivos cargados por chunks
    if (data.temp_performa_pdf_path) {
      formData.append('temp_performa_pdf_path', data.temp_performa_pdf_path);
    }

    if (data.temp_packing_list_path) {
      formData.append('temp_packing_list_path', data.temp_packing_list_path);
    }

    if (data.temp_invoice_path) {
      formData.append('temp_invoice_path', data.temp_invoice_path);
    }

    return this.http.post<ApiResponse<Order>>(this.apiUrl, formData);
  }

  updateOrder(id: number, data: OrderFormData): Observable<ApiResponse<Order>> {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('client_id', data.client_id.toString());
    formData.append('delivery_address', data.delivery_address);
    formData.append('package_count', data.package_count.toString());
    formData.append('status', data.status);

    if (data.container_id) {
      formData.append('container_id', data.container_id.toString());
    }

    if (data.description) {
      formData.append('description', data.description);
    }

    // ✅ FIX: Agregar archivos directos (legacy - para compatibilidad)
    if (data.performa_pdf_file) {
      formData.append('performa_pdf_file', data.performa_pdf_file);
    }

    if (data.picking_list_file) {
      formData.append('picking_list_file', data.picking_list_file);
    }

    if (data.invoice_file) {
      formData.append('invoice_file', data.invoice_file);
    }

    // ✅ FIX: Agregar rutas temporales de archivos cargados por chunks
    if (data.temp_performa_pdf_path) {
      formData.append('temp_performa_pdf_path', data.temp_performa_pdf_path);
    }

    if (data.temp_packing_list_path) {
      formData.append('temp_packing_list_path', data.temp_packing_list_path);
    }

    if (data.temp_invoice_path) {
      formData.append('temp_invoice_path', data.temp_invoice_path);
    }

    return this.http.post<ApiResponse<Order>>(`${this.apiUrl}/${id}`, formData);
  }

  deleteOrder(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  attachContainer(orderId: number, containerId: number): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(
      `${this.apiUrl}/${orderId}/attach-container`,
      { container_id: containerId }
    );
  }

  detachContainer(orderId: number, containerId: number): Observable<ApiResponse<Order>> {
    return this.http.delete<ApiResponse<Order>>(
      `${this.apiUrl}/${orderId}/detach-container/${containerId}`
    );
  }

  getStats(): Observable<ApiResponse<OrderStats>> {
    return this.http.get<ApiResponse<OrderStats>>(`${this.apiUrl}/stats`);
  }

  /**
   * Obtiene las notas/notificaciones de una orden
   */
  getOrderNotes(orderId: number): Observable<OrderNotesResponse> {
    return this.http.get<OrderNotesResponse>(`${this.apiUrl}/${orderId}/notes`);
  }

  /**
   * Descarga un archivo desde el servidor.
   * @param orderId Número de orden que se relaciona con el archivo.
   * @param type Tipo de archivo que se desea descargar. Puede ser 'picking-list', 'invoice' o 'performa-pdf'.
   */
  downloadFile(orderId: number, type: 'picking-list' | 'invoice' | 'performa-pdf'): void {
    const url = `${this.apiUrl}/${orderId}/files/${type}`;

    this.http.get(url, {
      responseType: 'blob',
      observe: 'response'
    }).subscribe({
      next: (response) => {
        // Obtener el nombre del archivo desde el header Content-Disposition
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename: string;

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          } else {
            // Si no hay filename en Content-Disposition, determinar por Content-Type
            filename = this.getFilenameFromContentType(response.headers.get('Content-Type'), type);
          }
        } else {
          // Si no hay Content-Disposition, determinar por Content-Type
          filename = this.getFilenameFromContentType(response.headers.get('Content-Type'), type);
        }

        // Crear blob y descargar
        const blob = response.body;
        if (blob) {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }
      },
      error: (error) => {
        console.error('Error descargando archivo:', error);
      }
    });
  }

  /**
   * Genera un nombre de archivo basado en el Content-Type y el tipo de archivo.
   * Si el Content-Type no se puede determinar, se usa un mapeo manual para determinar la extensión.
   * @param contentType Content-Type del archivo.
   * @param type Tipo de archivo que se desea descargar. Puede ser 'picking-list', 'invoice' o 'performa-pdf'.
   * @returns Un nombre de archivo con la extensión correspondiente.
   */
  private getFilenameFromContentType(contentType: string | null, type: string): string {
    // Mapeo de Content-Type a extensión
    const mimeToExtension: { [key: string]: string } = {
      'application/pdf': 'pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'application/vnd.ms-excel': 'xls',
      'text/csv': 'csv'
    };

    // Obtener extensión desde Content-Type
    let extension = 'pdf'; // default
    if (contentType) {
      extension = mimeToExtension[contentType] || 'pdf';
    }

    // Si no se pudo determinar por Content-Type, usar mapeo manual
    if (extension === 'pdf' && type === 'picking-list') {
      extension = 'xlsx';
    }

    // Generar nombre de archivo
    const typeNames: { [key: string]: string } = {
      'picking-list': 'picking_list',
      'invoice': 'invoice',
      'performa-pdf': 'proforma'
    };

    return `${typeNames[type] || type}.${extension}`;
  }
}

export interface OrderStats {
  total: number;
  in_transit: number;
  delivered: number;
  delayed: number;
}

export interface OrderNotesResponse {
  data: Note[];
}
