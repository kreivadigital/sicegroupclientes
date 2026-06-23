import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SyncResult } from '../../../../core/services/container.service';
import { ContainerStatusLabels } from '../../../../core/models/enums';

@Component({
  selector: 'app-sync-result-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sync-result-modal.html',
  styleUrl: './sync-result-modal.scss',
})
export class SyncResultModal {
  @Input({ required: true }) result!: SyncResult;
  @Output() close = new EventEmitter<void>();

  // Secciones colapsables
  showUnchanged = signal(false);
  showErrors = signal(true);

  onClose() {
    this.close.emit();
  }

  toggleUnchanged() {
    this.showUnchanged.update((v) => !v);
  }

  toggleErrors() {
    this.showErrors.update((v) => !v);
  }

  statusLabel(status: string): string {
    return ContainerStatusLabels[status as keyof typeof ContainerStatusLabels] || status;
  }

  statusColor(status: string): string {
    const colorMap: Record<string, string> = {
      NEW: 'secondary',
      INPROGRESS: 'info',
      BOOKED: 'primary',
      LOADED: 'warning',
      SAILING: 'primary',
      ARRIVED: 'success',
      DISCHARGED: 'success',
      UNTRACKED: 'danger',
      CANCELLED: 'secondary',
    };
    return colorMap[status] || 'secondary';
  }
}
