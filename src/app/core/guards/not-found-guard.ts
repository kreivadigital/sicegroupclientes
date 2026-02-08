import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth } from '../services/auth';

/**
 * Guard para rutas no encontradas (404)
 * - Si está autenticado: redirige al inicio según su rol
 * - Si no está autenticado: redirige al login
 */
export const notFoundGuard: CanActivateFn = () => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    // Usuario autenticado: redirigir según rol
    if (authService.isAdmin()) {
      router.navigate(['/admin/contenedores']);
    } else {
      router.navigate(['/client/dashboard']);
    }
  } else {
    // No autenticado: redirigir al login
    router.navigate(['/auth/login']);
  }

  return false; // Siempre bloquea la ruta actual y redirige
};
