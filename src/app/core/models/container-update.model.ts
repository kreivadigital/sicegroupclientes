/**
 * Registro de una actualización de contenedor (webhook ShipsGo o sync manual).
 */
export interface ContainerUpdate {
  id: number;
  container_id: number | null;
  container_number: string;
  shipment_reference: string;
  port_of_loading_name: string | null;
  destination_port_name: string | null;
  status_from: string | null;
  status_to: string | null;
  new_movements: number;
  description: string;
  source: 'webhook' | 'sync';
  event_name: string | null;
  created_at: string;
  updated_at: string;
}
