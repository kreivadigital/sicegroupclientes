import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, OrderFormData } from '../models/order.model';
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
    formData.append('status', data.status);

    if (data.container_id) {
      formData.append('container_id', data.container_id.toString());
    }

    if (data.description) {
      formData.append('description', data.description);
    }

    if (data.performa_pdf) {
      formData.append('performa_pdf', data.performa_pdf);
    }

    return this.http.post<ApiResponse<Order>>(this.apiUrl, formData);
  }

  updateOrder(id: number, data: OrderFormData): Observable<ApiResponse<Order>> {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('client_id', data.client_id.toString());
    formData.append('status', data.status);

    if (data.container_id) {
      formData.append('container_id', data.container_id.toString());
    }

    if (data.description) {
      formData.append('description', data.description);
    }

    if (data.performa_pdf) {
      formData.append('performa_pdf', data.performa_pdf);
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
}
