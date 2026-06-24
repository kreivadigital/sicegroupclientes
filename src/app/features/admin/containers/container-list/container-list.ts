import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContainerService, SyncResult } from '../../../../core/services/container.service';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { Container } from '../../../../core/models/container.model';
import { ContainerStatusLabels, ContainerStatusColors } from '../../../../core/models/enums';
import { TableColumn, TableAction } from '../../../../shared/interfaces/table.interface';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { SearchBar } from '../../../../shared/components/search-bar/search-bar';
import { ContainerModal, CONTAINER_AUTO_OPEN_KEY } from '../container-modal/container-modal';
import { ContainerTrackingModal } from '../../../../shared/components/container-tracking-modal/container-tracking-modal';
import { ConfirmationModal } from '../../../../shared/components/confirmation-modal/confirmation-modal';
import { SyncResultModal } from '../sync-result-modal/sync-result-modal';

@Component({
  selector: 'app-container-list',
  imports: [CommonModule, StatCard, DataTable, Pagination, SearchBar, ContainerModal, ContainerTrackingModal, ConfirmationModal, SyncResultModal],
  templateUrl: './container-list.html',
  styleUrl: './container-list.scss',
})
export class ContainerList implements OnInit {
  private containerService = inject(ContainerService);
  private dashboardService = inject(DashboardService);
  private router = inject(Router);

  // State management con signals
  containers = signal<Container[]>([]);
  loading = signal<boolean>(false);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  totalItems = signal<number>(0);
  perPage = signal<number>(15);

  // Búsqueda actual
  currentSearch = signal<string>('');

  // Modal state
  showModal = signal(false);
  showTrackingModal = signal(false);
  modalMode = signal<'create' | 'edit'>('create');
  selectedContainerId = signal<number | undefined>(undefined);

  // Modal de confirmación de eliminación
  showDeleteConfirm = signal(false);
  containerToDelete = signal<Container | null>(null);

  // Import state
  importing = signal<boolean>(false);

  // Sync state
  syncing = signal<boolean>(false);
  showSyncResult = signal<boolean>(false);
  syncResult = signal<SyncResult | null>(null);

  // Dashboard stats
  totalClients = signal<number>(0);
  activeOrders = signal<number>(0);
  totalContainers = signal<number>(0);

  // Configuración de columnas
  columns: TableColumn[] = [
    { key: 'container_number', label: 'Nro. de Contenedor', type: 'text' },
    { key: 'shipment_reference', label: 'Ref. de Envío', type: 'text' },
    {
      key: 'status',
      label: 'Estado',
      type: 'badge',
      badgeConfig: {
        colorMap: {
          'NEW': 'secondary',          // Gris - Nuevo
          'INPROGRESS': 'info',        // Azul claro - En Progreso
          'BOOKED': 'primary',         // Azul - Reservado
          'LOADED': 'warning',         // Amarillo - Cargado
          'SAILING': 'primary',        // Azul - Navegando
          'ARRIVED': 'success',        // Verde - Arribado
          'DISCHARGED': 'success',     // Verde - Descargado
          'UNTRACKED': 'danger',       // Rojo - Sin Rastreo
          'CANCELLED': 'secondary'     // Gris - Cancelado
        },
        labelMap: ContainerStatusLabels as Record<string, string>
      }
    },
    {
      key: 'port_of_loading',
      label: 'Puerto de Origen',
      type: 'port-with-date',
      portConfig: {
        locationKey: 'port_of_loading_name',
        countryKey: 'port_of_loading_country',
        dateKey: 'origin_port_date'
      }
    },
    {
      key: 'destination_port',
      label: 'Puerto de Destino',
      type: 'port-with-date',
      portConfig: {
        locationKey: 'destination_port_name',
        countryKey: 'destination_port_country',
        dateKey: 'date_of_discharge'
      }
    },
    {
      key: 'calculated_transit_percentage',
      label: '% de Tránsito',
      type: 'progress'
    }
  ];

  // Configuración de acciones (botones en última columna)
  actions: TableAction[] = [
    { icon: 'bi-eye', tooltip: 'Ver', action: 'view', class: 'btn-outline-success' },
    { icon: 'bi-archive', tooltip: 'Ver órdenes', action: 'orders', class: 'btn-outline-primary' },
    { icon: 'bi-trash', tooltip: 'Eliminar', action: 'delete', class: 'btn-outline-danger' }
  ];

  ngOnInit() {
    this.loadStats();
    this.loadContainers();
    this.checkAutoOpenTrackingModal();
  }

  /**
   * Verifica si hay un contenedor guardado en sessionStorage para auto-abrir
   */
  private checkAutoOpenTrackingModal() {
    const savedContainerId = sessionStorage.getItem(CONTAINER_AUTO_OPEN_KEY);
    if (savedContainerId) {
      const containerId = parseInt(savedContainerId, 10);
      if (!isNaN(containerId)) {
        // Pequeño delay para asegurar que el componente esté listo
        setTimeout(() => {
          this.selectedContainerId.set(containerId);
          this.showTrackingModal.set(true);
        }, 100);
      }
    }
  }

  loadStats() {
    this.dashboardService.getStats().subscribe({
      next: (response) => {
        this.totalClients.set(response.data.total_clients);
        this.activeOrders.set(response.data.active_orders);
        this.totalContainers.set(response.data.total_containers);
      },
      error: (error) => {
        console.error('Error cargando estadísticas:', error);
      }
    });
  }

