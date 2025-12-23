/**
 * Modelo para configuraciones del sistema.
 */
export interface Setting {
  id: number;
  group: string;
  key: string;
  masked_value: string | null;
  is_encrypted: boolean;
  type: SettingType;
  description: string | null;
  updated_at: string;
}

export type SettingType = 'string' | 'integer' | 'boolean' | 'json';

export interface SettingCreateData {
  group: string;
  key: string;
  value: string;
  is_encrypted: boolean;
  type: SettingType;
  description?: string;
}

export interface SettingUpdateData {
  value: string;
  is_encrypted?: boolean;
  type?: SettingType;
  description?: string;
}

export interface SettingsGrouped {
  [group: string]: Setting[];
}

export interface SettingsResponse {
  success: boolean;
  data: SettingsGrouped;
  available_groups: string[];
}

export interface SettingGroupResponse {
  success: boolean;
  group: string;
  data: Setting[];
}

export interface SettingResponse {
  success: boolean;
  message: string;
  data: Setting;
}

/**
 * Grupos de configuración disponibles
 */
export const SETTING_GROUPS = ['SHIPSGO', 'VESSEL', 'MAIL', 'SYSTEM'] as const;
export type SettingGroup = typeof SETTING_GROUPS[number];

/**
 * Labels para los grupos de configuración
 */
export const SETTING_GROUP_LABELS: Record<SettingGroup, string> = {
  SHIPSGO: 'ShipsGo API',
  VESSEL: 'VesselFinder',
  MAIL: 'Email',
  SYSTEM: 'Sistema',
};

/**
 * Iconos para los grupos de configuración
 */
export const SETTING_GROUP_ICONS: Record<SettingGroup, string> = {
  SHIPSGO: 'bi-box-seam',
  VESSEL: 'bi-water',
  MAIL: 'bi-envelope',
  SYSTEM: 'bi-gear',
};
