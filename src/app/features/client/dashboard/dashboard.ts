import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../../core/services/auth';
import { StatCard } from '../../../shared/components/stat-card/stat-card';
import { DataTable } from '../../../shared/components/data-table/data-table';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { OrderModal } from '../../../shared/components/order-modal/order-modal';
import { ContainerTrackingModal } from '../../../shared/components/container-tracking-modal/container-tracking-modal';
import { OrderService, OrderStats } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';
import { TableColumn, TableAction } from '../../../shared/interfaces/table.interface';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, StatCard, DataTable, Pagination, OrderModal, ContainerTrackingModal],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private orderService = inject(OrderService);
  public authService = inject(Auth);

  stats = signal<OrderStats>({
    total: 0,
    in_transit: 0,
    delivered: 0,
    delayed: 0
  });

  loading = signal(false);

  // State para la tabla de órdenes
  orders = signal<Order[]>([]);
  loadingOrders = signal(false);
  currentPage = signal(1);
  totalPages = signal(1);
  totalItems = signal(0);
  perPage = signal(15);

  // Modal state
  showModal = signal(false);
  showTrackingModal = signal(false);
  selectedOrderId = signal<number | undefined>(undefined);

  // Para el modal de tracking
  selectedContainerId = signal<number | undefined>(undefined);
  selectedOrderNumber = signal<number | undefined>(undefined);

  // Configuración de columnas de la tabla
  columns: TableColumn[] = [
    { key: 'id', label: 'Nro. de Orden', type: 'text' },
    { key: 'container.shipment_reference', label: 'Nro. de Referencia', type: 'text' },
    {
      key: 'status',
      label: 'Estado',
      type: 'badge',
      badgeConfig: {
        colorMap: {
          'pending': 'warning',
          'processing': 'info',
          'shipped': 'warning',
          'delivered': 'success',
          'cancelled': 'danger'
        },
        labelMap: {
          'pending': 'Pendiente',
          'processing': 'En Proceso',
          'shipped': 'En tránsito',
          'delivered': 'Entregada',
          'cancelled': 'Cancelada'
        }
      }
    },
    {
      key: 'origin',
      label: 'Puerto de Origen',
      type: 'port-with-date',
      portConfig: {
        locationKey: 'container.port_of_loading_name',
        countryKey: 'container.port_of_loading_country',
        dateKey: 'created_at'
      }
    },
    {
      key: 'destination',
      label: 'Puerto de Destino',
      type: 'port-with-date',
      portConfig: {
        locationKey: 'container.destination_port_name',
        countryKey: 'container.destination_port_country',
        dateKey: 'container.date_of_discharge'
      }
    }
  ];

  // Acciones de la tabla
  actions: TableAction[] = [
    { icon: 'bi-eye', tooltip: 'Ver', action: 'view', class: 'btn-outline-primary' },
    { icon: 'bi-geo-alt', tooltip: 'Rastrear', action: 'track', class: 'btn-outline-success' }
  ];

  ngOnInit() {
    this.loadStats();
    this.loadOrders();
  }

  loadStats() {
    this.loading.set(true);
    this.orderService.getStats().subscribe({
      next: (response) => {
        this.stats.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error cargando estadísticas:', error);
        this.loading.set(false);
      }
    });
  }

  loadOrders(page: number = 1) {
    this.loadingOrders.set(true);

    this.orderService.getMyOrders(page).subscribe({
      next: (response) => {
        const paginationData = response.data as any;
        const orders = paginationData.data || [];

        this.orders.set(orders);
        this.currentPage.set(paginationData.current_page);
        this.totalPages.set(paginationData.last_page);
        this.totalItems.set(paginationData.total);
        this.perPage.set(paginationData.per_page);
        this.loadingOrders.set(false);
      },
      error: (error) => {
        console.error('Error cargando órdenes:', error);
        this.loadingOrders.set(false);
      }
    });
  }

  onTableAction(event: { action: string; row: Order }) {
    const { action, row } = event;

    if (action === 'view') {
      this.selectedOrderId.set(row.id);
      this.showModal.set(true);
    } else if (action === 'track') {
      if (row.container_id) {
        this.selectedContainerId.set(row.container_id);
        this.selectedOrderNumber.set(row.id);
        this.showTrackingModal.set(true);
      }
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

  onOrderSaved(order: Order) {
    // Recargar estadísticas y órdenes después de guardar
    this.loadStats();
    this.loadOrders(this.currentPage());
    this.showModal.set(false);
  }

  onPageChange(page: number) {
    this.loadOrders(page);
  }
}
