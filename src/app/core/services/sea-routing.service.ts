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

  // Estado de carga
  private geoDataLoaded = signal(false);
  private continentsData: GeoJSONData | null = null;

  // Waypoints estratégicos [lat, lng] - puntos clave para rutas marítimas
  private readonly WAYPOINTS: Record<string, Coordinate> = {
    // Estrechos y canales principales
    MALACCA: [1.3, 103.8],              // Estrecho de Malaca (Singapur)
    SUEZ_NORTH: [31.2, 32.3],           // Entrada norte Canal de Suez
    SUEZ_SOUTH: [29.9, 32.5],           // Entrada sur Canal de Suez
    GIBRALTAR: [35.9, -5.5],            // Estrecho de Gibraltar
    PANAMA_ATL: [9.3, -79.9],           // Panamá - lado Atlántico
    PANAMA_PAC: [8.9, -79.5],           // Panamá - lado Pacífico
    BAB_EL_MANDEB: [12.5, 43.3],        // Estrecho Bab el-Mandeb (Yemen)

    // Cabos importantes
    GOOD_HOPE: [-34.4, 18.5],           // Cabo de Buena Esperanza
    HORN: [-55.9, -67.3],               // Cabo de Hornos
    AGULHAS: [-34.8, 20.0],             // Cabo Agulhas (punto más al sur de África)

    // Puntos intermedios Atlántico
    ATLANTIC_NORTH: [40, -40],          // Atlántico Norte
    ATLANTIC_MID: [0, -25],             // Centro Atlántico (Ecuador)
    ATLANTIC_SOUTH: [-35, -30],         // Atlántico Sur
    ATLANTIC_SW: [-35, -50],            // Atlántico Suroeste (cerca de Uruguay)

    // Puntos intermedios Índico
    INDIAN_WEST: [-10, 55],             // Índico Oeste
    INDIAN_MID: [-10, 75],              // Centro Índico
    INDIAN_EAST: [-5, 90],              // Índico Este

    // Puntos intermedios Pacífico
    PACIFIC_WEST: [10, 130],            // Pacífico Oeste
    PACIFIC_MID_NORTH: [20, -160],      // Pacífico Central Norte
    PACIFIC_MID_SOUTH: [-20, -130],     // Pacífico Central Sur
    PACIFIC_EAST: [-10, -100],          // Pacífico Este

    // Mar de China y Sudeste Asiático
    SOUTH_CHINA_SEA: [10, 115],         // Mar de China Meridional
    JAVA_SEA: [-5, 110],                // Mar de Java

    // Mediterráneo
    MED_WEST: [37, 0],                  // Mediterráneo Oeste
    MED_EAST: [34, 25],                 // Mediterráneo Este

    // Mar Rojo
    RED_SEA_NORTH: [27, 34],            // Mar Rojo Norte
    RED_SEA_SOUTH: [15, 42],            // Mar Rojo Sur
  };

  // API pública
  isLoaded = computed(() => this.geoDataLoaded());

  /**
   * Carga el GeoJSON de continentes desde assets
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
      // Continuar sin validación de tierra si falla
      this.geoDataLoaded.set(true);
    }
  }

  /**
   * Procesa un array de coordenadas para evitar que crucen tierra
   * @param coords Array de coordenadas [lat, lng]
   * @returns Array de coordenadas procesadas
   */
  processRouteCoordinates(coords: Coordinate[]): Coordinate[] {
    if (!this.continentsData || coords.length < 2) return coords;

    const result: Coordinate[] = [coords[0]];

    for (let i = 1; i < coords.length; i++) {
      const prev = result[result.length - 1];
      const curr = coords[i];

      if (this.doesLineCrossLand(prev, curr)) {
        // Buscar waypoints intermedios para evitar tierra
        const seaRoute = this.findSeaRoute(prev, curr);
        // Agregar todos excepto el primero (ya está en result)
        result.push(...seaRoute.slice(1));
      } else {
        result.push(curr);
      }
    }

    return result;
  }

  /**
   * Verifica si una línea entre dos puntos cruza tierra
   */
  private doesLineCrossLand(p1: Coordinate, p2: Coordinate): boolean {
    // Muestrear puntos a lo largo de la línea
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
   * Verifica si un punto está sobre tierra
   */
  private isPointOnLand(point: Coordinate): boolean {
    if (!this.continentsData) return false;

    // Convertir a formato GeoJSON [lng, lat]
    const geoPoint: [number, number] = [point[1], point[0]];

    for (const feature of this.continentsData.features) {
      if (feature.geometry.type === 'Polygon') {
        const polygon = feature.geometry.coordinates[0] as number[][];
        if (this.pointInPolygon(geoPoint, polygon)) {
          return true;
        }
      } else if (feature.geometry.type === 'MultiPolygon') {
        const multiPolygon = feature.geometry.coordinates as number[][][][];
        for (const polygon of multiPolygon) {
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
   * @param point [lng, lat] en formato GeoJSON
   * @param polygon Array de [lng, lat] del polígono
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
   * Encuentra una ruta marítima entre dos puntos usando waypoints
   */
  private findSeaRoute(origin: Coordinate, destination: Coordinate): Coordinate[] {
    const route: Coordinate[] = [origin];

    // Determinar qué waypoints usar según la región
    const candidateWaypoints = this.getCandidateWaypoints(origin, destination);

    // Intentar encontrar un camino que no cruce tierra
    let current = origin;
    let attempts = 0;
    const maxAttempts = 5;
    const usedWaypoints = new Set<string>();

    while (this.doesLineCrossLand(current, destination) && attempts < maxAttempts) {
      // Encontrar el mejor waypoint
      const bestWaypoint = this.findBestWaypoint(current, destination, candidateWaypoints, usedWaypoints);

      if (!bestWaypoint) break;

      usedWaypoints.add(bestWaypoint.name);
      route.push(bestWaypoint.coord);
      current = bestWaypoint.coord;
      attempts++;
    }

    route.push(destination);
    return route;
  }

  /**
   * Obtiene waypoints candidatos según la región de origen y destino
   */
  private getCandidateWaypoints(origin: Coordinate, destination: Coordinate): string[] {
    const candidates: string[] = [];

    // Determinar regiones
    const originRegion = this.getRegion(origin);
    const destRegion = this.getRegion(destination);

    // Agregar waypoints según las regiones involucradas
    if (originRegion === 'ASIA' || destRegion === 'ASIA') {
      candidates.push('MALACCA', 'SOUTH_CHINA_SEA', 'JAVA_SEA', 'INDIAN_EAST');
    }

    if (originRegion === 'EUROPE' || destRegion === 'EUROPE') {
      candidates.push('GIBRALTAR', 'MED_WEST', 'MED_EAST', 'ATLANTIC_NORTH');
    }

    if (originRegion === 'AFRICA' || destRegion === 'AFRICA') {
      candidates.push('GOOD_HOPE', 'AGULHAS', 'BAB_EL_MANDEB', 'SUEZ_NORTH', 'SUEZ_SOUTH');
    }

    if (originRegion === 'SOUTH_AMERICA' || destRegion === 'SOUTH_AMERICA') {
      candidates.push('HORN', 'ATLANTIC_SW', 'ATLANTIC_SOUTH', 'PANAMA_ATL', 'PANAMA_PAC');
    }

    if (originRegion === 'NORTH_AMERICA' || destRegion === 'NORTH_AMERICA') {
      candidates.push('PANAMA_ATL', 'PANAMA_PAC', 'ATLANTIC_NORTH', 'PACIFIC_MID_NORTH');
    }

    // Waypoints del Índico para rutas Asia-África
    if ((originRegion === 'ASIA' && (destRegion === 'AFRICA' || destRegion === 'SOUTH_AMERICA')) ||
        (destRegion === 'ASIA' && (originRegion === 'AFRICA' || originRegion === 'SOUTH_AMERICA'))) {
      candidates.push('INDIAN_WEST', 'INDIAN_MID', 'INDIAN_EAST', 'RED_SEA_NORTH', 'RED_SEA_SOUTH');
    }

    // Waypoints del Atlántico para rutas transatlánticas
    candidates.push('ATLANTIC_MID', 'ATLANTIC_SOUTH');

    // Eliminar duplicados
    return [...new Set(candidates)];
  }

  /**
   * Determina la región geográfica de un punto
   */
  private getRegion(point: Coordinate): string {
    const [lat, lng] = point;

    // Asia
    if (lng > 60 && lng < 180 && lat > -15 && lat < 60) return 'ASIA';

    // Europa
    if (lng > -10 && lng < 60 && lat > 35 && lat < 75) return 'EUROPE';

    // África
    if (lng > -20 && lng < 55 && lat > -40 && lat < 40) return 'AFRICA';

    // América del Sur
    if (lng > -85 && lng < -30 && lat > -60 && lat < 15) return 'SOUTH_AMERICA';

    // América del Norte
    if (lng > -170 && lng < -50 && lat > 15 && lat < 75) return 'NORTH_AMERICA';

    // Oceanía
    if (lng > 100 && lng < 180 && lat > -50 && lat < -5) return 'OCEANIA';

    return 'UNKNOWN';
  }

  /**
   * Encuentra el mejor waypoint para evitar tierra
   */
  private findBestWaypoint(
    current: Coordinate,
    destination: Coordinate,
    candidates: string[],
    usedWaypoints: Set<string>
  ): { name: string; coord: Coordinate } | null {
    let bestWaypoint: { name: string; coord: Coordinate } | null = null;
    let bestScore = Infinity;

    for (const name of candidates) {
      if (usedWaypoints.has(name)) continue;

      const coord = this.WAYPOINTS[name];
      if (!coord) continue;

      // Verificar que la línea al waypoint no cruce tierra
      if (this.doesLineCrossLand(current, coord)) continue;

      // Calcular score: distancia total pasando por este waypoint
      const distToWaypoint = this.getDistance(current, coord);
      const distFromWaypoint = this.getDistance(coord, destination);
      const score = distToWaypoint + distFromWaypoint;

      if (score < bestScore) {
        bestScore = score;
        bestWaypoint = { name, coord };
      }
    }

    return bestWaypoint;
  }

  /**
   * Calcula la distancia aproximada entre dos puntos (fórmula de Haversine simplificada)
   */
  private getDistance(p1: Coordinate, p2: Coordinate): number {
    const R = 6371; // Radio de la Tierra en km
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
