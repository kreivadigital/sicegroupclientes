import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {
  @Input() title: string = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() showFooter: boolean = true;
  @Input() closeOnBackdrop: boolean = true;
  
  @Output() close = new EventEmitter<void>();

  onBackdropClick() {
    if (this.closeOnBackdrop) {
      this.close.emit();
    }
  }

  onClose() {
    this.close.emit();
  }

  // Cerrar con tecla ESC
  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.close.emit();
  }
}
