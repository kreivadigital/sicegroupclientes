import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Modal } from '../modal/modal';
import { NotificationService } from '../../../core/services/notification';
import { Notification } from '../../../core/models/notification.model';
import { NotificationType, NotificationTypeLabels } from '../../../core/models/enums';

@Component({
  selector: 'app-notification-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Modal],
  templateUrl: './notification-modal.html',
  styleUrl: './notification-modal.scss',
})
export class NotificationModal implements OnInit {
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);

  @Input({ required: true }) orderId!: number;
  @Input() orderNumber?: number;

  @Output() close = new EventEmitter<void>();

  // State
  notifications = signal<Notification[]>([]);
  loading = signal(false);
  saving = signal(false);

  // Form para agregar/editar
  form!: FormGroup;
  editingNotification = signal<Notification | null>(null);

  // Tipos de notificación disponibles (solo Notas)
  notificationTypes = [
    { value: NotificationType.Note, label: NotificationTypeLabels[NotificationType.Note] }
  ];

  ngOnInit() {
    this.initForm();
    this.loadNotifications();
  }

  initForm() {
    this.form = this.fb.group({
      type: [NotificationType.Note],
      message: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  loadNotifications() {
    this.loading.set(true);
    this.notificationService.getNotificationsByOrder(this.orderId).subscribe({
      next: (response) => {
        this.notifications.set(response.data || []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error cargando notificaciones:', error);
        this.loading.set(false);
      }
    });
  }

  getTitle(): string {
    return this.orderNumber
      ? `Notificaciones - Orden #${this.orderNumber}`
      : 'Notificaciones';
  }

  onEdit(notification: Notification) {
    this.editingNotification.set(notification);
    this.form.patchValue({
      type: notification.type,
      message: notification.message
    });
  }

  onCancelEdit() {
    this.editingNotification.set(null);
    this.form.reset({
      type: NotificationType.Note,
      message: ''
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.saving.set(true);
    const formValue = this.form.value;
    const editing = this.editingNotification();

    if (editing) {
      // Actualizar notificación existente
      this.notificationService.updateNotification(this.orderId, editing.id, {
        type: formValue.type,
        message: formValue.message
      }).subscribe({
        next: () => {
          this.loadNotifications();
          this.onCancelEdit();
          this.saving.set(false);
        },
        error: (error) => {
          console.error('Error actualizando notificación:', error);
          this.saving.set(false);
        }
      });
    } else {
      // Crear nueva notificación
      this.notificationService.createNotification({
        order_id: this.orderId,
        type: formValue.type,
        message: formValue.message
      }).subscribe({
        next: () => {
          this.loadNotifications();
          this.form.reset({
            type: NotificationType.Note,
            message: ''
          });
          this.saving.set(false);
        },
        error: (error) => {
          console.error('Error creando notificación:', error);
          this.saving.set(false);
        }
      });
    }
  }

  onClose() {
    this.close.emit();
  }
}
