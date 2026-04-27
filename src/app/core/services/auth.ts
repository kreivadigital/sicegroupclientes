import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError, shareReplay, finalize, map } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, User } from '../models/user.model';
import { UserRole } from '../models/enums';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // ✨ SIGNALS - Estado reactivo automático
  public currentUser = signal<User | null>(null);

  // Observable compartido del refresh en vuelo. Si N requests reciben 401
  // al mismo tiempo, todos esperan al MISMO refresh en lugar de disparar N.
  private refreshing$: Observable<void> | null = null;

  // Computed signals (se actualizan automáticamente cuando un signal simple cambia)
  public isAuthenticated = computed(() => this.currentUser() !== null);

  public isSuperAdmin = computed(() => this.currentUser()?.role === UserRole.SuperAdmin);
  public isAdmin = computed(() =>
    this.currentUser()?.role === UserRole.Administrator ||
    this.currentUser()?.role === UserRole.SuperAdmin
  );
  public isClient = computed(() => this.currentUser()?.role === UserRole.Client);

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  /**
   * Login del usuario. La cookie httpOnly la setea el backend.
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${environment.apiBase}/auth/login`,
      credentials
    ).pipe(
      tap(response => {
        this.currentUser.set(response.user);
      })
    );
  }

  /**
   * Logout del usuario. El backend invalida el token y borra la cookie.
   */
  logout(): void {
    this.http.post(`${environment.apiBase}/auth/logout`, {}).subscribe({
      complete: () => this.finalizeLogout(),
      error: () => this.finalizeLogout(),
    });
  }

  /**
   * Verifica si hay sesión activa consultando al backend.
   * Usado en boot del app para rehidratar el estado.
   */
  fetchCurrentUser(): Observable<User | null> {
    if (!this.isBrowser) return of(null);

    return this.http.get<User>(`${environment.apiBase}/auth/me`).pipe(
      tap(user => this.currentUser.set(user)),
      catchError(() => {
        this.currentUser.set(null);
        return of(null);
      })
    );
  }

  /**
   * Renueva el JWT (cookie httpOnly) llamando a /auth/refresh.
   * Si hay un refresh en vuelo, devuelve el mismo Observable para evitar
   * disparar multiples llamadas concurrentes.
   */
  refresh(): Observable<void> {
    if (this.refreshing$) return this.refreshing$;

    this.refreshing$ = this.http
      .post<{ message: string }>(`${environment.apiBase}/auth/refresh`, {})
      .pipe(
        map(() => undefined as void),
        finalize(() => { this.refreshing$ = null; }),
        shareReplay(1)
      );

    return this.refreshing$;
  }

  /**
   * Refrescar información del usuario actual
   */
  refreshUser(): Observable<User> {
    return this.http.get<User>(`${environment.apiBase}/user`).pipe(
      tap(user => this.currentUser.set(user))
    );
  }

  /**
   * Cambiar contraseña del usuario actual
   */
  changePassword(data: { current_password: string; password: string; password_confirmation: string }): Observable<any> {
    return this.http.post(`${environment.apiBase}/auth/password/change`, data);
  }

  /**
   * Actualizar perfil del usuario actual (name, email)
   */
  updateProfile(data: { name: string; email: string }): Observable<User> {
    return this.http.put<User>(`${environment.apiBase}/user`, data).pipe(
      tap(user => this.currentUser.set(user))
    );
  }

  /**
   * Solicitar reset de contraseña (envía nueva clave por email)
   */
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${environment.apiBase}/auth/password/reset-request`, { email });
  }

  /**
   * Limpia el estado local y redirige a login. La cookie ya fue invalidada
   * por el backend en /auth/logout.
   */
  private finalizeLogout(): void {
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }
}
