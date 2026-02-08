import { OrderStatus, ContainerStatus } from './enums';

export interface Order {
  id: number;
  client_id: number;
  client?: {
    id: number;
    company_name: string;
    user?: {
      name: string;
      email: string;
    };
  };
  container_id?: number;
  container?: {
    id: number;
    name: string;
    container_number: string;
    shipment_reference: string;
    status: ContainerStatus;
    date_of_discharge?: string;
    port_of_loading_name?: string;
    port_of_loading_country?: string;
    destination_port_name?: string;
    destination_port_country?: string;
    transit_percentage?: number;
    calculated_transit_percentage?: number;
    map_token?: string;
    created_at?: string;
  };
  performa_pdf_path?: string;
  picking_list_path?: string;
  invoice_path?: string;
  package_count: number;
  delivery_address: string;
  description?: string;
  status: OrderStatus;
  created_by: number;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface OrderFormData {
  client_id: number;
  container_id?: number;
  delivery_address: string;
  package_count: number;
  description?: string;
  status: OrderStatus;
  performa_pdf_file?: File;
  picking_list_file?: File;
  invoice_file?: File;
}
