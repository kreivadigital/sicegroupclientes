import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../services/auth';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(Auth);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token inválido o expirado - forzar logout
        authService.logout();
      }

      if (error.status === 403) {
        // Sin permisos
        console.error('No tienes permisos para realizar esta acción');
      }

      if (error.status === 500) {
        // Error del servidor
        console.error('Error interno del servidor');
      }

      return throwError(() => error);
    })
  );
};
