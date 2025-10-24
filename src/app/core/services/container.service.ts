import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Container, ContainerFormData, Movement, ContainerLiveStatus } from '../models/container.model';
import { ApiResponse, PaginatedResponse } from '../interfaces/api-response.interface';

export interface ContainerFilters {
  search?: string;
  estados?: string[];
  salidaDesde?: string;
  salidaHasta?: string;
  llegadaDesde?: string;
  llegadaHasta?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContainerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBase}/containers`;

  getContainers(page: number = 1, filters?: ContainerFilters): Observable<PaginatedResponse<Container>> {
    let params = new HttpParams().set('page', page.toString());

    if (filters?.search) {
      params = params.set('search', filters.search);
    }

    if (filters?.estados && filters.estados.length > 0) {
      params = params.set('status', filters.estados.join(','));
    }

    if (filters?.salidaDesde) {
      params = params.set('salida_desde', filters.salidaDesde);
    }

    if (filters?.salidaHasta) {
      params = params.set('salida_hasta', filters.salidaHasta);
    }

    if (filters?.llegadaDesde) {
      params = params.set('llegada_desde', filters.llegadaDesde);
    }

    if (filters?.llegadaHasta) {
      params = params.set('llegada_hasta', filters.llegadaHasta);
    }

    return this.http.get<PaginatedResponse<Container>>(this.apiUrl, { params });
  }

  getContainer(id: number): Observable<ApiResponse<Container>> {
    return this.http.get<ApiResponse<Container>>(`${this.apiUrl}/${id}`);
  }

  createContainer(data: ContainerFormData): Observable<ApiResponse<Container>> {
    return this.http.post<ApiResponse<Container>>(this.apiUrl, data);
  }

  updateContainer(id: number, data: ContainerFormData): Observable<ApiResponse<Container>> {
    return this.http.put<ApiResponse<Container>>(`${this.apiUrl}/${id}`, data);
  }

  deleteContainer(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getContainerMovements(id: number): Observable<ApiResponse<Movement[]>> {
    return this.http.get<ApiResponse<Movement[]>>(`${this.apiUrl}/${id}/movements`);
  }

  getContainerLiveStatus(id: number): Observable<ApiResponse<ContainerLiveStatus>> {
    return this.http.get<ApiResponse<ContainerLiveStatus>>(`${this.apiUrl}/${id}/live-status`);
  }

  refreshContainerFromShipsGo(id: number): Observable<ApiResponse<Container>> {
    return this.http.get<ApiResponse<Container>>(`${this.apiUrl}/${id}/refresh`);
  }
}
