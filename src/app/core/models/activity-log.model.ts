import { ActivityLogsAction } from './enums';

export interface ActivityLog {
  id: number;
  user_id: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  action: ActivityLogsAction;
  object_type?: string;
  object_id?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLogStats {
  total: number;
  by_action: Record<string, number>;
  by_user: Record<string, number>;
  recent_actions: ActivityLog[];
}
