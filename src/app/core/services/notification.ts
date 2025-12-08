import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification, NotificationCreateData, NotificationUpdateData } from '../models/notification.model';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBase}/orders`;

  /**
   * Obtener notificaciones por orden
   * GET /orders/{orderId}/notifications
   */
  getNotificationsByOrder(orderId: number): Observable<ApiResponse<Notification[]>> {
    return this.http.get<ApiResponse<Notification[]>>(`${this.apiUrl}/${orderId}/notifications`);
  }

  /**
   * Crear una nueva notificación para una orden
   * POST /orders/{orderId}/notifications
   */
  createNotification(data: NotificationCreateData): Observable<ApiResponse<Notification>> {
    return this.http.post<ApiResponse<Notification>>(
      `${this.apiUrl}/${data.order_id}/notifications`,
      { type: data.type, message: data.message }
    );
  }

  /**
   * Actualizar una notificación existente
   * PUT /orders/{orderId}/notifications/{notificationId}
   */
  updateNotification(orderId: number, notificationId: number, data: NotificationUpdateData): Observable<ApiResponse<Notification>> {
    return this.http.put<ApiResponse<Notification>>(
      `${this.apiUrl}/${orderId}/notifications/${notificationId}`,
      data
    );
  }
}
