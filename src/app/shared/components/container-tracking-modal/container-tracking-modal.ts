import { Component, Input, Output, EventEmitter, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Modal } from '../modal/modal';
import { ShipmentMap } from '../shipment-map/shipment-map';
import { ConfirmationModal } from '../confirmation-modal/confirmation-modal';
import { ContainerService } from '../../../core/services/container.service';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { Container, Movement } from '../../../core/models/container.model';
import { MovementEventLabels } from '../../../core/models/enums';
import { Note } from '../../../core/models/notification.model';

@Component({
  selector: 'app-container-tracking-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, Modal, ShipmentMap, ConfirmationModal],
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

  // Movimientos
  movements = signal<Movement[]>([]);
  movementsLoading = signal(false);

  // Orden de eventos para desempate cuando timestamps son iguales (DESC)
  private eventOrder: Record<string, number> = {
    'ARRV': 1,
    'DEPA': 2,
    'NOTI': 3,
    'LOAD': 4
  };

  // Todos los movimientos ordenados por fecha (más reciente primero)
  // Con desempate por orden lógico de eventos cuando timestamps son iguales
  allMovements = computed(() =>
    [...this.movements()].sort((a, b) => {
      const timeA = new Date(a.event_timestamp).getTime();
      const timeB = new Date(b.event_timestamp).getTime();

      // Primero ordenar por timestamp (descendente = más reciente primero)
      if (timeA !== timeB) {
        return timeB - timeA;
      }

      // Si timestamps iguales, ordenar por orden lógico de evento (LOAD antes de DEPA)
      const orderA = this.eventOrder[a.event] ?? 99;
      const orderB = this.eventOrder[b.event] ?? 99;
      return orderA - orderB;
    })
  );

  // Notificación nueva (para el textarea)
  newNotification = '';
  savingNotification = signal(false);

  // Estado de edición (estilo notification-modal)
  editingActivity = signal<Movement | null>(null);

  // Notas de la orden (mostradas en la sección de notas)
  notes = signal<Note[]>([]);
  notesLoading = signal(false);

  // Modal de confirmación de eliminación
  showDeleteConfirm = signal(false);
  movementToDelete = signal<Movement | null>(null);

  ngOnInit() {
    this.loadContainer();
  }

  loadContainer() {
    this.loading.set(true);
    this.containerService.getContainer(this.containerId).subscribe({
      next: (response) => {
        this.container.set(response.data);
        this.loading.set(false);

        // Cargar movimientos y notas (el mapa se carga solo con el containerId)
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

  /**
   * Obtiene el porcentaje de progreso del contenedor
   * El cálculo ahora se realiza en el backend (Container::calculateTransitPercentage)
   * para mantener una única fuente de verdad
   */
  getProgressPercentage(): number {
    const container = this.container();
    if (!container) return 0;

    // Usar el valor calculado por el backend
    return container.calculated_transit_percentage ?? container.transit_percentage ?? 0;
  }

  getProgressSteps() {
    const percentage = this.getProgressPercentage();
    return [
      { label: 'Inicio', icon: 'bi-box-seam', progress: 0, active: percentage >= 0 },
      { label: 'Zarpó', icon: 'ship', progress: 33, active: percentage >= 33 },
      { label: 'Llegada', icon: 'bi-flag', progress: 66, active: percentage >= 66 },
      { label: 'Entregado', icon: 'bi-check-circle', progress: 100, active: percentage >= 100 }
    ];
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  getOriginPortDate(): string {
    const c = this.container();
    if (!c) return 'N/A';
    const dateToUse = c.date_of_loading || c.created_at_shipsgo;
    return this.formatDate(dateToUse);
  }

  // Iniciar edición de una actividad (estilo notification-modal)
  onEditActivity(movement: Movement) {
    this.editingActivity.set(movement);
    this.newNotification = movement.detail || '';
  }

  // Cancelar edición
  onCancelEdit() {
    this.editingActivity.set(null);
    this.newNotification = '';
  }

  // Agregar o actualizar actividad
  onSubmitActivity() {
    if (!this.newNotification.trim()) return;

    this.savingNotification.set(true);
    const editing = this.editingActivity();

    if (editing) {
      // Actualizar actividad existente
      const data = {
        event_timestamp: editing.event_timestamp,
        detail: this.newNotification.trim()
      };

      this.containerService.updateMovement(this.containerId, editing.id, data).subscribe({
        next: (response) => {
          this.movements.update(movements =>
            movements.map(m => m.id === editing.id ? response.data : m)
          );
          this.onCancelEdit();
          this.savingNotification.set(false);
          this.toast.success('Actividad actualizada correctamente');
        },
        error: (error) => {
          console.error('Error actualizando actividad:', error);
          this.toast.error(error.error?.message || 'Error al actualizar actividad');
          this.savingNotification.set(false);
        }
      });
    } else {
      // Crear nueva actividad
      const data = {
        event_timestamp: new Date().toISOString(),
        detail: this.newNotification.trim()
      };

      this.containerService.createMovement(this.containerId, data).subscribe({
        next: (response) => {
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
  }

  // Eliminar movimiento
  deleteMovement(movement: Movement) {
    this.movementToDelete.set(movement);
    this.showDeleteConfirm.set(true);
  }

  onConfirmDeleteMovement() {
    const movement = this.movementToDelete();
    if (!movement) return;

    this.containerService.deleteMovement(this.containerId, movement.id).subscribe({
      next: () => {
        // Remover el movimiento de la lista
        this.movements.update(movements =>
          movements.filter(m => m.id !== movement.id)
        );
        this.toast.success('Actividad eliminada correctamente');
        this.showDeleteConfirm.set(false);
        this.movementToDelete.set(null);
      },
      error: (error) => {
        console.error('Error eliminando actividad:', error);
        this.toast.error(error.error?.message || 'Error al eliminar actividad');
        this.showDeleteConfirm.set(false);
        this.movementToDelete.set(null);
      }
    });
  }

  onCancelDeleteMovement() {
    this.showDeleteConfirm.set(false);
    this.movementToDelete.set(null);
  }

  // Formatear fecha para mostrar en tabla
  formatDateTime(dateString: string): string {
    if (!dateString) return 'N/A';
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
