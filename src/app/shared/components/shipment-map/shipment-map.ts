import {
  Component,
  Input,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  signal,
  computed,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { ContainerService } from '../../../core/services/container.service';
import { SeaRoutingService } from '../../../core/services/sea-routing.service';
import { RouteData, RouteSegment } from '../../../core/models/container.model';

@Component({
  selector: 'app-shipment-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shipment-map.html',
  styleUrls: ['./shipment-map.scss']
})
export class ShipmentMap implements AfterViewInit, OnDestroy {
  private containerService = inject(ContainerService);
  private seaRoutingService = inject(SeaRoutingService);
  private elementRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);

  @Input() containerId!: number;
  @Input() height = 350;

  loading = signal(true);
  error = signal<string | null>(null);
  routeData = signal<RouteData | null>(null);

  hasData = computed(() => {
    const data = this.routeData();
    return data && (data.segments.length > 0 || data.ports.length > 0);
  });

  private map: L.Map | null = null;
  private resizeObserver: ResizeObserver | null = null;

  ngAfterViewInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroyMap();
    this.resizeObserver?.disconnect();
  }

  loadData() {
    if (!this.containerId) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.containerService.getContainerRoute(this.containerId).subscribe({
      next: (res) => {
        // Procesar datos con sea routing para evitar rutas por tierra
        const processedData = this.processRouteWithSeaRouting(res.data);
        this.routeData.set(processedData);
        this.loading.set(false);
        this.cdr.detectChanges();

        if (this.hasData()) {
          // Esperar a que Angular renderice el contenedor del mapa
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              this.createMap();
            });
          });
        }
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar ruta');
        this.loading.set(false);
      }
    });
  }

  /**
   * Procesa los datos de ruta aplicando sea routing a cada segmento.
   * Calcula rutas marítimas reales entre los puertos para evitar
   * que las líneas crucen tierra/continentes.
   */
  private processRouteWithSeaRouting(data: RouteData): RouteData {
    if (!data || !data.segments || data.segments.length === 0) {
      return data;
    }

    let updatedCurrentPosition = data.current_position;

    // Procesar cada segmento con sea routing
    const processedSegments: RouteSegment[] = data.segments.map(segment => {
      if (segment.coordinates.length < 2) {
        return segment;
      }

      // Calcular la ruta marítima entre el primer y último punto
      const origin = segment.coordinates[0];
      const destination = segment.coordinates[segment.coordinates.length - 1];
      const seaRouteCoords = this.seaRoutingService.calculateRoute(origin, destination);

      if (seaRouteCoords && seaRouteCoords.length >= 2) {
        let newCurrentIndex: number | undefined = undefined;

        // Si es segmento CURRENT, recalcular current_index y posición del buque
        if (segment.status === 'CURRENT' && segment.current_index !== undefined) {
          // Calcular el porcentaje de progreso en el segmento original
          const originalProgress = segment.current_index / Math.max(1, segment.coordinates.length - 1);

          // Aplicar el mismo porcentaje a la nueva ruta
          newCurrentIndex = Math.round(originalProgress * (seaRouteCoords.length - 1));
          newCurrentIndex = Math.max(0, Math.min(newCurrentIndex, seaRouteCoords.length - 1));

          // Actualizar current_position para que esté en la ruta sea-routed
          if (updatedCurrentPosition) {
            updatedCurrentPosition = {
              ...updatedCurrentPosition,
              coordinates: seaRouteCoords[newCurrentIndex],
              index: newCurrentIndex
            };
          }
        }

        return {
          ...segment,
          coordinates: seaRouteCoords,
          current_index: newCurrentIndex
        };
      }

      // Fallback: mantener coordenadas originales si sea routing falla
      return segment;
    });

    return {
      ...data,
      segments: processedSegments,
      current_position: updatedCurrentPosition
    };
  }

  private createMap() {
    const wrapper = this.elementRef.nativeElement.querySelector('.map-wrapper');
    if (!wrapper) return;

    // Verificar que el contenedor tenga dimensiones
    const rect = wrapper.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      // Reintentar en 100ms
      setTimeout(() => this.createMap(), 100);
      return;
    }

    this.destroyMap();

    try {
      this.map = L.map(wrapper, {
        center: [20, 0],
        zoom: 2,
        zoomControl: true,
        attributionControl: false,
        worldCopyJump: true, // Mejora navegación al cruzar el antimeridiano
      });

      // CartoDB Voyager - Nombres en inglés, estilo limpio
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(this.map);

      this.renderData();
      this.setupResizeObserver(wrapper);

      // Forzar redimensionamiento
      setTimeout(() => this.map?.invalidateSize(), 100);
      setTimeout(() => this.map?.invalidateSize(), 500);

    } catch (e) {
      console.error('[ShipmentMap] Error creating map:', e);
    }
  }

  private setupResizeObserver(element: HTMLElement) {
    this.resizeObserver = new ResizeObserver(() => {
      this.map?.invalidateSize();
    });
    this.resizeObserver.observe(element);
  }

  private destroyMap() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  /**
   * Calcular bearing entre dos puntos usando fórmula de Haversine
   * @returns Bearing en grados (0-360, donde 0 = Norte)
   */
  private calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const toRad = (deg: number) => deg * (Math.PI / 180);
    const toDeg = (rad: number) => rad * (180 / Math.PI);

    const dLng = toRad(lng2 - lng1);
    const lat1Rad = toRad(lat1);
    const lat2Rad = toRad(lat2);

    const x = Math.sin(dLng) * Math.cos(lat2Rad);
    const y = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

    let bearing = toDeg(Math.atan2(x, y));
    return (bearing + 360) % 360; // Normalizar a 0-360
  }

  /**
   * Obtener heading del buque basándose en las coordenadas del segmento CURRENT
   */
  private getVesselHeading(data: RouteData): number {
    const currentSegment = data.segments.find(s => s.status === 'CURRENT');
    if (!currentSegment || !data.current_position) return 0;

    const coords = currentSegment.coordinates;
    const currentIndex = currentSegment.current_index ?? 0;

    // Necesitamos al menos 2 puntos para calcular bearing
    if (currentIndex < 1 || coords.length < 2) {
      // Usar primeros 2 puntos del segmento como fallback
      if (coords.length >= 2) {
        return this.calculateBearing(
          coords[0][0], coords[0][1],
          coords[1][0], coords[1][1]
        );
      }
      return 0;
    }

    // Usar el punto anterior y la posición actual
    const prevPoint = coords[currentIndex - 1];
    const currPoint = data.current_position.coordinates;

    return this.calculateBearing(
      prevPoint[0], prevPoint[1],
      currPoint[0], currPoint[1]
    );
  }

  /**
   * Normaliza coordenadas para manejar correctamente rutas que cruzan el antimeridiano (180°).
   * Cuando una ruta cruza el Pacífico (de Asia a América o viceversa), las longitudes
   * saltan de ~180 a ~ -180, causando que Leaflet dibuje la línea "al revés".
   * Esta función ajusta las longitudes para que la línea se dibuje por el camino más corto.
   */
  private normalizeCoordinatesForAntimeridian(coords: [number, number][]): [number, number][] {
    if (coords.length < 2) return coords;

    const normalized: [number, number][] = [[coords[0][0], coords[0][1]]];
    let currentLng = coords[0][1];

    for (let i = 1; i < coords.length; i++) {
      const lat = coords[i][0];
      let lng = coords[i][1];

      // Calcular la diferencia de longitud
      const diff = lng - currentLng;

      // Si la diferencia es mayor a 180°, la ruta cruza el antimeridiano
      if (diff > 180) {
        // Salto de oeste a este (ej: -170 a 170) -> ajustar restando 360
        lng -= 360;
      } else if (diff < -180) {
        // Salto de este a oeste (ej: 170 a -170) -> ajustar sumando 360
        lng += 360;
      }

      normalized.push([lat, lng]);
      currentLng = lng;
    }

    return normalized;
  }

  /**
   * Normaliza una coordenada individual relativa a un punto de referencia
   */
  private normalizeCoordinate(coord: [number, number], referenceLng: number): [number, number] {
    let lng = coord[1];
    const diff = lng - referenceLng;

    if (diff > 180) {
      lng -= 360;
    } else if (diff < -180) {
      lng += 360;
    }

    return [coord[0], lng];
  }

