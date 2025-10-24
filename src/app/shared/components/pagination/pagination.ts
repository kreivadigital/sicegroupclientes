import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class Pagination {
  @Input() set currentPage(value: number) {
    this._currentPage.set(value);
  }
  @Input() set totalPages(value: number) {
    this._totalPages.set(value);
  }
  @Input() set totalItems(value: number) {
    this._totalItems.set(value);
  }
  @Input() set perPage(value: number) {
    this._perPage.set(value);
  }

  @Output() pageChange = new EventEmitter<number>();

  private _currentPage = signal(1);
  private _totalPages = signal(1);
  private _totalItems = signal(0);
  private _perPage = signal(15);

  currentPageValue = computed(() => this._currentPage());
  totalPagesValue = computed(() => this._totalPages());
  totalItemsValue = computed(() => this._totalItems());
  perPageValue = computed(() => this._perPage());

  isFirstPage = computed(() => this._currentPage() === 1);
  isLastPage = computed(() => this._currentPage() === this._totalPages());

  showingFrom = computed(() => {
    return (this._currentPage() - 1) * this._perPage() + 1;
  });

  showingTo = computed(() => {
    const to = this._currentPage() * this._perPage();
    return to > this._totalItems() ? this._totalItems() : to;
  });

  goToPage(page: number) {
    if (page >= 1 && page <= this._totalPages()) {
      this.pageChange.emit(page);
    }
  }

  previousPage() {
    if (!this.isFirstPage()) {
      this.goToPage(this._currentPage() - 1);
    }
  }

  nextPage() {
    if (!this.isLastPage()) {
      this.goToPage(this._currentPage() + 1);
    }
  }

  getPageNumbers(): number[] {
    const current = this._currentPage();
    const total = this._totalPages();
    const pages: number[] = [];

    if (total <= 7) {
      // Mostrar todas las páginas si son 7 o menos
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Siempre mostrar primera página
      pages.push(1);

      if (current > 3) {
        pages.push(-1); // -1 representa "..."
      }

      // Mostrar páginas alrededor de la actual
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 2) {
        pages.push(-1); // "..."
      }

      // Siempre mostrar última página
      pages.push(total);
    }

    return pages;
  }
}
