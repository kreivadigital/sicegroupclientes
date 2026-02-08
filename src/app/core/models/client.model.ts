import { UserStatus } from './enums';

export interface Client {
  id: number;
  user_id: number;
  user?: {
    id: number;
    name: string;
    email: string;
    status: UserStatus;
  };
  company_name: string;
  rut: string;
  address: string;
  phone: string;
  city: string;
  country: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface ClientFormData {
  // User data
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  current_password?: string;
  new_password?: string;
  status?: UserStatus;

  // Client data
  company_name: string;
  rut: string;
  address: string;
  phone: string;
  city: string;
  country: string;
}
