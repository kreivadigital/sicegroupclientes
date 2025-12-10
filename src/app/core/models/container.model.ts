import { ContainerStatus } from './enums';

/**
 * Movement Event Types (from Shipsgo API + NOTI for manual movements)
 */
export type MovementEventType = 'EMSH' | 'GTIN' | 'LOAD' | 'DEPA' | 'ARRV' | 'DISC' | 'GTOT' | 'EMRT' | 'NOTI';

/**
 * Movement Status Types
 * EST = Estimated (fecha estimada)
 * ACT = Actual (fecha confirmada)
 */
export type MovementStatusType = 'EST' | 'ACT';

/**
 * Container interface
 * Representa un contenedor marítimo con información de tracking de Shipsgo API
 */
export interface Container {
  id: number;
  shipsgo_shipment_id?: number;
  name: string;
  container_number: string;
  shipment_reference: string;

  // Carrier (naviera)
  carrier_scac?: string;
  carrier: string;

  // Estado
  status: ContainerStatus;

  // Puerto de origen (POL - Port of Loading)
  port_of_loading_code: string;
  port_of_loading_name: string;
  port_of_loading_country: string;
  date_of_loading?: string;

  // Puerto de destino (POD - Port of Discharge)
  destination_port_code: string;
  destination_port_name: string;
  destination_port_country: string;
  date_of_discharge: string;

  // Tránsito
  transit_time: number;
  transit_percentage: number;

  // Tracking
  map_token?: string;

  // Relaciones
  updated_by: number;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
  orders?: Array<{
    id: number;
    description: string;
    status: string;
  }>;
  movements?: Movement[];

  // Vessel actual (calculado desde movements)
  current_vessel?: Movement | null;

  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

/**
 * Container form data for create (simplified - data comes from Shipsgo API)
 */
export interface ContainerCreateData {
  container_number: string;
  shipment_reference?: string;
}

/**
 * Container form data for edit (all fields)
 */
export interface ContainerFormData {
  name?: string;
  container_number: string;
  shipment_reference?: string;
  carrier_scac?: string;
  carrier?: string;
  status?: ContainerStatus;
  port_of_loading_code?: string;
  port_of_loading_name?: string;
  port_of_loading_country?: string;
  date_of_loading?: string;
  destination_port_code?: string;
  destination_port_name?: string;
  destination_port_country?: string;
  date_of_discharge?: string;
  transit_time?: number;
}

/**
 * Response from container creation (includes extra info)
 */
export interface ContainerCreateResponse {
  message: string;
  already_existed: boolean;
  movements_imported: number;
  data: Container;
}

/**
 * Movement interface
 * Representa un evento/movimiento en el ciclo de vida del contenedor
 */
export interface Movement {
  id: number;
  container_id: number;

  // Evento
  event: MovementEventType;
  event_status: MovementStatusType | null;
  event_timestamp: string;

  // Detalle (para movimientos manuales NOTI)
  detail?: string | null;

  // Ubicación (nullable para movimientos manuales)
  location_name?: string | null;
  location_country?: string | null;

  // Buque
  vessel_imo?: string | null;
  vessel_name?: string | null;
  voyage?: string | null;

  created_at: string;
  updated_at: string;
}

/**
 * Data para crear un movimiento manual
 */
export interface MovementCreateData {
  event_timestamp: string;
  detail: string;
}

/**
 * Data para actualizar un movimiento manual
 */
export interface MovementUpdateData {
  event_timestamp?: string;
  detail?: string;
}

/**
 * Container live status with movements
 */
export interface ContainerLiveStatus {
  container: Container;
  movements: Movement[];
  last_movement?: Movement;
}

/**
 * Vessel info for map display
 * vessel_imo y vessel_name ahora vienen del último movement con vessel
 */
export interface VesselInfo {
  vessel_imo: string | null;
  vessel_name: string | null;
  map_token: string | null;
  source: 'database' | 'shipsgo' | 'not_available' | 'shipsgo_no_data' | 'shipsgo_no_vessel' | 'error';
}

/**
 * Movement event labels in Spanish
 */
export const MovementEventLabels: Record<MovementEventType, string> = {
  'EMSH': 'Vacío a Exportador',
  'GTIN': 'Ingreso al Puerto',
  'LOAD': 'Cargado',
  'DEPA': 'Zarpó',
  'ARRV': 'Arribó',
  'DISC': 'Descargado',
  'GTOT': 'Salida del Puerto',
  'EMRT': 'Vacío Devuelto',
  'NOTI': 'Actividad'
};

/**
 * Movement event colors for UI
 */
export const MovementEventColors: Record<MovementEventType, string> = {
  'EMSH': 'secondary',
  'GTIN': 'info',
  'LOAD': 'primary',
  'DEPA': 'primary',
  'ARRV': 'warning',
  'DISC': 'success',
  'GTOT': 'warning',
  'EMRT': 'secondary',
  'NOTI': 'purple'
};

/**
 * Movement event icons (Bootstrap Icons)
 */
export const MovementEventIcons: Record<MovementEventType, string> = {
  'EMSH': 'bi-box-seam',
  'GTIN': 'bi-door-open',
  'LOAD': 'bi-box-arrow-in-down',
  'DEPA': 'bi-airplane-fill',
  'ARRV': 'bi-geo-alt-fill',
  'DISC': 'bi-box-arrow-up',
  'GTOT': 'bi-door-closed',
  'EMRT': 'bi-arrow-return-left',
  'NOTI': 'bi-pencil-square'
};

/**
 * Movement status labels in Spanish
 */
export const MovementStatusLabels: Record<MovementStatusType, string> = {
  'EST': 'Estimado',
  'ACT': 'Confirmado'
};
