import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';

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
  }
];
