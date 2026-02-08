export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'badge' | 'date' | 'percentage' | 'port-with-date' | 'progress';
  badgeConfig?: {
    colorMap: { [key: string]: string };
    labelMap: { [key: string]: string };
  };
  pipe?: 'date' | 'currency';
  // Para columnas tipo 'port-with-date'
  portConfig?: {
    locationKey: string;  // e.g., 'port_of_loading_name'
    countryKey: string;   // e.g., 'port_of_loading_country'
    dateKey: string;      // e.g., 'created_at'
  };
}

export interface TableAction {
  icon: string;
  tooltip: string;
  action: string;
  class?: string;
}
