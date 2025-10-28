import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Modal } from '../../../../shared/components/modal/modal';
import { ContainerService } from '../../../../core/services/container.service';
import { Container, ContainerFormData } from '../../../../core/models/container.model';

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

  @Input() mode: 'create' | 'edit' = 'create';
  @Input() containerId?: number;
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Container>();

  form!: FormGroup;
  loading = signal(false);
  container = signal<Container | null>(null);

  ngOnInit() {
    this.initForm();
    
    if (this.mode === 'edit' && this.containerId) {
      this.loadContainer();
    }
  }

  initForm() {
    this.form = this.fb.group({
      shipment_reference: ['', [Validators.required]],
      container_number: ['', [Validators.required]],
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
          shipment_reference: container.shipment_reference,
          container_number: container.container_number,
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
    const formData: Partial<ContainerFormData> = this.form.value;

    if (this.mode === 'create') {
      // El create requiere más datos, por ahora solo estos 2 campos
      this.containerService.createContainer(formData as ContainerFormData).subscribe({
        next: (response) => {
          this.loading.set(false);
          this.save.emit(response.data);
          this.close.emit();
        },
        error: (error) => {
          console.error('Error creando contenedor:', error);
          this.loading.set(false);
        }
      });
    } else if (this.mode === 'edit' && this.containerId) {
      this.containerService.updateContainer(this.containerId, formData as ContainerFormData).subscribe({
        next: (response) => {
          this.loading.set(false);
          this.save.emit(response.data);
          this.close.emit();
        },
        error: (error) => {
          console.error('Error actualizando contenedor:', error);
          this.loading.set(false);
        }
      });
    }
  }
}
