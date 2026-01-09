import { Injectable } from '@angular/core';
import { seaRoute } from 'searoute-ts';
import type { Feature, Point, LineString, Position } from 'geojson';

/**
 * SeaRoutingService
 *
 * Wrapper para searoute-ts que calcula rutas marítimas reales
 * evitando que las líneas crucen tierra/continentes.
 *
 * Usa un grafo pre-calculado de rutas marítimas y el algoritmo
 * de Dijkstra para encontrar el camino más corto por agua.
 */
@Injectable({
  providedIn: 'root'
})
export class SeaRoutingService {

  /**
   * Calcula la ruta marítima entre dos puntos.
   * Si los puntos están en tierra, busca el punto de mar más cercano.
   *
   * @param origin Coordenadas origen [lat, lng]
   * @param destination Coordenadas destino [lat, lng]
   * @returns Coordenadas de la ruta marítima [lat, lng][] o null si falla
   */
  calculateRoute(origin: [number, number], destination: [number, number]): [number, number][] | null {
    try {
      // Validar y normalizar coordenadas
      const normalizedOrigin = this.validateAndNormalizeCoords(origin);
      const normalizedDest = this.validateAndNormalizeCoords(destination);

      if (!normalizedOrigin || !normalizedDest) {
        console.warn('[SeaRouting] Coordenadas inválidas - origen:', origin, 'destino:', destination);
        return null;
      }

      // Crear GeoJSON Point Features
      // IMPORTANTE: GeoJSON usa [longitude, latitude], no [lat, lng]
      const originFeature = this.createPointFeature(normalizedOrigin);
      const destinationFeature = this.createPointFeature(normalizedDest);

      // Calcular ruta marítima
      const route = seaRoute(originFeature, destinationFeature, 'kilometers');

      if (!route || !route.geometry || !route.geometry.coordinates) {
        console.warn('[SeaRouting] No se pudo calcular ruta entre', origin, 'y', destination);
        return null;
      }

      // Convertir coordenadas de GeoJSON [lng, lat] a Leaflet [lat, lng]
      const coordinates = route.geometry.coordinates as Position[];
      const result = coordinates.map(coord => [coord[1], coord[0]] as [number, number]);

      // Si searoute devuelve solo 2 puntos (línea recta), es mejor usar coords originales
      // Esto indica que no encontró una ruta marítima real
      if (result.length <= 2) {
        console.info('[SeaRouting] Ruta con solo 2 puntos, usando coordenadas originales:', {
          origin: normalizedOrigin,
          destination: normalizedDest,
          distance: route.properties?.length || 'N/A'
        });
        return null; // Fallback a coordenadas originales
      }

      return result;

    } catch (error) {
      console.error('[SeaRouting] Error calculando ruta:', error);
      return null;
    }
  }

  /**
   * Procesa un array de coordenadas de segmento, calculando rutas marítimas
   * entre cada par de puntos consecutivos.
   *
   * @param coordinates Array de coordenadas del segmento [lat, lng][]
   * @returns Coordenadas procesadas con rutas marítimas
   */
  processSegmentCoordinates(coordinates: [number, number][]): [number, number][] {
    if (coordinates.length < 2) {
      return coordinates;
    }

    const result: [number, number][] = [];

    for (let i = 0; i < coordinates.length - 1; i++) {
      const origin = coordinates[i];
      const destination = coordinates[i + 1];

      // Calcular ruta marítima entre estos dos puntos
      const seaRouteCoords = this.calculateRoute(origin, destination);

      if (seaRouteCoords && seaRouteCoords.length > 0) {
        // Agregar coordenadas de la ruta marítima
        // Evitar duplicar el primer punto si ya existe en result
        if (i === 0) {
          result.push(...seaRouteCoords);
        } else {
          // Saltar el primer punto porque es el mismo que el último agregado
          result.push(...seaRouteCoords.slice(1));
        }
      } else {
        // Fallback: usar línea recta si searoute falla
        if (i === 0) {
          result.push(origin);
        }
        result.push(destination);
      }
    }

    return result;
  }

  /**
   * Procesa una lista de puertos y genera la ruta marítima completa.
   * Útil para rutas A -> B -> C -> D
   *
   * @param ports Array de coordenadas de puertos [lat, lng][]
   * @returns Coordenadas de la ruta marítima completa
   */
  calculateMultiPortRoute(ports: [number, number][]): [number, number][] {
    if (ports.length < 2) {
      return ports;
    }

    return this.processSegmentCoordinates(ports);
  }

  /**
   * Normaliza una longitud al rango -180 a 180
   */
  private normalizeLongitude(lng: number): number {
    while (lng > 180) lng -= 360;
    while (lng < -180) lng += 360;
    return lng;
  }

  /**
   * Valida y normaliza coordenadas
   */
  private validateAndNormalizeCoords(coords: [number, number]): [number, number] | null {
    const [lat, lng] = coords;

    // Validar latitud (-90 a 90)
    if (lat < -90 || lat > 90) {
      console.warn('[SeaRouting] Latitud inválida:', lat);
      return null;
    }

    // Normalizar longitud al rango -180 a 180
    const normalizedLng = this.normalizeLongitude(lng);

    return [lat, normalizedLng];
  }

  /**
   * Crea un GeoJSON Point Feature desde coordenadas [lat, lng]
   *
   * @param coords Coordenadas [lat, lng]
   * @returns GeoJSON Point Feature
   */
  private createPointFeature(coords: [number, number]): Feature<Point> {
    // GeoJSON usa [longitude, latitude]
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [coords[1], coords[0]] // [lng, lat]
      }
    };
  }
}
