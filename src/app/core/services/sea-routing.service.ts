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
      // Crear GeoJSON Point Features
      // IMPORTANTE: GeoJSON usa [longitude, latitude], no [lat, lng]
      const originFeature = this.createPointFeature(origin);
      const destinationFeature = this.createPointFeature(destination);

      // Calcular ruta marítima
      const route = seaRoute(originFeature, destinationFeature, 'kilometers');

      if (!route || !route.geometry || !route.geometry.coordinates) {
        console.warn('[SeaRouting] No se pudo calcular ruta entre', origin, 'y', destination);
        return null;
      }

      // Convertir coordenadas de GeoJSON [lng, lat] a Leaflet [lat, lng]
      const coordinates = route.geometry.coordinates as Position[];
      return coordinates.map(coord => [coord[1], coord[0]] as [number, number]);

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
