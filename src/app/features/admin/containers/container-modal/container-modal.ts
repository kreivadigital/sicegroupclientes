import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Modal } from '../../../../shared/components/modal/modal';
import { ContainerService } from '../../../../core/services/container.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Container, ContainerCreateData } from '../../../../core/models/container.model';

@Component({
  selector: 'app-container-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Modal],
  templateUrl: './container-modal.html',
  styleUrl: './container-modal.scss',
})
export class ContainerModal implements OnInit {
  private fb = inject(FormBuilder);
  private containerService = inject(ContainerService);
  private toast = inject(ToastService);

  @Input() mode: 'create' | 'edit' = 'create';
  @Input() containerId?: number;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Container>();

  form!: FormGroup;
  loading = signal(false);
  container = signal<Container | null>(null);

  // Estado del resultado
  resultMessage = signal<string | null>(null);
  resultType = signal<'success' | 'info' | 'error' | null>(null);
  showResult = signal(false);

  ngOnInit() {
    this.initForm();

    if (this.mode === 'edit' && this.containerId) {
      this.loadContainer();
    }
  }

  initForm() {
    this.form = this.fb.group({
      container_number: ['', [Validators.required, Validators.maxLength(50)]],
      shipment_reference: ['', [Validators.required, Validators.maxLength(255)]],
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

    this.loading.set(true);
    this.resetResult();

    if (this.mode === 'create') {
      const formData: ContainerCreateData = {
        container_number: this.form.value.container_number,
        shipment_reference: this.form.value.shipment_reference || undefined,
      };

      this.containerService.createContainer(formData).subscribe({
        next: (response) => {
          this.loading.set(false);

          // Mostrar toast y mensaje según el resultado
          if (response.already_existed) {
            this.toast.info('Contenedor actualizado');
            this.showResultMessage(
              `El contenedor ya existía y fue actualizado. ${response.movements_imported} movements importados.`,
              'info'
            );
          } else {
            this.toast.success('Contenedor creado correctamente');
            this.showResultMessage(
              `Contenedor creado exitosamente. ${response.movements_imported} movements importados.`,
              'success'
            );
          }

          // Emitir y cerrar después de un delay para mostrar el mensaje
          setTimeout(() => {
            this.save.emit(response.data);
            this.close.emit();
          }, 1500);
        },
        error: (error) => {
          console.error('Error procesando contenedor:', error);
          this.loading.set(false);

          const errorMessage = error.error?.message || 'Error al procesar el contenedor';
          this.toast.error(errorMessage);
          this.showResultMessage(errorMessage, 'error');
        }
      });
    } else if (this.mode === 'edit' && this.containerId) {
      this.containerService.updateContainer(this.containerId, this.form.value).subscribe({
        next: (response) => {
          this.loading.set(false);
          this.toast.success('Contenedor actualizado correctamente');
          this.save.emit(response.data);
          this.close.emit();
        },
        error: (error) => {
          console.error('Error actualizando contenedor:', error);
          this.loading.set(false);

          const errorMessage = error.error?.message || 'Error al actualizar el contenedor';
          this.toast.error(errorMessage);
          this.showResultMessage(errorMessage, 'error');
        }
      });
    }
  }

  private showResultMessage(message: string, type: 'success' | 'info' | 'error') {
    this.resultMessage.set(message);
    this.resultType.set(type);
    this.showResult.set(true);
  }

  private resetResult() {
    this.resultMessage.set(null);
    this.resultType.set(null);
    this.showResult.set(false);
  }

  getResultClass(): string {
    switch (this.resultType()) {
      case 'success': return 'alert-success';
      case 'info': return 'alert-info';
      case 'error': return 'alert-danger';
      default: return '';
    }
  }
}
