import { Component, computed, inject, signal, HostListener, OnInit } from '@angular/core';
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
export class Sidebar implements OnInit {
  private authService = inject(Auth);

  // Signal para controlar el estado colapsado (desktop)
  isCollapsed = signal(false);

  // Signal para controlar el menú móvil
  isMobileMenuOpen = signal(false);

  // Signal para detectar si estamos en móvil
  isMobile = signal(false);

  // Computed para obtener los items del menú según el rol del usuario
  menuItems = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];

    const isAdmin = user.role === UserRole.Administrator;

    if (isAdmin) {
      return [
        { label: 'Dashboard', icon: 'bi-columns-gap', route: '/admin/contenedores' },
        { label: 'Órdenes', icon: 'bi-archive', route: '/admin/ordenes' },
        { label: 'Clientes', icon: 'bi-people', route: '/admin/clientes' },
      ];
    } else {
      return [
        { label: 'Dashboard', icon: 'bi-columns-gap', route: '/client/dashboard' },
      ];
    }
  });

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  /**
   * Verificar tamaño de pantalla
   */
  private checkScreenSize(): void {
    this.isMobile.set(window.innerWidth < 768);
    // Cerrar menú móvil si cambiamos a desktop
    if (!this.isMobile()) {
      this.isMobileMenuOpen.set(false);
    }
  }

  /**
   * Alternar el estado del sidebar (expandido/colapsado) - Desktop
   */
  toggleSidebar(): void {
    this.isCollapsed.update(value => !value);
  }

  /**
   * Alternar menú móvil
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(value => !value);
  }

  /**
   * Cerrar menú móvil (al hacer click en un item)
   */
  closeMobileMenu(): void {
    if (this.isMobile()) {
      this.isMobileMenuOpen.set(false);
    }
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.authService.logout();
  }
}
