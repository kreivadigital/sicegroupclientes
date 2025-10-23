import { OrderStatus } from './enums';

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
    container_number: number;
    status: string;
  };
  performa_pdf_path?: string;
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
  description?: string;
  status: OrderStatus;
  performa_pdf?: File;
}
