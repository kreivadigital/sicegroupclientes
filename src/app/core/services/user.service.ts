import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../interfaces/api-response.interface';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'administrator' | 'client';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at?: string;
}

export interface UserCreateData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string;
}

export interface UserUpdateData {
  name: string;
  email: string;
  role: string;
  password?: string;
  password_confirmation?: string;
}

export interface UserRole {
  value: string;
  label: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBase}/users`;

  /**
   * Obtener lista de usuarios paginada
   */
  getUsers(page: number = 1, search?: string): Observable<PaginatedResponse<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', '15');

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedResponse<User>>(this.apiUrl, { params });
  }

  /**
   * Obtener un usuario por ID
   */
  getUser(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear un nuevo usuario
   */
  createUser(data: UserCreateData): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.apiUrl, data);
  }

  /**
   * Actualizar un usuario
   */
  updateUser(id: number, data: UserUpdateData): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Eliminar un usuario (soft delete)
   */
  deleteUser(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener roles disponibles
   */
  getRoles(): Observable<ApiResponse<UserRole[]>> {
    return this.http.get<ApiResponse<UserRole[]>>(`${this.apiUrl}/roles`);
  }
}
