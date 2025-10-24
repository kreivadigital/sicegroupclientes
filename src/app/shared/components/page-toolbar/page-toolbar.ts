import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBar } from '../search-bar/search-bar';
import { FilterPanel } from '../filter-panel/filter-panel';
import { FilterConfig, FilterValues } from '../../interfaces/filter.interface';

@Component({
  selector: 'app-page-toolbar',
  standalone: true,
  imports: [CommonModule, SearchBar, FilterPanel],
  templateUrl: './page-toolbar.html',
  styleUrl: './page-toolbar.scss',
})
export class PageToolbar {
  @Input() showSearch: boolean = true;
  @Input() showFilters: boolean = true;
  @Input() searchPlaceholder: string = 'Buscar...';
  @Input() filters: FilterConfig[] = [];
  @Input() addButtonText: string = '';
  @Input() showAddButton: boolean = true;

  @Output() searchChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<FilterValues>();
  @Output() addClick = new EventEmitter<void>();
}