/**
 * Renderiza la ruta del contenedor en el mapa Leaflet
 * con colores y estilos personalizados según el plan
 * y la posición actual del buque
 * @returns {void}
 */
  private renderData() {
    const data = this.routeData();
    if (!this.map || !data) return;

    const bounds: L.LatLngExpression[] = [];

    // Colores según el plan
    const COLOR_TRAVELED = '#02661E';  // Verde ($primary) - Recorrido
    const COLOR_FUTURE = '#6B7280';    // Gris ($text-muted) - Por recorrer

    // Calcular heading del buque
    const vesselHeading = this.getVesselHeading(data);

    // Obtener longitud de referencia para normalización (primer punto del primer segmento)
    let referenceLng = 0;
    if (data.segments.length > 0 && data.segments[0].coordinates.length > 0) {
      referenceLng = data.segments[0].coordinates[0][1];
    } else if (data.ports.length > 0) {
      referenceLng = data.ports[0].coordinates[1];
    }

    // Dibujar segmentos con nueva lógica de colores
    data.segments.forEach(seg => {
      if (seg.coordinates.length < 2) return;

      // Normalizar coordenadas para manejar el antimeridiano
      const normalizedCoords = this.normalizeCoordinatesForAntimeridian(seg.coordinates);

      const isPast = seg.status === 'PAST';
      const isCurrent = seg.status === 'CURRENT';
      const isFuture = seg.status === 'FUTURE';

      if (isPast) {
        // PAST: Verde sólido - ya recorrido
        L.polyline(normalizedCoords, {
          color: COLOR_TRAVELED,
          weight: 4,
          opacity: 0.9,
        }).addTo(this.map!);

      } else if (isCurrent && seg.current_index !== undefined) {
        // CURRENT: Dividir en antes (verde) y después (gris dashed) del buque
        const currentIndex = seg.current_index;

        // Parte recorrida (hasta el buque): Verde sólido
        if (currentIndex > 0) {
          const traveledCoords = normalizedCoords.slice(0, currentIndex + 1);
          L.polyline(traveledCoords, {
            color: COLOR_TRAVELED,
            weight: 4,
            opacity: 0.9,
          }).addTo(this.map!);
        }

        // Parte por recorrer (después del buque): Gris dashed
        if (currentIndex < normalizedCoords.length - 1) {
          const futureCoords = normalizedCoords.slice(currentIndex);
          L.polyline(futureCoords, {
            color: COLOR_FUTURE,
            weight: 3,
            opacity: 0.75,
            dashArray: '10, 8',
          }).addTo(this.map!);
        }

      } else if (isCurrent) {
        // CURRENT sin current_index: mostrar como actual (verde)
        L.polyline(normalizedCoords, {
          color: COLOR_TRAVELED,
          weight: 4,
          opacity: 0.9,
        }).addTo(this.map!);

      } else if (isFuture) {
        // FUTURE: Gris dashed - por recorrer
        L.polyline(normalizedCoords, {
          color: COLOR_FUTURE,
          weight: 3,
          opacity: 0.7,
          dashArray: '10, 8',
        }).addTo(this.map!);
      }

      // Agregar coordenadas normalizadas a bounds
      bounds.push(...normalizedCoords);
    });

    // Dibujar puertos con coordenadas normalizadas y números de orden
    data.ports.forEach((port, index) => {
      const normalizedPort = this.normalizeCoordinate(port.coordinates, referenceLng);
      const isVisited = port.status === 'PAST';
      const portNumber = index + 1; // Número de puerto (1-indexed)

      const icon = L.divIcon({
        className: 'port-marker',
        html: `<div class="port-number ${isVisited ? 'visited' : 'pending'}">${portNumber}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      L.marker(normalizedPort, { icon })
        .bindPopup(`<b>${portNumber}. ${port.name}</b><br>${port.country || ''}`)
        .addTo(this.map!);

      bounds.push(normalizedPort);
    });

    // Dibujar posición actual del buque con rotación
    if (data.current_position) {
      const pos = data.current_position;
      const normalizedPos = this.normalizeCoordinate(pos.coordinates, referenceLng);
      const icon = L.divIcon({
        className: 'vessel-marker',
        html: `<div class="vessel-container">
                 <div class="sonar-ring ring-1"></div>
                 <div class="sonar-ring ring-2"></div>
                 <div class="vessel-icon" style="transform: rotate(${vesselHeading}deg);">
                   <i class="bi bi-arrow-up"></i>
                 </div>
               </div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      L.marker(normalizedPos, { icon })
        .bindPopup(`
          <b>${pos.vessel_name || 'Buque'}</b><br>
          <small>Rumbo: ${Math.round(vesselHeading)}°</small>
        `)
        .addTo(this.map!);

      bounds.push(normalizedPos);
    }

    // Ajustar vista
    if (bounds.length > 0) {
      this.map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40] });
    }
  }
}
