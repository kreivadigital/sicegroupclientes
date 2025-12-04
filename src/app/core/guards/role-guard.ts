import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth } from '../services/auth';

/**
 * Guard para proteger rutas de administrador
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(Auth);
  const router = inject(Router);

  // ✨ Signals se leen con ()
  if (authService.isAdmin()) {
    return true;
  }

  // Si no es admin, redirigir al dashboard de cliente
  router.navigate(['/client/dashboard']);
  return false;
};

/**
 * Guard para proteger rutas de cliente
 */
export const clientGuard: CanActivateFn = () => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (authService.isClient()) {
    return true;
  }

  // Si no es cliente, redirigir al dashboard de admin
  router.navigate(['/admin/dashboard']);
  return false;
};
