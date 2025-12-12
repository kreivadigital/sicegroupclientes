import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageToolbar } from '../../../../shared/components/page-toolbar/page-toolbar';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { ClientService } from '../../../../core/services/client.service';
import { Client } from '../../../../core/models/client.model';
import { TableColumn, TableAction } from '../../../../shared/interfaces/table.interface';
import { ClientModal } from '../client-modal/client-modal';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, PageToolbar, DataTable, Pagination, ClientModal],
  templateUrl: './client-list.html',
  styleUrl: './client-list.scss',
})
export class ClientList implements OnInit {
  private clientService = inject(ClientService);

  clients = signal<Client[]>([]);
  loading = signal(false);
  currentPage = signal(1);
  totalPages = signal(1);
  totalItems = signal(0);
  perPage = signal(15);

  // Búsqueda actual
  currentSearch = signal<string>('');

  showModal = signal(false);
  modalMode = signal<'view' | 'edit' | 'create'>('view');
  selectedClientId = signal<number | undefined>(undefined);

  columns: TableColumn[] = [
    { key: 'rut', label: 'RUT', type: 'text' },
    { key: 'company_name', label: 'Nombre de la Empresa', type: 'text' },
    { key: 'user.name', label: 'Contacto', type: 'text' },
    { key: 'user.email', label: 'Correo Electrónico', type: 'text' },
    { key: 'phone', label: 'Teléfono', type: 'text' },
    {
      key: 'user.status',
      label: 'Estado',
      type: 'badge',
      badgeConfig: {
        colorMap: {
          'active': 'success',
          'inactive': 'secondary'
        },
        labelMap: {
          'active': 'Activo',
          'inactive': 'Inactivo'
        }
      }
    }
  ];

  // Función para aplicar clase CSS a filas de clientes inactivos
  getClientRowClass = (client: Client): string => {
    return client.user?.status === 'inactive' ? 'row-inactive' : '';
  };

  actions: TableAction[] = [
    { icon: 'bi-eye', tooltip: 'Ver', action: 'view', class: 'btn-outline-dark' },
    { icon: 'bi-pencil-square', tooltip: 'Editar', action: 'edit', class: 'btn-outline-secondary' }
  ];

  ngOnInit() {
    this.loadClients();
  }

  loadClients(page: number = 1, search?: string) {
    this.loading.set(true);

    this.clientService.getClients(page, search).subscribe({
      next: (response) => {
        const paginationData = response.data as any;
        const clients = paginationData.data || [];

        this.clients.set(clients);
        this.currentPage.set(paginationData.current_page);
        this.totalPages.set(paginationData.last_page);
        this.totalItems.set(paginationData.total);
        this.perPage.set(paginationData.per_page);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error cargando clientes:', error);
        this.loading.set(false);
      }
    });
  }

  onSearch(searchTerm: string) {
    this.currentSearch.set(searchTerm);
    this.loadClients(1, searchTerm);
  }

  onTableAction(event: { action: string; row: Client }) {
    this.selectedClientId.set(event.row.id);
    if (event.action === 'view' || event.action === 'edit') {
      this.modalMode.set(event.action);
      this.showModal.set(true);
    }
  }

  onAddClient() {
    this.selectedClientId.set(undefined);
    this.modalMode.set('create');
    this.showModal.set(true);
  }

  onClientSaved(client: Client) {
    this.showModal.set(false);
    this.loadClients(this.currentPage(), this.currentSearch());
  }

  onCloseModal() {
    this.showModal.set(false);
    this.selectedClientId.set(undefined);
  }

  onPageChange(page: number) {
    this.loadClients(page, this.currentSearch());
  }
}
