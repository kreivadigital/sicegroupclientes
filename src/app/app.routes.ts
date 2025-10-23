import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard, clientGuard } from './core/guards/role-guard';

export const routes: Routes = [
  // Ruta raíz redirige a login
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },

  // Módulo de autenticación (público - lazy loaded)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },

  // Módulo de admin (protegido - lazy loaded)
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes)
  },

  // Módulo de cliente (protegido - lazy loaded)
  {
    path: 'client',
    canActivate: [authGuard, clientGuard],
    loadChildren: () => import('./features/client/client.routes').then(m => m.clientRoutes)
  },

  // 404 - Redirige a login
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
