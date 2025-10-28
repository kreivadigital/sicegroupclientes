import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContainerService } from '../../../../core/services/container.service';
import { Container } from '../../../../core/models/container.model';
import { TableColumn, TableAction } from '../../../../shared/interfaces/table.interface';
import { PageToolbar } from '../../../../shared/components/page-toolbar/page-toolbar';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { ContainerModal } from '../container-modal/container-modal';

@Component({
  selector: 'app-container-list',
  imports: [CommonModule, PageToolbar, DataTable, Pagination, ContainerModal],
  templateUrl: './container-list.html',
  styleUrl: './container-list.scss',
})
export class ContainerList implements OnInit {
  private containerService = inject(ContainerService);

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
  modalMode = signal<'create' | 'edit'>('create');
  selectedContainerId = signal<number | undefined>(undefined);

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
          'running': 'success',   // Verde
          'stopped': 'danger'     // Rojo
        },
        labelMap: {
          'running': 'En Movimiento',
          'stopped': 'Detenido'
        }
      }
    },
    {
      key: 'port_of_loading',
      label: 'Puerto de Origen',
      type: 'port-with-date',
      portConfig: {
        locationKey: 'port_of_loading_location_name',
        countryKey: 'port_of_loading_country_name',
        dateKey: 'created_at'
      }
    },
    {
      key: 'destination_port',
      label: 'Puerto de Destino',
      type: 'port-with-date',
      portConfig: {
        locationKey: 'destination_port_location_name',
        countryKey: 'destination_port_country_name',
        dateKey: 'date_of_discharge'
      }
    },
    {
      key: 'transit_porcentage',
      label: '% de Tránsito',
      type: 'progress'
    }
  ];

  // Configuración de acciones (botones en última columna)
  actions: TableAction[] = [
    { icon: 'bi-eye', tooltip: 'Ver', action: 'view', class: 'btn-outline-primary' },
    { icon: 'bi-pencil', tooltip: 'Editar', action: 'edit', class: 'btn-outline-secondary' }
  ];

  ngOnInit() {
    this.loadContainers();
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
        console.log('Ver contenedor:', row);
        // TODO: Implementar modal de visualización (complejo)
        break;
      case 'edit':
        this.modalMode.set('edit');
        this.selectedContainerId.set(row.id);
        this.showModal.set(true);
        break;
    }
  }

  onModalClose() {
    this.showModal.set(false);
    this.selectedContainerId.set(undefined);
  }

  onContainerSaved(container: Container) {
    this.loadContainers(this.currentPage(), this.currentSearch());
  }

  onPageChange(page: number) {
    this.loadContainers(page, this.currentSearch());
  }
}
