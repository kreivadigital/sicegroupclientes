import { NotificationType } from './enums';

export interface Notification {
  id: number;
  user_id: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  order_id?: number;
  order?: {
    id: number;
    status: string;
  };
  type: NotificationType;
  message: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

/**
 * Note - Nota/Notificación asociada a una orden
 */
export interface Note {
  id: number;
  order_id: number;
  user_name: string;
  type: string;
  message: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

/**
 * Data para crear una nota
 */
export interface NoteCreateData {
  message: string;
}

export interface NotificationResponse {
  data: Notification[];
  unread_count: number;
}

export interface NotificationSendRequest {
  user_id: number;
  type: NotificationType;
  message: string;
}

export interface NotificationCreateData {
  order_id: number;
  type: NotificationType;
  message: string;
}

export interface NotificationUpdateData {
  type?: NotificationType;
  message?: string;
}
