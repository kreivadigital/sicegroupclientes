import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableColumn, TableAction } from '../../interfaces/table.interface';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable {
  @Input() columns: TableColumn[] = [];
  @Input() set data(value: any[]) {
    this._data = Array.isArray(value) ? value : [];
  }
  get data(): any[] {
    return this._data;
  }
  private _data: any[] = [];

  @Input() actions: TableAction[] = [];
  @Input() loading: boolean = false;
  @Input() emptyMessage: string = 'No hay datos para mostrar';

  @Output() actionClick = new EventEmitter<{ action: string; row: any }>();

  getCellValue(row: any, column: TableColumn): any {
    const keys = column.key.split('.');
    let value = row;

    for (const key of keys) {
      value = value?.[key];
      if (value === undefined || value === null) break;
    }

    return value;
  }

  getBadgeClass(column: TableColumn, value: string): string {
    if (!column.badgeConfig) return 'bg-secondary';
    const color = column.badgeConfig.colorMap[value] || 'secondary';
    return `bg-${color}`;
  }

  getBadgeLabel(column: TableColumn, value: string): string {
    if (!column.badgeConfig) return value;
    return column.badgeConfig.labelMap[value] || value;
  }

  // Para columnas tipo 'port-with-date'
  getPortLocation(row: any, column: TableColumn): string {
    if (!column.portConfig) return '';
    return this.getNestedValue(row, column.portConfig.locationKey);
  }

  getPortCountry(row: any, column: TableColumn): string {
    if (!column.portConfig) return '';
    return this.getNestedValue(row, column.portConfig.countryKey);
  }

  getPortDate(row: any, column: TableColumn): string {
    if (!column.portConfig) return '';
    return this.getNestedValue(row, column.portConfig.dateKey);
  }

  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
      value = value?.[key];
      if (value === undefined || value === null) break;
    }

    return value;
  }

  onActionClick(action: TableAction, row: any) {
    this.actionClick.emit({ action: action.action, row });
  }
}
