export interface Client {
  id: number;
  user_id: number;
  user?: {
    id: number;
    name: string;
    email: string;
    status: string;
  };
  company_name: string;
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

  // Client data
  company_name: string;
  address: string;
  phone: string;
  city: string;
  country: string;
}
