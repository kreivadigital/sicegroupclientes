import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageToolbar } from '../../../../shared/components/page-toolbar/page-toolbar';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { ClientService } from '../../../../core/services/client.service';
import { Client } from '../../../../core/models/client.model';
import { TableColumn, TableAction } from '../../../../shared/interfaces/table.interface';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, PageToolbar, DataTable, Pagination],
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

  showModal = signal(false);
  modalMode = signal<'view' | 'edit' | 'create'>('view');
  selectedClient = signal<Client | null>(null);

  columns: TableColumn[] = [
    { key: 'company_name', label: 'Nombre de la Empresa', type: 'text' },
    { key: 'user.name', label: 'Contacto', type: 'text' },
    { key: 'user.email', label: 'Correo Electrónico', type: 'text' },
    { key: 'phone', label: 'Teléfono', type: 'text' },
    { key: 'city', label: 'Ciudad', type: 'text' }
  ];

  actions: TableAction[] = [
    { icon: 'bi-eye', tooltip: 'Ver', action: 'view', class: 'btn-outline-primary' },
    { icon: 'bi-pencil', tooltip: 'Editar', action: 'edit', class: 'btn-outline-secondary' }
  ];

  ngOnInit() {
    this.loadClients();
  }

  loadClients(page: number = 1, search?: string) {
    this.loading.set(true);
    console.log('🔍 Cargando clientes...', { page, search });

    this.clientService.getClients(page, search).subscribe({
      next: (response) => {
        console.log('✅ Respuesta del backend:', response);
        console.log('📊 Datos recibidos:', response.data);

        // Laravel devuelve la paginación dentro de response.data
        const paginationData = response.data as any;
        const clients = paginationData.data || [];

        console.log('📋 Clientes extraídos:', clients);
        console.log('📈 Meta extraída:', {
          current_page: paginationData.current_page,
          last_page: paginationData.last_page,
          total: paginationData.total
        });

        this.clients.set(clients);
        this.currentPage.set(paginationData.current_page);
        this.totalPages.set(paginationData.last_page);
        this.totalItems.set(paginationData.total);
        this.perPage.set(paginationData.per_page);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Error cargando clientes:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Mensaje:', error.message);
        this.loading.set(false);
      }
    });
  }

  onSearch(searchTerm: string) {
    this.loadClients(1, searchTerm);
  }

  onTableAction(event: { action: string; row: Client }) {
    this.selectedClient.set(event.row);
    if (event.action === 'view' || event.action === 'edit') {
      this.modalMode.set(event.action);
      this.showModal.set(true);
    }
  }

  onAddClient() {
    this.selectedClient.set(null);
    this.modalMode.set('create');
    this.showModal.set(true);
  }

  onSaveClient(client: Client) {
    this.showModal.set(false);
    this.loadClients(this.currentPage());
  }

  onCloseModal() {
    this.showModal.set(false);
    this.selectedClient.set(null);
  }

  onPageChange(page: number) {
    this.loadClients(page);
  }
}
