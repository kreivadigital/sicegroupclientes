import { Routes } from '@angular/router';
import { ClientList } from './clients/client-list/client-list';
import { ClientForm } from './clients/client-form/client-form';
import { ClientDetail } from './clients/client-detail/client-detail';
import { OrderList } from './orders/order-list/order-list';
import { OrderForm } from './orders/order-form/order-form';
import { OrderDetail } from './orders/order-detail/order-detail';
import { ContainerList } from './containers/container-list/container-list';
import { ContainerForm } from './containers/container-form/container-form';
import { ContainerDetail } from './containers/container-detail/container-detail';

export const adminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'contenedores',
    pathMatch: 'full'
  },
  // Clients Routes
  {
    path: 'clientes',
    component: ClientList,
    title: 'Clientes - Admin - Sice Group'
  },
  {
    path: 'clientes/new',
    component: ClientForm,
    title: 'Nuevo Cliente - Admin - Sice Group'
  },
  {
    path: 'clientes/:id',
    component: ClientDetail,
    title: 'Detalle Cliente - Admin - Sice Group'
  },
  {
    path: 'clientes/:id/edit',
    component: ClientForm,
    title: 'Editar Cliente - Admin - Sice Group'
  },
  // Orders Routes
  {
    path: 'ordenes',
    component: OrderList,
    title: 'Órdenes - Admin - Sice Group'
  },
  {
    path: 'ordenes/new',
    component: OrderForm,
    title: 'Nueva Orden - Admin - Sice Group'
  },
  {
    path: 'ordenes/:id',
    component: OrderDetail,
    title: 'Detalle Orden - Admin - Sice Group'
  },
  {
    path: 'ordenes/:id/edit',
    component: OrderForm,
    title: 'Editar Orden - Admin - Sice Group'
  },
  // Containers Routes (Dashboard)
  {
    path: 'contenedores',
    component: ContainerList,
    title: 'Dashboard - Admin - Sice Group'
  },
  {
    path: 'contenedores/new',
    component: ContainerForm,
    title: 'Nuevo Contenedor - Admin - Sice Group'
  },
  {
    path: 'contenedores/:id',
    component: ContainerDetail,
    title: 'Detalle Contenedor - Admin - Sice Group'
  },
  {
    path: 'contenedores/:id/edit',
    component: ContainerForm,
    title: 'Editar Contenedor - Admin - Sice Group'
  }
];
