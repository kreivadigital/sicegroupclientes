import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rutas dinámicas con parámetros - Renderizado bajo demanda en el servidor
  {
    path: 'admin/clientes/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/clientes/:id/edit',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/ordenes/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/ordenes/:id/edit',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/contenedores/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/contenedores/:id/edit',
    renderMode: RenderMode.Server
  },
  {
    path: 'client/ordenes/:id',
    renderMode: RenderMode.Server
  },
  // Todas las demás rutas - Pre-renderizadas en build time
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