  loadContainers(page: number = 1, search?: string) {
    this.loading.set(true);

    const filters = search ? { search } : undefined;

    this.containerService.getContainers(page, filters).subscribe({
      next: (response) => {
        const paginationData = response.data as any;
        const containers = (paginationData.data || []).map((c: any) => ({
          ...c,
          origin_port_date: c.date_of_loading || c.created_at_shipsgo || null
        }));

        this.containers.set(containers);
        this.currentPage.set(paginationData.current_page);
        this.totalPages.set(paginationData.last_page);
        this.totalItems.set(paginationData.total);
        this.perPage.set(paginationData.per_page);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error cargando contenedores:', error);
        this.loading.set(false);
      }
    });
  }

  onSearch(searchTerm: string) {
    this.currentSearch.set(searchTerm);
    this.loadContainers(1, searchTerm);
  }

  onAddContainer() {
    this.modalMode.set('create');
    this.selectedContainerId.set(undefined);
    this.showModal.set(true);
  }

  // Deshabilita el botón "Ver órdenes" si el contenedor no tiene órdenes asociadas.
  // Arrow function para conservar el binding de this al pasarla al DataTable.
  isActionDisabled = (action: string, row: Container): boolean => {
    if (action === 'orders') {
      return !(row.orders_count && row.orders_count > 0);
    }
    return false;
  };

  onTableAction(event: { action: string; row: Container }) {
    const { action, row } = event;

    // Guard: no navegar si no tiene órdenes (botón deshabilitado igual)
    if (action === 'orders' && !(row.orders_count && row.orders_count > 0)) {
      return;
    }

    switch (action) {
      case 'view':
        this.selectedContainerId.set(row.id);
        this.showTrackingModal.set(true);
        break;
      case 'orders':
        // Ir a la pantalla de órdenes filtrada por este contenedor
        this.router.navigate(['/admin/ordenes'], { queryParams: { container_id: row.id } });
        break;
      case 'delete':
        this.onDeleteContainer(row);
        break;
    }
  }

  onDeleteContainer(container: Container) {
    this.containerToDelete.set(container);
    this.showDeleteConfirm.set(true);
  }

  onConfirmDelete() {
    const container = this.containerToDelete();
    if (!container) return;

    this.containerService.deleteContainer(container.id).subscribe({
      next: () => {
        this.showDeleteConfirm.set(false);
        this.containerToDelete.set(null);
        // Recargar la lista después de eliminar
        this.loadContainers(this.currentPage(), this.currentSearch());
        this.loadStats();
      },
      error: (error) => {
        console.error('Error eliminando contenedor:', error);
        this.showDeleteConfirm.set(false);
        this.containerToDelete.set(null);
      }
    });
  }

  onCancelDelete() {
    this.showDeleteConfirm.set(false);
    this.containerToDelete.set(null);
  }

  onModalClose() {
    this.showModal.set(false);
    this.selectedContainerId.set(undefined);
  }

  onTrackingModalClose() {
    this.showTrackingModal.set(false);
    this.selectedContainerId.set(undefined);
    // Limpiar sessionStorage al cerrar el modal de tracking
    sessionStorage.removeItem(CONTAINER_AUTO_OPEN_KEY);
  }

  onContainerSaved(container: Container) {
    this.loadContainers(this.currentPage(), this.currentSearch());
  }

  onPageChange(page: number) {
    this.loadContainers(page, this.currentSearch());
  }

  // Helpers para el template de cards
  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      'NEW': 'secondary',
      'INPROGRESS': 'info',
      'BOOKED': 'primary',
      'LOADED': 'warning',
      'SAILING': 'primary',
      'ARRIVED': 'success',
      'DISCHARGED': 'success',
      'UNTRACKED': 'danger'
    };
    return colorMap[status] || 'secondary';
  }

  getStatusLabel(status: string): string {
    return ContainerStatusLabels[status as keyof typeof ContainerStatusLabels] || status;
  }

  onImportFromShipsGo() {
    this.importing.set(true);
    console.log('🚀 Iniciando importación desde ShipsGo...');

    this.containerService.importFromShipsGo().subscribe({
      next: (response) => {
        console.log('✅ Importación exitosa:', response);
        this.importing.set(false);
        // Recargar la lista de contenedores
        this.loadContainers(this.currentPage(), this.currentSearch());
      },
      error: (error) => {
        console.error('❌ Error en importación:', error);
        this.importing.set(false);
      }
    });
  }

  /**
   * Sincroniza masivo los contenedores activos (no DISCHARGED/CANCELLED) contra ShipsGo.
   * Solo GET por shipsgo_shipment_id → no consume créditos.
   */
  onSyncContainers() {
    this.syncing.set(true);

    this.containerService.syncActiveContainers().subscribe({
      next: (res) => {
        this.syncing.set(false);
        this.syncResult.set(res);
        this.showSyncResult.set(true);
        // Recargar lista + stats con los datos actualizados
        this.loadContainers(this.currentPage(), this.currentSearch());
        this.loadStats();
      },
      error: (error) => {
        this.syncing.set(false);
        // Error de transporte/servidor: armamos un resultado mínimo para el modal
        this.syncResult.set({
          message: error.error?.message || 'Error al sincronizar contenedores',
          total: 0,
          synced: 0,
          changed: 0,
          unchanged: 0,
          failed: 1,
          changes: [],
          errors: [{
            container_number: '—',
            shipsgo_shipment_id: 0,
            error: error.error?.message || 'No se pudo completar la sincronización',
          }],
        });
        this.showSyncResult.set(true);
      }
    });
  }

  onCloseSyncResult() {
    this.showSyncResult.set(false);
  }
}
