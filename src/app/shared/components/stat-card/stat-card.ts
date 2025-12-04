import { Component, Input } from '@angular/core';

/**
 * Componente reutilizable para tarjetas de estadísticas
 *
 * Estructura:
 * - Fila 1: Título (pequeño, gris)
 * - Fila 2:
 *   - Columna 1: Cantidad (grande, bold, negro)
 *   - Columna 2: Icono (grande, color específico, sin fondo)
 *
 * @example
 * <app-stat-card
 *   title="Pedidos Totales"
 *   value="12"
 *   icon="bi-box-seam"
 *   iconColor="#155DFC">
 * </app-stat-card>
 */
@Component({
  selector: 'app-stat-card',
  imports: [],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
})
export class StatCard {
  /** Título de la card (ej: "Pedidos Totales") */
  @Input() title: string = '';

  /** Valor/cantidad a mostrar (ej: "12") */
  @Input() value: string | number = 0;

  /** Clase de icono de Bootstrap Icons (ej: "bi-box-seam") */
  @Input() icon: string = '';

  /** Color del icono en formato hexadecimal (ej: "#155DFC") */
  @Input() iconColor: string = '#000000';
}
