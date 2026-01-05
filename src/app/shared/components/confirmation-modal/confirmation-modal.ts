import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ConfirmationType = 'success' | 'error' | 'warning' | 'update' | 'delete' | 'info';

export interface ConfirmationConfig {
  type: ConfirmationType;
  icon?: string;
  message: string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-modal.html',
  styleUrl: './confirmation-modal.scss',
})
export class ConfirmationModal {
  @Input() type: ConfirmationType = 'success';
  @Input() icon?: string;
  @Input() message: string = '';
  @Input() title?: string;
  @Input() confirmText?: string;
  @Input() cancelText: string = 'Cancelar';
  @Input() showCancel: boolean = true;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  // Iconos por defecto según el tipo
  private defaultIcons: Record<ConfirmationType, string> = {
    success: 'bi-check-circle',
    error: 'bi-x-circle',
    warning: 'bi-exclamation-triangle',
    update: 'bi-arrow-repeat',
    delete: 'bi-trash',
    info: 'bi-info-circle'
  };

  // Textos de confirmación por defecto según el tipo
  private defaultConfirmTexts: Record<ConfirmationType, string> = {
    success: 'Aceptar',
    error: 'Aceptar',
    warning: 'Continuar',
    update: 'Actualizar',
    delete: 'Eliminar',
    info: 'Aceptar'
  };

  // Títulos por defecto según el tipo
  private defaultTitles: Record<ConfirmationType, string> = {
    success: 'Éxito',
    error: 'Error',
    warning: 'Advertencia',
    update: 'Actualizar',
    delete: 'Eliminar',
    info: 'Información'
  };

  get displayIcon(): string {
    return this.icon || this.defaultIcons[this.type];
  }

  get displayTitle(): string {
    return this.title || this.defaultTitles[this.type];
  }

  get displayConfirmText(): string {
    return this.confirmText || this.defaultConfirmTexts[this.type];
  }

  get iconColorClass(): string {
    const colorClasses: Record<ConfirmationType, string> = {
      success: 'text-success',
      error: 'text-danger',
      warning: 'text-warning',
      update: 'text-primary',
      delete: 'text-danger',
      info: 'text-info'
    };
    return colorClasses[this.type];
  }

  get confirmButtonClass(): string {
    const buttonClasses: Record<ConfirmationType, string> = {
      success: 'btn-success',
      error: 'btn-danger',
      warning: 'btn-warning',
      update: 'btn-primary',
      delete: 'btn-danger',
      info: 'btn-info'
    };
    return buttonClasses[this.type];
  }

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }

  onBackdropClick() {
    this.cancel.emit();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.cancel.emit();
  }
}
