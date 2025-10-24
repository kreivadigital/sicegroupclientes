import { Component, Input, Output, EventEmitter, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterConfig, FilterValues, DateRange } from '../../interfaces/filter.interface';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-panel.html',
  styleUrl: './filter-panel.scss',
})
export class FilterPanel {
  @Input() filters: FilterConfig[] = [];
  @Output() filterChange = new EventEmitter<FilterValues>();

  filterValues = signal<FilterValues>({});

  constructor() {
    effect(() => {
      // Emitir cambios cuando filterValues cambie
      const values = this.filterValues();
      if (Object.keys(values).length > 0) {
        this.filterChange.emit(values);
      }
    });
  }

  onCheckboxChange(filterKey: string, optionValue: string, checked: boolean) {
    const currentValues = this.filterValues();
    const currentArray = currentValues[filterKey] || [];

    let newArray: string[];
    if (checked) {
      newArray = [...currentArray, optionValue];
    } else {
      newArray = currentArray.filter((v: string) => v !== optionValue);
    }

    this.filterValues.set({
      ...currentValues,
      [filterKey]: newArray.length > 0 ? newArray : undefined
    });
  }

  onDateChange(filterKey: string, field: 'desde' | 'hasta', value: string) {
    const currentValues = this.filterValues();
    const currentDateRange: DateRange = currentValues[filterKey] || {};

    const newDateRange = {
      ...currentDateRange,
      [field]: value || undefined
    };

    // Si ambos campos están vacíos, eliminar el filtro
    if (!newDateRange.desde && !newDateRange.hasta) {
      const { [filterKey]: removed, ...rest } = currentValues;
      this.filterValues.set(rest);
    } else {
      this.filterValues.set({
        ...currentValues,
        [filterKey]: newDateRange
      });
    }
  }

  isCheckboxChecked(filterKey: string, optionValue: string): boolean {
    const values = this.filterValues()[filterKey] || [];
    return values.includes(optionValue);
  }

  getDateValue(filterKey: string, field: 'desde' | 'hasta'): string {
    const dateRange = this.filterValues()[filterKey] as DateRange;
    return dateRange?.[field] || '';
  }

  clearFilters() {
    this.filterValues.set({});
    this.filterChange.emit({});
  }

  hasActiveFilters(): boolean {
    return Object.keys(this.filterValues()).length > 0;
  }
}
