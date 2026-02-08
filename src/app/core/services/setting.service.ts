import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  SettingUpdateData,
  SettingsResponse,
  SettingGroupResponse,
  SettingResponse,
} from '../models/setting.model';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBase}/settings`;

  /**
   * Obtener todos los settings agrupados
   */
  getSettings(): Observable<SettingsResponse> {
    return this.http.get<SettingsResponse>(this.apiUrl);
  }

  /**
   * Obtener settings de un grupo específico
   */
  getSettingsByGroup(group: string): Observable<SettingGroupResponse> {
    return this.http.get<SettingGroupResponse>(`${this.apiUrl}/${group}`);
  }

  /**
   * Actualizar el valor de un setting existente
   */
  updateSetting(id: number, data: SettingUpdateData): Observable<SettingResponse> {
    return this.http.put<SettingResponse>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Limpiar cache de settings
   */
  clearCache(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/clear-cache`, {});
  }
}
