import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Modal } from '../../../../shared/components/modal/modal';
import { ContainerService } from '../../../../core/services/container.service';
import { Container, ContainerCreateData } from '../../../../core/models/container.model';
import { ConfirmationModal, ConfirmationType } from '../../../../shared/components/confirmation-modal/confirmation-modal';

// Key para localStorage - guardar ID del contenedor creado/actualizado
export const CONTAINER_AUTO_OPEN_KEY = 'container_auto_open_id';

@Component({
  selector: 'app-container-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Modal, ConfirmationModal],
  templateUrl: './container-modal.html',
  styleUrl: './container-modal.scss',
})
export class ContainerModal implements OnInit {
  private fb = inject(FormBuilder);
  private containerService = inject(ContainerService);

  @Input() mode: 'create' | 'edit' = 'create';
  @Input() containerId?: number;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Container>();

  form!: FormGroup;
  loading = signal(false);
  container = signal<Container | null>(null);

  // Estado del modal de notificación
  showNotification = signal(false);
  notificationMessage = signal('');
  notificationType = signal<ConfirmationType>('success');
  private savedContainer: Container | null = null;

  // Estado del modal de confirmación para contenedor nuevo
  showNewContainerConfirm = signal(false);
  newContainerMessage = signal('');

  ngOnInit() {
    this.initForm();

    if (this.mode === 'edit' && this.containerId) {
      this.loadContainer();
    }
  }

  initForm() {
    this.form = this.fb.group({
      container_number: ['', [
        Validators.required,
        Validators.pattern(/^[A-Z]{4}\d{7}$/)
      ]],
      shipment_reference: ['', [Validators.required]],
    });
  }

  loadContainer() {
    if (!this.containerId) return;

    this.loading.set(true);
    this.containerService.getContainer(this.containerId).subscribe({
      next: (response) => {
        const container = response.data;
        this.container.set(container);

        this.form.patchValue({
          container_number: container.container_number,
          shipment_reference: container.shipment_reference,
        });

        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error cargando contenedor:', error);
        this.loading.set(false);
      }
    });
  }

  getTitle(): string {
    return this.mode === 'create' ? 'Agregar nuevo contenedor' : 'Editar contenedor';
  }

  onClose() {
    this.close.emit();
  }

  onSubmit() {
    if (this.form.invalid) return;

    if (this.mode === 'create') {
      // En modo crear, primero verificamos si el contenedor existe
      this.loading.set(true);

      const containerNumber = this.form.value.container_number;
      const shipmentReference = this.form.value.shipment_reference;

      this.containerService.checkContainerExists(containerNumber, shipmentReference).subscribe({
        next: (response) => {
          this.loading.set(false);

          if (response.data?.exists) {
            // El contenedor existe en DB o API, proceder directamente
            this.proceedWithCreate();
          } else {
            // El contenedor NO existe, mostrar confirmación
            this.newContainerMessage.set(
              `El contenedor ${containerNumber} - ${shipmentReference} no existe en el sistema. ¿Desea crear un registro manual?`
            );
            this.showNewContainerConfirm.set(true);
          }
        },
        error: (error) => {
          console.error('Error verificando contenedor:', error);
          this.loading.set(false);
          // Si falla la verificación, proceder de todas formas
          this.proceedWithCreate();
        }
      });
    } else if (this.mode === 'edit' && this.containerId) {
      this.proceedWithUpdate();
    }
  }

  // Confirmar creación de contenedor nuevo
  onConfirmNewContainer() {
    this.showNewContainerConfirm.set(false);
    this.proceedWithCreate();
  }

  // Cancelar creación de contenedor nuevo
  onCancelNewContainer() {
    this.showNewContainerConfirm.set(false);
  }

  // Proceder con la creación del contenedor
  private proceedWithCreate() {
    this.loading.set(true);

    const formData: ContainerCreateData = {
      container_number: this.form.value.container_number,
      shipment_reference: this.form.value.shipment_reference || undefined,
    };

    this.containerService.createContainer(formData).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.savedContainer = response.data;

        // Guardar ID en localStorage para auto-abrir tracking modal
        localStorage.setItem(CONTAINER_AUTO_OPEN_KEY, response.data.id.toString());

        const containerNum = response.data.container_number;
        const reference = response.data.shipment_reference;

        if (response.already_existed) {
          this.notificationType.set('info');
          this.notificationMessage.set(
            `El contenedor ${containerNum} - ${reference} se actualizó correctamente. ${response.movements_imported} movimientos importados.`
          );
        } else {
          this.notificationType.set('success');
          this.notificationMessage.set(
            `El contenedor ${containerNum} - ${reference} se creó correctamente.`
          );
        }

        this.showNotification.set(true);
      },
      error: (error) => {
        console.error('Error procesando contenedor:', error);
        this.loading.set(false);

        const errorMessage = error.error?.message || 'Error al procesar el contenedor';
        this.notificationType.set('error');
        this.notificationMessage.set(errorMessage);
        this.showNotification.set(true);
      }
    });
  }

  // Proceder con la actualización del contenedor
  private proceedWithUpdate() {
    if (!this.containerId) return;

    this.loading.set(true);

    this.containerService.updateContainer(this.containerId, this.form.value).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.savedContainer = response.data;

        // Guardar ID en localStorage para auto-abrir tracking modal
        localStorage.setItem(CONTAINER_AUTO_OPEN_KEY, response.data.id.toString());

        const containerNum = response.data.container_number;
        const reference = response.data.shipment_reference;

        this.notificationType.set('success');
        this.notificationMessage.set(
          `El contenedor ${containerNum} - ${reference} se actualizó correctamente.`
        );
        this.showNotification.set(true);
      },
      error: (error) => {
        console.error('Error actualizando contenedor:', error);
        this.loading.set(false);

        const errorMessage = error.error?.message || 'Error al actualizar el contenedor';
        this.notificationType.set('error');
        this.notificationMessage.set(errorMessage);
        this.showNotification.set(true);
      }
    });
  }

  onNotificationConfirm() {
    this.showNotification.set(false);

    // Si fue exitoso, recargar la página para que se abra automáticamente el tracking modal
    if (this.savedContainer && this.notificationType() !== 'error') {
      window.location.reload();
    } else {
      this.close.emit();
    }
  }
}
