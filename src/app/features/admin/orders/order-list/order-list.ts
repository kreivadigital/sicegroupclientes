import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../../core/services/order.service';
import { Auth } from '../../../../core/services/auth';
import { Order } from '../../../../core/models/order.model';
import { TableColumn, TableAction } from '../../../../shared/interfaces/table.interface';
import { PageToolbar } from '../../../../shared/components/page-toolbar/page-toolbar';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { OrderModal } from '../../../../shared/components/order-modal/order-modal';
import { ContainerTrackingModal } from '../../../../shared/components/container-tracking-modal/container-tracking-modal';
import { NotificationModal } from '../../../../shared/components/notification-modal/notification-modal';

@Component({
  selector: 'app-order-list',
  imports: [CommonModule, PageToolbar, DataTable, Pagination, OrderModal, ContainerTrackingModal, NotificationModal],
  templateUrl: './order-list.html',
  styleUrl: './order-list.scss',
})
export class OrderList implements OnInit {
  private orderService = inject(OrderService);
  private auth = inject(Auth);

  // State management con signals
  orders = signal<Order[]>([]);
  loading = signal<boolean>(false);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  totalItems = signal<number>(0);
  perPage = signal<number>(15);

  // Búsqueda actual
  currentSearch = signal<string>('');

  // Modal state
  showModal = signal<boolean>(false);
  showTrackingModal = signal<boolean>(false);
  modalMode = signal<'create' | 'edit' | 'view'>('create');
  selectedOrderId = signal<number | undefined>(undefined);

  // Para el modal de tracking
  selectedContainerId = signal<number | undefined>(undefined);
  selectedOrderNumber = signal<number | undefined>(undefined);

  // Para el modal de notificaciones
  showNotificationModal = signal<boolean>(false);
  selectedNotificationOrderId = signal<number | undefined>(undefined);
  selectedNotificationOrderNumber = signal<number | undefined>(undefined);

  // Configuración de columnas
  columns: TableColumn[] = [
    { key: 'id', label: 'Nro. de Orden', type: 'text' },
    { key: 'client.company_name', label: 'Cliente', type: 'text' },
    {
      key: 'status',
      label: 'Estado',
      type: 'badge',
      badgeConfig: {
        // Mapeo de valores backend a clases Bootstrap
        colorMap: {
          'pending': 'warning',
          'processing': 'info',
          'shipped': 'warning',      // En tránsito - amarillo
          'delivered': 'success',     // Entregada - verde
          'cancelled': 'danger'       // Retrasado/Cancelado - rojo
        },
        // Mapeo de valores backend a texto en español
        labelMap: {
          'pending': 'Pendiente',
          'processing': 'En Proceso',
          'shipped': 'En tránsito',
          'delivered': 'Entregada',
          'cancelled': 'Retrasado'
        }
      }
    },
    {
      key: 'container.date_of_discharge',
      label: 'Llegada Estimada',
      type: 'date',
      pipe: 'date'
    }
  ];

  // Configuración de acciones (botones en última columna)
  // Admin ve: Ver, Editar, Notificación
  // Cliente ve: Ver, Editar, Rastrear
  actions = computed<TableAction[]>(() => {
    const baseActions: TableAction[] = [
      { icon: 'bi-eye', tooltip: 'Ver', action: 'view', class: 'btn-outline-primary' },
      { icon: 'bi-pencil', tooltip: 'Editar', action: 'edit', class: 'btn-outline-secondary' }
    ];

    if (this.auth.isAdmin()) {
      return [...baseActions, { icon: 'bi-bell', tooltip: 'Notificación', action: 'notify', class: 'btn-outline-success' }];
    }

    return [...baseActions, { icon: 'bi-geo-alt', tooltip: 'Rastrear', action: 'track', class: 'btn-outline-success' }];
  });

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders(page: number = 1, search?: string) {
    this.loading.set(true);

    const filters = search ? { search } : undefined;

    this.orderService.getOrders(page, filters).subscribe({
      next: (response) => {
        // Laravel retorna estructura nested: { data: { data: [...], current_page: 1 } }
        const paginationData = response.data as any;
        const orders = paginationData.data || [];

        this.orders.set(orders);
        this.currentPage.set(paginationData.current_page);
        this.totalPages.set(paginationData.last_page);
        this.totalItems.set(paginationData.total);
        this.perPage.set(paginationData.per_page);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error cargando órdenes:', error);
        this.loading.set(false);
      }
    });
  }

  onSearch(searchTerm: string) {
    this.currentSearch.set(searchTerm);
    this.loadOrders(1, searchTerm);
  }

  onAddOrder() {
    this.modalMode.set('create');
    this.selectedOrderId.set(undefined);
    this.showModal.set(true);
  }

  onTableAction(event: { action: string; row: Order }) {
    const { action, row } = event;

    switch (action) {
      case 'view':
        this.modalMode.set('view');
        this.selectedOrderId.set(row.id);
        this.showModal.set(true);
        break;
      case 'edit':
        this.modalMode.set('edit');
        this.selectedOrderId.set(row.id);
        this.showModal.set(true);
        break;
      case 'track':
        if (row.container_id) {
          this.selectedContainerId.set(row.container_id);
          this.selectedOrderNumber.set(row.id);
          this.showTrackingModal.set(true);
        }
        break;
      case 'notify':
        this.selectedNotificationOrderId.set(row.id);
        this.selectedNotificationOrderNumber.set(row.id);
        this.showNotificationModal.set(true);
        break;
    }
  }

  onModalClose() {
    this.showModal.set(false);
    this.selectedOrderId.set(undefined);
  }

  onTrackingModalClose() {
    this.showTrackingModal.set(false);
    this.selectedContainerId.set(undefined);
    this.selectedOrderNumber.set(undefined);
  }

  onNotificationModalClose() {
    this.showNotificationModal.set(false);
    this.selectedNotificationOrderId.set(undefined);
    this.selectedNotificationOrderNumber.set(undefined);
  }

  onOrderSaved(order: Order) {
    // Recargar la lista
    this.loadOrders(this.currentPage(), this.currentSearch());
  }

  onPageChange(page: number) {
    this.loadOrders(page, this.currentSearch());
  }
}
