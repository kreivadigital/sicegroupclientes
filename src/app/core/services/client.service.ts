import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Client, ClientFormData } from '../models/client.model';
import { ApiResponse, PaginatedResponse } from '../interfaces/api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBase}/clients`;

  getClients(page: number = 1, search?: string): Observable<PaginatedResponse<Client>> {
    let params = new HttpParams().set('page', page.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedResponse<Client>>(this.apiUrl, { params });
  }

  getClient(id: number): Observable<ApiResponse<Client>> {
    return this.http.get<ApiResponse<Client>>(`${this.apiUrl}/${id}`);
  }

  createClient(data: ClientFormData): Observable<ApiResponse<Client>> {
    return this.http.post<ApiResponse<Client>>(this.apiUrl, data);
  }

  updateClient(id: number, data: ClientFormData): Observable<ApiResponse<Client>> {
    return this.http.put<ApiResponse<Client>>(`${this.apiUrl}/${id}`, data);
  }

  deleteClient(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getTrashedClients(): Observable<PaginatedResponse<Client>> {
    return this.http.get<PaginatedResponse<Client>>(`${this.apiUrl}/trashed`);
  }

  restoreClient(id: number): Observable<ApiResponse<Client>> {
    return this.http.post<ApiResponse<Client>>(`${this.apiUrl}/${id}/restore`, {});
  }
}
