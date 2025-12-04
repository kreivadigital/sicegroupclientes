import { NotificationType } from './enums';

export interface Notification {
  id: number;
  user_id: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  type: NotificationType;
  message: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
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
