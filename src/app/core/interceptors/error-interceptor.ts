import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { Auth } from '../services/auth';

const AUTH_PROBE_PATHS = ['/auth/me', '/auth/login', '/auth/logout', '/auth/refresh'];

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const isProbe = AUTH_PROBE_PATHS.some(path => req.url.includes(path));

        // Intentar refresh + retry solo si:
        // - habia sesion activa
        // - la request fallida no es del propio flujo de auth (evita loops)
        if (!isProbe && authService.isAuthenticated()) {
          return authService.refresh().pipe(
            switchMap(() => next(req)),
            catchError(() => {
              authService.logout();
              return throwError(() => error);
            })
          );
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
