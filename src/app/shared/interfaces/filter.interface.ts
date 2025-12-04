export interface FilterConfig {
  type: 'checkbox' | 'daterange';
  label: string;
  key: string;
  options?: CheckboxOption[];
}

export interface CheckboxOption {
  label: string;
  value: string;
  color?: string;
}

export interface FilterValues {
  [key: string]: any;
}

export interface DateRange {
  desde?: string;
  hasta?: string;
}
