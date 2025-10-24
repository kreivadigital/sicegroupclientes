export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'badge' | 'date' | 'percentage';
  badgeConfig?: {
    colorMap: { [key: string]: string };
    labelMap: { [key: string]: string };
  };
  pipe?: 'date' | 'currency';
}

export interface TableAction {
  icon: string;
  tooltip: string;
  action: string;
  class?: string;
}
