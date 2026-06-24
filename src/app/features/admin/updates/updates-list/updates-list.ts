import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContainerUpdateService } from '../../../../core/services/container-update.service';
import { ContainerUpdate } from '../../../../core/models/container-update.model';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { SearchBar } from '../../../../shared/components/search-bar/search-bar';

@Component({
  selector: 'app-updates-list',
  standalone: true,
  imports: [CommonModule, Pagination, SearchBar],
  templateUrl: './updates-list.html',
  styleUrl: './updates-list.scss',
})
export class UpdatesList implements OnInit {
  private updateService = inject(ContainerUpdateService);

  updates = signal<ContainerUpdate[]>([]);
  loading = signal<boolean>(false);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  totalItems = signal<number>(0);
  perPage = signal<number>(20);

  currentSearch = signal<string>('');
  sourceFilter = signal<'' | 'webhook' | 'sync'>('');

  ngOnInit() {
    this.load();
  }

  load(page: number = 1) {
    this.loading.set(true);

    const filters: { container_number?: string; source?: 'webhook' | 'sync' } = {};
    if (this.currentSearch()) filters.container_number = this.currentSearch();
    const src = this.sourceFilter();
    if (src) filters.source = src;

    this.updateService.getUpdates(page, filters).subscribe({
      next: (response) => {
        const p = response.data as any;
        this.updates.set(p.data || []);
        this.currentPage.set(p.current_page);
        this.totalPages.set(p.last_page);
        this.totalItems.set(p.total);
        this.perPage.set(p.per_page);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error cargando actualizaciones:', error);
        this.loading.set(false);
      },
    });
  }

  onSearch(term: string) {
    this.currentSearch.set(term);
    this.load(1);
  }

  onSourceChange(src: '' | 'webhook' | 'sync') {
    this.sourceFilter.set(src);
    this.load(1);
  }

  onPageChange(page: number) {
    this.load(page);
  }
}
