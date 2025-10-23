import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { MyOrders } from './orders/my-orders/my-orders';
import { OrderDetail } from './orders/order-detail/order-detail';
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
    path: 'ordenes',
    component: MyOrders,
    title: 'Mis Órdenes - Sice Group'
  },
  {
    path: 'ordenes/:id',
    component: OrderDetail,
    title: 'Detalle Orden - Sice Group'
  },
  {
    path: 'profile',
    component: Profile,
    title: 'Mi Perfil - Sice Group'
  }
];
