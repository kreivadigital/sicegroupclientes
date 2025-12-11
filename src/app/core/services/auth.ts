import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, User } from '../models/user.model';
import { UserRole } from '../models/enums';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly TOKEN_KEY = 'sice_token';
  private readonly USER_KEY = 'sice_user';
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // ✨ SIGNALS - Estado reactivo automático
  public currentUser = signal<User | null>(this.getUserFromStorage());
  private tokenSignal = signal<string | null>(this.getToken());

  // Computed signals (se actualizan automáticamente cuando un signal simple cambia)
  public isAuthenticated = computed(() => {
    const token = this.tokenSignal();
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  });

  public isAdmin = computed(() => this.currentUser()?.role === UserRole.Administrator);
  public isClient = computed(() => this.currentUser()?.role === UserRole.Client);

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  /**
   * Login del usuario
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${environment.apiBase}/auth/login`,
      credentials
    ).pipe(
      tap(response => {
        // Guardar token y usuario
        this.setToken(response.access_token);
        this.setUser(response.user);
        this.currentUser.set(response.user); // ✨ Actualiza el signal
      })
    );
  }

  /**
   * Logout del usuario
   */
  logout(): void {
    this.http.post(`${environment.apiBase}/auth/logout`, {}).subscribe({
      complete: () => {
        this.clearAuth();
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        // Aunque falle el API, limpiamos local
        this.clearAuth();
        this.router.navigate(['/auth/login']);
      }
    });
  }

  /**
   * Refrescar información del usuario actual
   */
  refreshUser(): Observable<User> {
    return this.http.get<User>(`${environment.apiBase}/user`).pipe(
      tap(user => {
        this.setUser(user);
        this.currentUser.set(user);
      })
    );
  }

  /**
   * Cambiar contraseña del usuario actual
   */
  changePassword(data: { current_password: string; password: string; password_confirmation: string }): Observable<any> {
    return this.http.post(`${environment.apiBase}/auth/password/change`, data);
  }

  /**
   * Solicitar reset de contraseña (envía nueva clave por email)
   */
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${environment.apiBase}/auth/password/reset-request`, { email });
  }

  // ==========================================
  // Métodos privados
  // ==========================================

  private setToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
    this.tokenSignal.set(token); // Actualiza el signal
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  private setUser(user: User): void {
    if (this.isBrowser) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  private getUserFromStorage(): User | null {
    if (this.isBrowser) {
      const userJson = localStorage.getItem(this.USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    }
    return null;
  }

  private clearAuth(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUser.set(null); // ✨ Limpia el signal
  }
}
