import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard, clientGuard } from './core/guards/role-guard';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { MainLayout } from './layouts/main-layout/main-layout';

export const routes: Routes = [
  // Ruta raíz redirige a login
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },

  // Módulo de autenticación (público - layout sin sidebar)
  {
    path: 'auth',
    component: AuthLayout,
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },

  // Módulo de admin (protegido - layout con sidebar)
  {
    path: 'admin',
    component: MainLayout,
    canActivate: [authGuard, adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes)
  },

  // Módulo de cliente (protegido - layout con sidebar)
  {
    path: 'client',
    component: MainLayout,
    canActivate: [authGuard, clientGuard],
    loadChildren: () => import('./features/client/client.routes').then(m => m.clientRoutes)
  },

  // 404 - Redirige a login
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
