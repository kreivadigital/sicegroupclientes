import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
})
export class SearchBar {
  @Input() placeholder: string = 'Buscar...';
  @Output() searchChange = new EventEmitter<string>();

  searchTerm = signal('');
  private debounceTimer: any;

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);

    // Debounce: esperar 300ms antes de emitir
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.searchChange.emit(value);
    }, 300);
  }

  clearSearch() {
    this.searchTerm.set('');
    this.searchChange.emit('');
  }
}
