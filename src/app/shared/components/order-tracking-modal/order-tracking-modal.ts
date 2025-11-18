import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Modal } from '../modal/modal';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-tracking-modal',
  standalone: true,
  imports: [CommonModule, Modal],
  templateUrl: './order-tracking-modal.html',
  styleUrl: './order-tracking-modal.scss',
})
export class OrderTrackingModal implements OnInit {
  private orderService = inject(OrderService);

  @Input() orderId!: number;
  @Output() close = new EventEmitter<void>();

  loading = signal(false);
  order = signal<Order | null>(null);

  // Datos hardcoded para notificaciones
  notifications = [
    {
      date: '10/11/2025',
      detail: 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore'
    },
    {
      date: '10/11/2025',
      detail: 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore'
    },
    {
      date: '10/11/2025',
      detail: 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore'
    }
  ];

  ngOnInit() {
    this.loadOrder();
  }

  loadOrder() {
    this.loading.set(true);
    this.orderService.getOrder(this.orderId).subscribe({
      next: (response) => {
        this.order.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error cargando orden:', error);
        this.loading.set(false);
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'badge bg-warning',
      'processing': 'badge bg-info',
      'shipped': 'badge bg-warning',
      'delivered': 'badge bg-success',
      'cancelled': 'badge bg-danger'
    };
    return statusClasses[status] || 'badge bg-secondary';
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'pending': 'Pendiente',
      'processing': 'En Proceso',
      'shipped': 'En tránsito',
      'delivered': 'Entregada',
      'cancelled': 'Cancelada'
    };
    return statusLabels[status] || status;
  }

  getProgressPercentage(): number {
    return this.order()?.container?.transit_porcentage || 0;
  }

  getProgressSteps() {
    const percentage = this.getProgressPercentage();
    return [
      { label: 'Inicio', icon: 'bi-box-seam', progress: 0, active: percentage >= 0 },
      { label: 'Partió', icon: 'bi-truck', progress: 33, active: percentage >= 33 },
      { label: 'Llegada', icon: 'bi-flag', progress: 66, active: percentage >= 66 },
      { label: 'Entregado', icon: 'bi-check-circle', progress: 100, active: percentage >= 100 }
    ];
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  onClose() {
    this.close.emit();
  }
}
