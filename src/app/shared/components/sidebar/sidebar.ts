import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { UserRole } from '../../../core/models/enums';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private authService = inject(Auth);

  // Signal para controlar el estado colapsado
  isCollapsed = signal(false);

  // Computed para obtener los items del menú según el rol del usuario
  menuItems = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];

    const isAdmin = user.role === UserRole.Administrator;

    if (isAdmin) {
      return [
        { label: 'Dashboard', icon: 'bi-columns-gap', route: '/admin/dashboard' },
        { label: 'Contenedores', icon: 'bi-grid-3x3', route: '/admin/contenedores' },
        { label: 'Ordenes', icon: 'bi-box-seam', route: '/admin/ordenes' },
        { label: 'Clientes', icon: 'bi-people', route: '/admin/clientes' },
      ];
    } else {
      return [
        { label: 'Dashboard', icon: 'bi-columns-gap', route: '/client/dashboard' },
      ];
    }
  });

  /**
   * Alternar el estado del sidebar (expandido/colapsado)
   */
  toggleSidebar(): void {
    this.isCollapsed.update(value => !value);
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.authService.logout();
  }
}
