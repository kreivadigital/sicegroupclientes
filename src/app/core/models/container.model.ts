import { ContainerStatus } from './enums';

export interface Container {
  id: number;
  name: string;
  container_number: number;
  shipment_reference: string;
  carrier: string;
  status: ContainerStatus;

  // Port of Loading
  port_of_loading_code: string;
  port_of_loading_location_name: string;
  port_of_loading_country_name: string;

  // Destination Port
  destination_port_code: string;
  destination_port_location_name: string;
  destination_port_country_name: string;

  // Dates and Progress
  date_of_discharge: string;
  transit_time: string;
  transit_porcentage: number;

  // Relations
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

  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface ContainerFormData {
  name: string;
  container_number: number;
  shipment_reference: string;
  carrier: string;
  status: ContainerStatus;
  port_of_loading_code: string;
  port_of_loading_location_name: string;
  port_of_loading_country_name: string;
  destination_port_code: string;
  destination_port_location_name: string;
  destination_port_country_name: string;
  date_of_discharge: string;
  transit_time: string;
}

export interface Movement {
  id: number;
  container_id?: number;
  event: string;
  location_name: string;
  location_country_name: string;
  vessel: string;
  voyage: string;
  created_at: string;
  updated_at: string;
}

export interface ContainerLiveStatus {
  container: Container;
  movements: Movement[];
  last_movement?: Movement;
}
