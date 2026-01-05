import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ContentChild, TemplateRef, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableColumn, TableAction } from '../../interfaces/table.interface';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

export interface AppliedFilter {
  key: string;
  label: string;
  value: string;
  displayValue: string;
}

export interface FilterChangeEvent {
  filters: AppliedFilter[];
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable implements OnInit, OnDestroy {
  // Template para vista de cards en móvil (opcional)
  @ContentChild('cardTemplate') cardTemplate?: TemplateRef<any>;

  // Signal para detectar si es móvil
  isMobile = signal(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  // Listener para cambios de tamaño de ventana
  @HostListener('window:resize')
  onResize() {
    this.isMobile.set(window.innerWidth < 768);
  }

  @Input() columns: TableColumn[] = [];
  @Input() set data(value: any[]) {
    this._data = Array.isArray(value) ? value : [];
  }
  get data(): any[] {
    return this._data;
  }
  private _data: any[] = [];

  // Datos filtrados (búsqueda + filtros aplicados)
  get filteredData(): any[] {
    let result = this._data;

    // Filtro por búsqueda de texto
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(row => {
        // Buscar en Nro de Orden (id)
        const orderId = row.id?.toString() || '';
        if (orderId.toLowerCase().includes(term)) {
          return true;
        }

        // Buscar en Nro de Referencia (container.shipment_reference)
        const reference = row.container?.shipment_reference?.toString() || '';
        if (reference.toLowerCase().includes(term)) {
          return true;
        }

        return false;
      });
    }

    // Filtro por estados (si hay estados seleccionados en appliedFilters)
    const statusFilters = this.appliedFilters
      .filter(f => f.key.startsWith('status_'))
      .map(f => f.value);

    if (statusFilters.length > 0) {
      result = result.filter(row => statusFilters.includes(row.status));
    }

    // Filtro por fecha desde (created_at >= dateFrom)
    const dateFromFilter = this.appliedFilters.find(f => f.key === 'dateFrom');
    if (dateFromFilter) {
      // Parsear como fecha local (YYYY-MM-DD -> año, mes-1, día)
      const [year, month, day] = dateFromFilter.value.split('-').map(Number);
      const fromDate = new Date(year, month - 1, day, 0, 0, 0, 0);

      result = result.filter(row => {
        if (!row.created_at) return false;
        const rowDate = new Date(row.created_at);
        // Comparar solo año/mes/día en hora local
        const rowDateOnly = new Date(rowDate.getFullYear(), rowDate.getMonth(), rowDate.getDate());
        return rowDateOnly >= fromDate;
      });
    }

    // Filtro por fecha hasta (date_of_discharge <= dateTo)
    const dateToFilter = this.appliedFilters.find(f => f.key === 'dateTo');
    if (dateToFilter) {
      // Parsear como fecha local (YYYY-MM-DD -> año, mes-1, día)
      const [year, month, day] = dateToFilter.value.split('-').map(Number);
      const toDate = new Date(year, month - 1, day, 23, 59, 59, 999);

      result = result.filter(row => {
        const dischargeDate = row.container?.date_of_discharge;
        if (!dischargeDate) return false;
        const rowDate = new Date(dischargeDate);
        // Comparar solo año/mes/día en hora local
        const rowDateOnly = new Date(rowDate.getFullYear(), rowDate.getMonth(), rowDate.getDate());
        return rowDateOnly <= toDate;
      });
    }

    return result;
  }

  @Input() actions: TableAction[] = [];
  @Input() loading: boolean = false;
  @Input() emptyMessage: string = 'No hay datos para mostrar';

  // Función para aplicar clases CSS condicionales a filas/cards
  @Input() rowClassFn?: (row: any) => string;

  // Nuevos inputs para header
  @Input() title: string = '';
  @Input() showFilters: boolean = false;
  @Input() showSearch: boolean = false;

  // Outputs
  @Output() actionClick = new EventEmitter<{ action: string; row: any }>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<FilterChangeEvent>();

  // Estado interno
  searchTerm: string = '';
  showFilterDropdown: boolean = false;
  appliedFilters: AppliedFilter[] = [];

  // Filtros temporales (dentro del dropdown)
  selectedStatuses: string[] = [];
  dateFrom: string = '';
  dateTo: string = '';

  // Fecha máxima para inputs de fecha (hoy)
  today: string = new Date().toISOString().split('T')[0];

  // Opciones de estado
  statusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'processing', label: 'En Proceso' },
    { value: 'shipped', label: 'En Tránsito' },
    { value: 'delivered', label: 'Entregado' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  // Debounce para búsqueda
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Getter para mostrar el header
  get showHeader(): boolean {
    return !!this.title || this.showFilters || this.showSearch;
  }

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchChange.emit(term);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm = value;
    this.searchSubject.next(value);
  }

  toggleFilterDropdown() {
    this.showFilterDropdown = !this.showFilterDropdown;
  }

  closeFilterDropdown() {
    this.showFilterDropdown = false;
  }

  toggleStatus(statusValue: string) {
    const index = this.selectedStatuses.indexOf(statusValue);
    if (index === -1) {
      this.selectedStatuses.push(statusValue);
    } else {
      this.selectedStatuses.splice(index, 1);
    }
  }

  isStatusSelected(statusValue: string): boolean {
    return this.selectedStatuses.includes(statusValue);
  }

  applyFilters() {
    this.appliedFilters = [];

    // Agregar un chip por cada estado seleccionado
    for (const statusValue of this.selectedStatuses) {
      const statusOption = this.statusOptions.find(s => s.value === statusValue);
      this.appliedFilters.push({
        key: `status_${statusValue}`,
        label: 'Estado',
        value: statusValue,
        displayValue: statusOption?.label || statusValue
      });
    }

    if (this.dateFrom) {
      this.appliedFilters.push({
        key: 'dateFrom',
        label: 'Desde',
        value: this.dateFrom,
        displayValue: this.formatDate(this.dateFrom)
      });
    }

    if (this.dateTo) {
      this.appliedFilters.push({
        key: 'dateTo',
        label: 'Hasta',
        value: this.dateTo,
        displayValue: this.formatDate(this.dateTo)
      });
    }

    this.filterChange.emit({ filters: this.appliedFilters });
    this.closeFilterDropdown();
  }

  removeFilter(filter: AppliedFilter) {
    // Limpiar el valor del filtro
    if (filter.key.startsWith('status_')) {
      const statusValue = filter.key.replace('status_', '');
      this.selectedStatuses = this.selectedStatuses.filter(s => s !== statusValue);
    }
    if (filter.key === 'dateFrom') this.dateFrom = '';
    if (filter.key === 'dateTo') this.dateTo = '';

    // Remover del array
    this.appliedFilters = this.appliedFilters.filter(f => f.key !== filter.key);
    this.filterChange.emit({ filters: this.appliedFilters });
  }

  clearAllFilters() {
    this.selectedStatuses = [];
    this.dateFrom = '';
    this.dateTo = '';
    this.appliedFilters = [];
    this.filterChange.emit({ filters: [] });
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

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

  // Handler para cards - acepta objeto directamente
  handleCardAction = (event: { action: string; row: any }) => {
    this.actionClick.emit(event);
  };

  // Obtiene la clase CSS para una fila basada en rowClassFn
  getRowClass(row: any): string {
    return this.rowClassFn ? this.rowClassFn(row) : '';
  }
}
