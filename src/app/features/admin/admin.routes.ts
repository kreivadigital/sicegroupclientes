import { Routes } from '@angular/router';
import { AdminLayout } from './admin-layout/admin-layout';
import { Dashboard } from './dashboard/dashboard';
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
    component: AdminLayout,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: Dashboard,
        title: 'Dashboard - Admin - Sice Group'
      },
      // Clients Routes
      {
        path: 'clients',
        component: ClientList,
        title: 'Clientes - Admin - Sice Group'
      },
      {
        path: 'clients/new',
        component: ClientForm,
        title: 'Nuevo Cliente - Admin - Sice Group'
      },
      {
        path: 'clients/:id',
        component: ClientDetail,
        title: 'Detalle Cliente - Admin - Sice Group'
      },
      {
        path: 'clients/:id/edit',
        component: ClientForm,
        title: 'Editar Cliente - Admin - Sice Group'
      },
      // Orders Routes
      {
        path: 'orders',
        component: OrderList,
        title: 'Órdenes - Admin - Sice Group'
      },
      {
        path: 'orders/new',
        component: OrderForm,
        title: 'Nueva Orden - Admin - Sice Group'
      },
      {
        path: 'orders/:id',
        component: OrderDetail,
        title: 'Detalle Orden - Admin - Sice Group'
      },
      {
        path: 'orders/:id/edit',
        component: OrderForm,
        title: 'Editar Orden - Admin - Sice Group'
      },
      // Containers Routes
      {
        path: 'containers',
        component: ContainerList,
        title: 'Contenedores - Admin - Sice Group'
      },
      {
        path: 'containers/new',
        component: ContainerForm,
        title: 'Nuevo Contenedor - Admin - Sice Group'
      },
      {
        path: 'containers/:id',
        component: ContainerDetail,
        title: 'Detalle Contenedor - Admin - Sice Group'
      },
      {
        path: 'containers/:id/edit',
        component: ContainerForm,
        title: 'Editar Contenedor - Admin - Sice Group'
      }
    ]
  }
];
