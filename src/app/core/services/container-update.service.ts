import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContainerUpdate } from '../models/container-update.model';
import { PaginatedResponse } from '../interfaces/api-response.interface';

export interface ContainerUpdateFilters {
  container_number?: string;
  source?: 'webhook' | 'sync';
}

@Injectable({
  providedIn: 'root',
})
export class ContainerUpdateService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBase}/container-updates`;

  getUpdates(page: number = 1, filters?: ContainerUpdateFilters): Observable<PaginatedResponse<ContainerUpdate>> {
    let params = new HttpParams().set('page', page.toString());

    if (filters?.container_number) {
      params = params.set('container_number', filters.container_number);
    }

    if (filters?.source) {
      params = params.set('source', filters.source);
    }

    return this.http.get<PaginatedResponse<ContainerUpdate>>(this.apiUrl, { params });
  }
}
