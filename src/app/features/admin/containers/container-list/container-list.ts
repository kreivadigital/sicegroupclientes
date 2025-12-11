import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContainerService } from '../../../../core/services/container.service';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { Container } from '../../../../core/models/container.model';
import { ContainerStatusLabels, ContainerStatusColors } from '../../../../core/models/enums';
import { TableColumn, TableAction } from '../../../../shared/interfaces/table.interface';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { SearchBar } from '../../../../shared/components/search-bar/search-bar';
import { ContainerModal } from '../container-modal/container-modal';
import { ContainerTrackingModal } from '../../../../shared/components/container-tracking-modal/container-tracking-modal';

@Component({
  selector: 'app-container-list',
  imports: [CommonModule, StatCard, DataTable, Pagination, SearchBar, ContainerModal, ContainerTrackingModal],
  templateUrl: './container-list.html',
  styleUrl: './container-list.scss',
})
export class ContainerList implements OnInit {
  private containerService = inject(ContainerService);
  private dashboardService = inject(DashboardService);

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

  // Import state
  importing = signal<boolean>(false);

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
          'UNTRACKED': 'danger'        // Rojo - Sin Rastreo
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
        dateKey: 'created_at'
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
      key: 'transit_percentage',
      label: '% de Tránsito',
      type: 'progress'
    }
  ];

  // Configuración de acciones (botones en última columna)
  actions: TableAction[] = [
    { icon: 'bi-eye', tooltip: 'Ver', action: 'view', class: 'btn-outline-dark' },
    { icon: 'bi-trash', tooltip: 'Eliminar', action: 'delete', class: 'btn-outline-danger' }
  ];

  ngOnInit() {
    this.loadStats();
    this.loadContainers();
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
        const containers = paginationData.data || [];

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

  onTableAction(event: { action: string; row: Container }) {
    const { action, row } = event;

    switch (action) {
      case 'view':
        this.selectedContainerId.set(row.id);
        this.showTrackingModal.set(true);
        break;
      case 'delete':
        this.onDeleteContainer(row);
        break;
    }
  }

  onDeleteContainer(container: Container) {
    const confirmMessage = `¿Está seguro de eliminar el contenedor "${container.container_number}"?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    this.containerService.deleteContainer(container.id).subscribe({
      next: () => {
        // Recargar la lista después de eliminar
        this.loadContainers(this.currentPage(), this.currentSearch());
        this.loadStats();
      },
      error: (error) => {
        console.error('Error eliminando contenedor:', error);
        alert('Error al eliminar el contenedor');
      }
    });
  }

  onModalClose() {
    this.showModal.set(false);
    this.selectedContainerId.set(undefined);
  }

  onTrackingModalClose() {
    this.showTrackingModal.set(false);
    this.selectedContainerId.set(undefined);
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
}
