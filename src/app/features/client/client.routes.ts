import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Profile } from './profile/profile';

export const clientRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: Dashboard,
    title: 'Dashboard - Sice Group'
  },
  {
    path: 'perfil',
    component: Profile,
    title: 'Mi Perfil - Sice Group'
  }
];
