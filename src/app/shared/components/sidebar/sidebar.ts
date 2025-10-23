import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
  @Input() isOpen = true;
  @Input() userRole: 'admin' | 'client' = 'admin';

  get menuItems(): MenuItem[] {
    if (this.userRole === 'admin') {
      return [
        { label: 'Dashboard', icon: 'bi-speedometer2', route: '/admin/dashboard' },
        { label: 'Clientes', icon: 'bi-people', route: '/admin/clients' },
        { label: 'Órdenes', icon: 'bi-box-seam', route: '/admin/orders' },
        { label: 'Contenedores', icon: 'bi-container', route: '/admin/containers' },
      ];
    } else {
      return [
        { label: 'Dashboard', icon: 'bi-speedometer2', route: '/client/dashboard' },
        { label: 'Mis Órdenes', icon: 'bi-box-seam', route: '/client/orders' },
        { label: 'Mi Perfil', icon: 'bi-person', route: '/client/profile' },
      ];
    }
  }
}
