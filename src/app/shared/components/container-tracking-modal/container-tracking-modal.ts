import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Modal } from '../modal/modal';
import { VesselMap } from '../vessel-map/vessel-map';
import { ContainerService } from '../../../core/services/container.service';
import { Container, VesselInfo } from '../../../core/models/container.model';

@Component({
  selector: 'app-container-tracking-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, Modal, VesselMap],
  templateUrl: './container-tracking-modal.html',
  styleUrl: './container-tracking-modal.scss',
})
export class ContainerTrackingModal implements OnInit {
  private containerService = inject(ContainerService);

  // Input requerido: ID del container
  @Input() containerId!: number;

  // Input opcional: Número de orden (solo se muestra si viene de Orders)
  @Input() orderNumber?: number;

  // Input para controlar visibilidad de "Agregar notificación"
  @Input() showAddNotification: boolean = false;

  @Output() close = new EventEmitter<void>();

  loading = signal(false);
  container = signal<Container | null>(null);

  // Map loading state
  mapLoading = signal(false);
  vesselInfo = signal<VesselInfo | null>(null);

  // Notificación nueva (para el textarea)
  newNotification = '';

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
    this.loadContainer();
  }

  loadContainer() {
    this.loading.set(true);
    this.containerService.getContainer(this.containerId).subscribe({
      next: (response) => {
        this.container.set(response.data);
        this.loading.set(false);

        // Cargar vessel info
        this.loadVesselInfo(this.containerId);
      },
      error: (error) => {
        console.error('Error cargando contenedor:', error);
        this.loading.set(false);
      }
    });
  }

  loadVesselInfo(containerId: number) {
    this.mapLoading.set(true);
    const startTime = Date.now();
    const minLoadingTime = 1500; // 1.5 segundos mínimo

    this.containerService.getVesselInfo(containerId).subscribe({
      next: (response) => {
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsed);

        setTimeout(() => {
          this.vesselInfo.set(response.data);
          this.mapLoading.set(false);
        }, remainingTime);
      },
      error: (error) => {
        console.error('Error cargando vessel info:', error);
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsed);

        setTimeout(() => {
          this.vesselInfo.set({
            vessel_imo: null,
            vessel_name: null,
            map_token: null,
            source: 'error'
          });
          this.mapLoading.set(false);
        }, remainingTime);
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'NEW': 'badge bg-secondary',
      'BOOKED': 'badge bg-info',
      'INPROGRESS': 'badge bg-warning',
      'SAILING': 'badge bg-primary',
      'ARRIVED': 'badge bg-success',
      'DELIVERED': 'badge bg-success',
      'CANCELLED': 'badge bg-danger'
    };
    return statusClasses[status] || 'badge bg-secondary';
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'NEW': 'Nuevo',
      'BOOKED': 'Reservado',
      'INPROGRESS': 'En Proceso',
      'SAILING': 'En Tránsito',
      'ARRIVED': 'Arribado',
      'DELIVERED': 'Entregado',
      'CANCELLED': 'Cancelado'
    };
    return statusLabels[status] || status;
  }

  getProgressPercentage(): number {
    return this.container()?.transit_percentage || 0;
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

  onAddNotification() {
    // TODO: Implementar lógica para agregar notificación
    console.log('Agregar notificación:', this.newNotification);
  }

  onClose() {
    this.close.emit();
  }
}
