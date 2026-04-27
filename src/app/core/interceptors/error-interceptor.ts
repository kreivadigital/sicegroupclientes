import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../services/auth';

const AUTH_PROBE_PATHS = ['/auth/me', '/auth/login', '/auth/logout'];

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const isProbe = AUTH_PROBE_PATHS.some(path => req.url.includes(path));

        // Solo forzar logout si había sesión activa Y la request fallida no es
        // del propio flujo de auth (login/logout/me) — evita loops y mensajes
        // espurios al cargar la app sin sesión.
        if (!isProbe && authService.isAuthenticated()) {
          authService.logout();
        }
      }

      if (error.status === 403) {
        console.error('No tienes permisos para realizar esta acción');
      }

      if (error.status === 500) {
        console.error('Error interno del servidor');
      }

      return throwError(() => error);
    })
  );
};
