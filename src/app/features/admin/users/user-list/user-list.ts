import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageToolbar } from '../../../../shared/components/page-toolbar/page-toolbar';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { ConfirmationModal } from '../../../../shared/components/confirmation-modal/confirmation-modal';
import { UserService, User } from '../../../../core/services/user.service';
import { TableColumn, TableAction } from '../../../../shared/interfaces/table.interface';
import { UserModal } from '../user-modal/user-modal';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, PageToolbar, DataTable, Pagination, UserModal, ConfirmationModal],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserList implements OnInit {
  private userService = inject(UserService);

  users = signal<User[]>([]);
  loading = signal(false);
  currentPage = signal(1);
  totalPages = signal(1);
  totalItems = signal(0);
  perPage = signal(15);

  // Búsqueda actual
  currentSearch = signal<string>('');

  // Modal de crear/editar
  showModal = signal(false);
  modalMode = signal<'create' | 'edit'>('create');
  selectedUserId = signal<number | undefined>(undefined);

  // Modal de confirmación de eliminación
  showDeleteConfirm = signal(false);
  userToDelete = signal<User | null>(null);

  columns: TableColumn[] = [
    { key: 'name', label: 'Nombre', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    {
      key: 'role',
      label: 'Rol',
      type: 'badge',
      badgeConfig: {
        colorMap: {
          'super_admin': 'danger',
          'administrator': 'warning',
          'client': 'primary'
        },
        labelMap: {
          'super_admin': 'Super Admin',
          'administrator': 'Administrador',
          'client': 'Cliente'
        }
      }
    }
  ];

  // Función para aplicar clase CSS a filas de SuperAdmin (deshabilitadas)
  getUserRowClass = (user: User): string => {
    return user.role === 'super_admin' ? 'row-disabled' : '';
  };

  // Función para deshabilitar acciones en SuperAdmin
  isActionDisabled = (action: string, user: User): boolean => {
    return user.role === 'super_admin';
  };

  actions: TableAction[] = [
    { icon: 'bi-pencil-square', tooltip: 'Editar', action: 'edit', class: 'btn-outline-success' },
    { icon: 'bi-trash', tooltip: 'Eliminar', action: 'delete', class: 'btn-outline-danger' }
  ];

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers(page: number = 1, search?: string) {
    this.loading.set(true);

    this.userService.getUsers(page, search).subscribe({
      next: (response) => {
        const paginationData = response.data as any;
        const users = paginationData.data || [];

        this.users.set(users);
        this.currentPage.set(paginationData.current_page);
        this.totalPages.set(paginationData.last_page);
        this.totalItems.set(paginationData.total);
        this.perPage.set(paginationData.per_page);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);
        this.loading.set(false);
      }
    });
  }

  onSearch(searchTerm: string) {
    this.currentSearch.set(searchTerm);
    this.loadUsers(1, searchTerm);
  }

  onTableAction(event: { action: string; row: User }) {
    const { action, row } = event;

    // No permitir acciones en SuperAdmin
    if (row.role === 'super_admin') {
      return;
    }

    switch (action) {
      case 'edit':
        this.selectedUserId.set(row.id);
        this.modalMode.set('edit');
        this.showModal.set(true);
        break;
      case 'delete':
        this.userToDelete.set(row);
        this.showDeleteConfirm.set(true);
        break;
    }
  }

  onAddUser() {
    this.selectedUserId.set(undefined);
    this.modalMode.set('create');
    this.showModal.set(true);
  }

  onUserSaved(user: User) {
    this.showModal.set(false);
    this.loadUsers(this.currentPage(), this.currentSearch());
  }

  onCloseModal() {
    this.showModal.set(false);
    this.selectedUserId.set(undefined);
  }

  onConfirmDelete() {
    const user = this.userToDelete();
    if (!user) return;

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.showDeleteConfirm.set(false);
        this.userToDelete.set(null);
        this.loadUsers(this.currentPage(), this.currentSearch());
      },
      error: (error) => {
        console.error('Error eliminando usuario:', error);
        this.showDeleteConfirm.set(false);
        this.userToDelete.set(null);
      }
    });
  }

  onCancelDelete() {
    this.showDeleteConfirm.set(false);
    this.userToDelete.set(null);
  }

  onPageChange(page: number) {
    this.loadUsers(page, this.currentSearch());
  }
}
