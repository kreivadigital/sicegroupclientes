import { Component, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../shared/components/sidebar/sidebar';
import { Header } from '../../shared/components/header/header';

/**
 * Layout principal de la aplicación
 * Incluye el sidebar, header y el área de contenido principal
 * Usado para todas las páginas que requieren navegación (admin y cliente)
 */
@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Sidebar, Header],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
  host: {
    '[class.sidebar-collapsed]': 'sidebar()?.isCollapsed()'
  }
})
export class MainLayout {
  // Referencia al sidebar para leer su estado
  sidebar = viewChild(Sidebar);
}
