import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface GeoJSONFeature {
  type: string;
  properties: any;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

interface GeoJSONData {
  type: string;
  features: GeoJSONFeature[];
}

type Coordinate = [number, number]; // [lat, lng]

@Injectable({
  providedIn: 'root'
})
export class SeaRoutingService {
  private http = inject(HttpClient);

  private geoDataLoaded = signal(false);
  private continentsData: GeoJSONData | null = null;

  // Solo waypoints estratégicos: canales y estrechos angostos
  // donde el algoritmo automático podría tener problemas
  private readonly STRATEGIC_WAYPOINTS: Record<string, Coordinate> = {
    MALACCA: [1.3, 103.8],           // Estrecho de Malaca
    SUEZ_NORTH: [31.2, 32.3],        // Canal de Suez Norte
    SUEZ_SOUTH: [29.9, 32.5],        // Canal de Suez Sur
    GIBRALTAR: [35.9, -5.5],         // Estrecho de Gibraltar
    PANAMA_ATL: [9.3, -79.9],        // Canal de Panamá Atlántico
    PANAMA_PAC: [8.9, -79.5],        // Canal de Panamá Pacífico
    BAB_EL_MANDEB: [12.5, 43.3],     // Estrecho Bab el-Mandeb
  };

  isLoaded = computed(() => this.geoDataLoaded());

  /**
   * Carga el GeoJSON de continentes
   */
  async loadGeoData(): Promise<void> {
    if (this.geoDataLoaded()) return;

    try {
      const data = await firstValueFrom(
        this.http.get<GeoJSONData>('/assets/geo/continents.geojson')
      );
      this.continentsData = data;
      this.geoDataLoaded.set(true);
    } catch (error) {
      console.error('[SeaRouting] Error loading GeoJSON:', error);
      this.geoDataLoaded.set(true);
    }
  }

  /**
   * Procesa coordenadas para evitar que crucen tierra
   */
  processRouteCoordinates(coords: Coordinate[]): Coordinate[] {
    if (!this.continentsData || coords.length < 2) return coords;

    const result: Coordinate[] = [coords[0]];

    for (let i = 1; i < coords.length; i++) {
      const prev = result[result.length - 1];
      const curr = coords[i];

      const segmentRoute = this.findSeaRoute(prev, curr);
      // Agregar todos excepto el primero (ya está en result)
      result.push(...segmentRoute.slice(1));
    }

    return result;
  }

  /**
   * Encuentra una ruta marítima entre dos puntos
   */
  private findSeaRoute(origin: Coordinate, destination: Coordinate): Coordinate[] {
    // Si no cruza tierra, retornar línea directa
    if (!this.doesLineCrossLand(origin, destination)) {
      return [origin, destination];
    }

    const route: Coordinate[] = [origin];
    let current = origin;
    let attempts = 0;
    const maxAttempts = 15;

    while (this.doesLineCrossLand(current, destination) && attempts < maxAttempts) {
      // 1. Intentar con waypoint estratégico primero (para canales/estrechos)
      const strategicPoint = this.findStrategicWaypoint(current, destination);
      if (strategicPoint && !this.doesLineCrossLand(current, strategicPoint)) {
        route.push(strategicPoint);
        current = strategicPoint;
        attempts++;
        continue;
      }

      // 2. Encontrar punto de colisión con tierra
      const collisionPoint = this.findLandEntryPoint(current, destination);
      if (!collisionPoint) break;

      // 3. Buscar punto en el mar que rodee la tierra
      const seaPoint = this.findSeaPointAround(collisionPoint, current, destination);
      if (!seaPoint) break;

      route.push(seaPoint);
      current = seaPoint;
      attempts++;
    }

    route.push(destination);
    return route;
  }

  /**
   * Busca un waypoint estratégico útil para la ruta
   */
  private findStrategicWaypoint(origin: Coordinate, destination: Coordinate): Coordinate | null {
    let bestWaypoint: Coordinate | null = null;
    let bestScore = Infinity;

    for (const [, coord] of Object.entries(this.STRATEGIC_WAYPOINTS)) {
      // El waypoint debe estar "entre" origin y destination (aproximadamente)
      const distOriginToWp = this.getDistance(origin, coord);
      const distWpToDest = this.getDistance(coord, destination);
      const distDirect = this.getDistance(origin, destination);

      // Solo considerar si no añade demasiada distancia (máx 50% extra)
      const totalViaWp = distOriginToWp + distWpToDest;
      if (totalViaWp > distDirect * 1.5) continue;

      // Verificar que el waypoint ayude (línea al waypoint no cruza tierra)
      if (this.doesLineCrossLand(origin, coord)) continue;

      if (totalViaWp < bestScore) {
        bestScore = totalViaWp;
        bestWaypoint = coord;
      }
    }

    return bestWaypoint;
  }

  /**
   * Encuentra el punto donde la línea entra a tierra
   */
  private findLandEntryPoint(origin: Coordinate, destination: Coordinate): Coordinate | null {
    const steps = 20;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const point: Coordinate = [
        origin[0] + (destination[0] - origin[0]) * t,
        origin[1] + (destination[1] - origin[1]) * t
      ];

      if (this.isPointOnLand(point)) {
        // Retornar el punto justo antes de entrar a tierra
        const tPrev = (i - 1) / steps;
        return [
          origin[0] + (destination[0] - origin[0]) * tPrev,
          origin[1] + (destination[1] - origin[1]) * tPrev
        ];
      }
    }
    return null;
  }

  /**
   * Busca un punto en el mar que permita rodear la tierra
   * Usa búsqueda perpendicular a la línea original
   */
  private findSeaPointAround(
    collisionPoint: Coordinate,
    origin: Coordinate,
    destination: Coordinate
  ): Coordinate | null {
    // Calcular vector perpendicular a la línea
    const dx = destination[1] - origin[1];
    const dy = destination[0] - origin[0];
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) return null;

    // Vector perpendicular normalizado
    const perpX = -dy / length;
    const perpY = dx / length;

    // Buscar en ambas direcciones perpendiculares
    const searchDistances = [5, 10, 15, 20, 30, 40, 50]; // grados

    for (const dist of searchDistances) {
      // Intentar hacia un lado
      const point1: Coordinate = [
        collisionPoint[0] + perpX * dist,
        collisionPoint[1] + perpY * dist
      ];

      if (!this.isPointOnLand(point1) && !this.doesLineCrossLand(origin, point1)) {
        return point1;
      }

      // Intentar hacia el otro lado
      const point2: Coordinate = [
        collisionPoint[0] - perpX * dist,
        collisionPoint[1] - perpY * dist
      ];

      if (!this.isPointOnLand(point2) && !this.doesLineCrossLand(origin, point2)) {
        return point2;
      }
    }

    // Si no encuentra perpendicular, intentar mover hacia el origen
    const backtrackDistances = [0.1, 0.2, 0.3];
    for (const t of backtrackDistances) {
      const backPoint: Coordinate = [
        collisionPoint[0] - (destination[0] - origin[0]) * t,
        collisionPoint[1] - (destination[1] - origin[1]) * t
      ];

      for (const dist of searchDistances) {
        const point1: Coordinate = [
          backPoint[0] + perpX * dist,
          backPoint[1] + perpY * dist
        ];

        if (!this.isPointOnLand(point1) && !this.doesLineCrossLand(origin, point1)) {
          return point1;
        }

        const point2: Coordinate = [
          backPoint[0] - perpX * dist,
          backPoint[1] - perpY * dist
        ];

        if (!this.isPointOnLand(point2) && !this.doesLineCrossLand(origin, point2)) {
          return point2;
        }
      }
    }

    return null;
  }

  /**
   * Verifica si una línea entre dos puntos cruza tierra
   */
  private doesLineCrossLand(p1: Coordinate, p2: Coordinate): boolean {
    const samples = 15;
    for (let i = 1; i < samples; i++) {
      const t = i / samples;
      const lat = p1[0] + (p2[0] - p1[0]) * t;
      const lng = p1[1] + (p2[1] - p1[1]) * t;

      if (this.isPointOnLand([lat, lng])) {
        return true;
      }
    }
    return false;
  }

  /**
   * Verifica si un punto está sobre tierra usando GeoJSON
   */
  private isPointOnLand(point: Coordinate): boolean {
    if (!this.continentsData) return false;

    const geoPoint: [number, number] = [point[1], point[0]]; // [lng, lat] para GeoJSON

    for (const feature of this.continentsData.features) {
      if (feature.geometry.type === 'Polygon') {
        if (this.pointInPolygon(geoPoint, feature.geometry.coordinates[0] as number[][])) {
          return true;
        }
      } else if (feature.geometry.type === 'MultiPolygon') {
        for (const polygon of feature.geometry.coordinates as number[][][][]) {
          if (this.pointInPolygon(geoPoint, polygon[0])) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Algoritmo ray-casting para point-in-polygon
   */
  private pointInPolygon(point: [number, number], polygon: number[][]): boolean {
    const x = point[0];
    const y = point[1];
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0];
      const yi = polygon[i][1];
      const xj = polygon[j][0];
      const yj = polygon[j][1];

      const intersect = ((yi > y) !== (yj > y)) &&
                        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  }

  /**
   * Calcula distancia entre dos puntos (Haversine simplificado)
   */
  private getDistance(p1: Coordinate, p2: Coordinate): number {
    const R = 6371;
    const dLat = this.toRad(p2[0] - p1[0]);
    const dLng = this.toRad(p2[1] - p1[1]);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(p1[0])) * Math.cos(this.toRad(p2[0])) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
