import { Component, computed, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { Auth } from '../../../core/services/auth';
import { UserRole } from '../../../core/models/enums';

/**
 * Header dinámico que cambia según:
 * - Rol del usuario (Admin vs Cliente)
 * - Ruta actual (Dashboard vs otras páginas)
 *
 * 🎨 Estilos:
 * - Cliente: Fondo blanco, texto negro
 * - Admin: Gradiente verde, texto blanco
 */
@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private authService = inject(Auth);
  private router = inject(Router);

  /**
   * 🔄 SIGNAL DE RUTA ACTUAL:
   * Convierte los eventos del Router en un Signal reactivo
   *
   * ¿Por qué necesitamos esto?
   * - router.url NO es un signal, no es reactivo
   * - NavigationEnd se emite cada vez que cambia la ruta
   * - toSignal() convierte el Observable en un Signal
   * - startWith() proporciona el valor inicial (ruta actual)
   *
   * Flujo:
   * 1. Usuario navega → NavigationEnd se emite
   * 2. toSignal() detecta el evento
   * 3. currentUrl() se actualiza
   * 4. computed() se recalcula automáticamente
   */
  private currentUrl = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url) // Valor inicial
    ),
    { initialValue: this.router.url }
  );

  /**
   * 🧠 COMPUTED: Se recalcula automáticamente cuando:
   * 1. El usuario cambia (login/logout) → authService.currentUser() cambia
   * 2. La ruta cambia (navegación) → currentUrl() cambia
   *
   * ¿Por qué computed y no una función normal?
   * - Computed es REACTIVO: Angular detecta cambios automáticamente
   * - Se ejecuta solo cuando sus dependencias cambian (eficiente)
   * - Cachea el resultado (mejor performance)
   */
  headerData = computed(() => {
    const user = this.authService.currentUser();
    const url = this.currentUrl(); // ← Ahora SÍ es reactivo

    // Si no hay usuario, mostrar valores por defecto
    if (!user) {
      return {
        title: 'Cargando...',
        subtitle: '',
        isAdmin: false,
        profileText: 'Usuario'
      };
    }

    // Determinar si es admin o cliente
    const isAdmin = user.role === UserRole.Administrator;

    // ==========================================
    // LÓGICA DE TÍTULOS DINÁMICOS
    // ==========================================

    // Para ADMIN
    if (isAdmin) {
      if (url.includes('/admin/dashboard')) {
        return {
          title: `Hola, ${user.name}`,
          subtitle: 'Gestiona clientes, pedidos y contenedores',
          isAdmin: true,
          profileText: 'Perfil del Administrador'
        };
      } else if (url.includes('/admin/contenedores')) {
        return {
          title: 'Gestión de Contenedores',
          subtitle: '',
          isAdmin: true,
          profileText: 'Perfil del Administrador'
        };
      } else if (url.includes('/admin/ordenes')) {
        return {
          title: 'Gestión de Ordenes',
          subtitle: '',
          isAdmin: true,
          profileText: 'Perfil del Administrador'
        };
      } else if (url.includes('/admin/clientes')) {
        return {
          title: 'Gestión de Clientes',
          subtitle: '',
          isAdmin: true,
          profileText: 'Perfil del Administrador'
        };
      }
    }

    // Para CLIENTE
    if (url.includes('/client/dashboard')) {
      return {
        title: `Hola, ${user.name}`,
        subtitle: 'Bienvenido a tu panel de control',
        isAdmin: false,
        profileText: 'Perfil del Cliente'
      };
    } else if (url.includes('/client/ordenes')) {
      return {
        title: 'Mis Ordenes',
        subtitle: '',
        isAdmin: false,
        profileText: 'Perfil del Cliente'
      };
    } else if (url.includes('/client/perfil')) {
      return {
        title: 'Mi perfil',
        subtitle: 'Gestiona tu información personal y preferencias',
        isAdmin: false,
        profileText: 'Perfil del Cliente'
      };
    }

    // Fallback por defecto
    return {
      title: user.name,
      subtitle: '',
      isAdmin: isAdmin,
      profileText: isAdmin ? 'Perfil del Administrador' : 'Perfil del Cliente'
    };
  });
}
