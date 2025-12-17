import { Injectable } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastConfig {
  message: string;
  type: ToastType;
  duration?: number;
}

interface ActiveToast {
  id: number;
  message: string;
  type: ToastType;
  removing?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: ActiveToast[] = [];
  private toastId = 0;
  private container: HTMLElement | null = null;

  private readonly defaultDuration = 2000; // 2 segundos

  private readonly icons: Record<ToastType, string> = {
    success: 'bi-check-circle-fill',
    error: 'bi-x-circle-fill',
    warning: 'bi-exclamation-triangle-fill',
    info: 'bi-info-circle-fill'
  };

  constructor() {
    this.createContainer();
  }

  private createContainer() {
    if (typeof document === 'undefined') return;

    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      document.body.appendChild(this.container);
    }
  }

  private show(config: ToastConfig) {
    if (!this.container) this.createContainer();
    if (!this.container) return;

    const id = ++this.toastId;
    const duration = config.duration ?? this.defaultDuration;

    const toast: ActiveToast = {
      id,
      message: config.message,
      type: config.type
    };

    this.toasts.push(toast);
    this.render();

    // Auto-remove after duration
    setTimeout(() => this.remove(id), duration);
  }

  private remove(id: number) {
    const toast = this.toasts.find(t => t.id === id);
    if (toast) {
      toast.removing = true;
      this.render();

      // Wait for animation then remove
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id);
        this.render();
      }, 300);
    }
  }

  private render() {
    if (!this.container) return;

    this.container.innerHTML = this.toasts.map(toast => `
      <div class="toast-item toast-${toast.type} ${toast.removing ? 'toast-removing' : ''}" data-id="${toast.id}">
        <i class="bi ${this.icons[toast.type]}"></i>
        <span class="toast-message">${toast.message}</span>
      </div>
    `).join('');
  }

  success(message: string, duration?: number) {
    this.show({ message, type: 'success', duration });
  }

  error(message: string, duration?: number) {
    this.show({ message, type: 'error', duration });
  }

  warning(message: string, duration?: number) {
    this.show({ message, type: 'warning', duration });
  }

  info(message: string, duration?: number) {
    this.show({ message, type: 'info', duration });
  }
}
