import { Component, Input, Output, EventEmitter, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Modal } from '../modal/modal';
import { VesselMap } from '../vessel-map/vessel-map';
import { ContainerService } from '../../../core/services/container.service';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { Container, VesselInfo, Movement } from '../../../core/models/container.model';
import { MovementEventLabels } from '../../../core/models/enums';
import { Note } from '../../../core/models/notification.model';

@Component({
  selector: 'app-container-tracking-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, Modal, VesselMap],
  templateUrl: './container-tracking-modal.html',
  styleUrl: './container-tracking-modal.scss',
})
export class ContainerTrackingModal implements OnInit {
  private containerService = inject(ContainerService);
  private orderService = inject(OrderService);
  private toast = inject(ToastService);

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

  // Movimientos
  movements = signal<Movement[]>([]);
  movementsLoading = signal(false);

  // Todos los movimientos ordenados por fecha (más reciente primero)
  allMovements = computed(() =>
    [...this.movements()].sort((a, b) =>
      new Date(b.event_timestamp).getTime() - new Date(a.event_timestamp).getTime()
    )
  );

  // Notificación nueva (para el textarea)
  newNotification = '';
  savingNotification = signal(false);

  // Estado de edición
  editingMovementId = signal<number | null>(null);
  editingDetail = '';
  editingTimestamp = '';

  // Notas de la orden (mostradas en la sección de notas)
  notes = signal<Note[]>([]);
  notesLoading = signal(false);

  ngOnInit() {
    this.loadContainer();
  }

  loadContainer() {
    this.loading.set(true);
    this.containerService.getContainer(this.containerId).subscribe({
      next: (response) => {
        this.container.set(response.data);
        this.loading.set(false);

        // Cargar vessel info, movimientos y notas
        this.loadVesselInfo(this.containerId);
        this.loadMovements();
        this.loadNotes();
      },
      error: (error) => {
        console.error('Error cargando contenedor:', error);
        this.loading.set(false);
      }
    });
  }

  loadMovements() {
    this.movementsLoading.set(true);
    this.containerService.getContainerMovements(this.containerId).subscribe({
      next: (response) => {
        this.movements.set(response.data || []);
        this.movementsLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando movimientos:', error);
        this.movementsLoading.set(false);
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
    const container = this.container();
    if (!container) return 0;

    const transitPercentage = container.transit_percentage || 0;
    const destinationPort = (container.destination_port_name || '').toLowerCase();
    const movements = this.movements();

    // Filtrar solo movimientos confirmados (ACT)
    const confirmedMovements = movements.filter(m => m.event_status === 'ACT');

    // Verificar DISC en puerto destino → mínimo 100%
    const hasDischargedAtDestination = confirmedMovements.some(m =>
      m.event === 'DISC' &&
      (m.location_name || '').toLowerCase() === destinationPort
    );
    if (hasDischargedAtDestination) {
      return Math.max(100, transitPercentage);
    }

    // Verificar ARRV en puerto destino → mínimo 66%
    const hasArrivedAtDestination = confirmedMovements.some(m =>
      m.event === 'ARRV' &&
      (m.location_name || '').toLowerCase() === destinationPort
    );
    if (hasArrivedAtDestination) {
      return Math.max(66, transitPercentage);
    }

    // Verificar DEPA (cualquier puerto) → mínimo 33%
    const hasDeparted = confirmedMovements.some(m => m.event === 'DEPA');
    if (hasDeparted) {
      return Math.max(33, transitPercentage);
    }

    // Sin movimientos relevantes → máximo 15%
    return Math.min(15, transitPercentage);
  }

  getProgressSteps() {
    const percentage = this.getProgressPercentage();
    return [
      { label: 'Inicio', icon: 'bi-box-seam', progress: 0, active: percentage >= 0 },
      { label: 'Zarpó', icon: 'bi-truck', progress: 33, active: percentage >= 33 },
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
    if (!this.newNotification.trim()) return;

    this.savingNotification.set(true);

    const data = {
      event_timestamp: new Date().toISOString(),
      detail: this.newNotification.trim()
    };

    this.containerService.createMovement(this.containerId, data).subscribe({
      next: (response) => {
        // Agregar el nuevo movimiento a la lista
        this.movements.update(movements => [response.data, ...movements]);
        this.newNotification = '';
        this.savingNotification.set(false);
        this.toast.success('Actividad agregada correctamente');
      },
      error: (error) => {
        console.error('Error creando actividad:', error);
        this.toast.error(error.error?.message || 'Error al agregar actividad');
        this.savingNotification.set(false);
      }
    });
  }

  // Iniciar edición de un movimiento
  startEdit(movement: Movement) {
    this.editingMovementId.set(movement.id);
    this.editingDetail = movement.detail || '';
    this.editingTimestamp = this.formatDateTimeForInput(movement.event_timestamp);
  }

  // Cancelar edición
  cancelEdit() {
    this.editingMovementId.set(null);
    this.editingDetail = '';
    this.editingTimestamp = '';
  }

  // Guardar edición
  saveEdit(movement: Movement) {
    if (!this.editingDetail.trim()) return;

    const data = {
      event_timestamp: this.editingTimestamp,
      detail: this.editingDetail.trim()
    };

    this.containerService.updateMovement(this.containerId, movement.id, data).subscribe({
      next: (response) => {
        // Actualizar el movimiento en la lista
        this.movements.update(movements =>
          movements.map(m => m.id === movement.id ? response.data : m)
        );
        this.cancelEdit();
        this.toast.success('Actividad actualizada correctamente');
      },
      error: (error) => {
        console.error('Error actualizando actividad:', error);
        this.toast.error(error.error?.message || 'Error al actualizar actividad');
      }
    });
  }

  // Eliminar movimiento
  deleteMovement(movement: Movement) {
    if (!confirm('¿Está seguro de eliminar esta actividad?')) return;

    this.containerService.deleteMovement(this.containerId, movement.id).subscribe({
      next: () => {
        // Remover el movimiento de la lista
        this.movements.update(movements =>
          movements.filter(m => m.id !== movement.id)
        );
        this.toast.success('Actividad eliminada correctamente');
      },
      error: (error) => {
        console.error('Error eliminando actividad:', error);
        this.toast.error(error.error?.message || 'Error al eliminar actividad');
      }
    });
  }

  // Formatear fecha para mostrar en tabla
  formatDateTime(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Formatear fecha para input datetime-local
  formatDateTimeForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }

  // Verificar si un movimiento es editable (solo NOTI)
  isEditable(movement: Movement): boolean {
    return movement.event === 'NOTI';
  }

  // ==========================================
  // NOTAS DE ORDEN
  // ==========================================

  loadNotes() {
    if (!this.orderNumber) {
      this.notes.set([]);
      return;
    }

    this.notesLoading.set(true);
    this.orderService.getOrderNotes(this.orderNumber).subscribe({
      next: (response) => {
        this.notes.set(response.data || []);
        this.notesLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando notas:', error);
        this.notesLoading.set(false);
      }
    });
  }

  onClose() {
    this.close.emit();
  }
}
