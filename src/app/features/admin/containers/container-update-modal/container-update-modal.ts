import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Modal } from '../../../../shared/components/modal/modal';
import { ContainerService } from '../../../../core/services/container.service';
import { Container } from '../../../../core/models/container.model';

@Component({
  selector: 'app-container-update-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Modal],
  templateUrl: './container-update-modal.html',
  styleUrl: './container-update-modal.scss',
})
export class ContainerUpdateModal implements OnInit {
  private fb = inject(FormBuilder);
  private containerService = inject(ContainerService);

  @Input() containerId!: number;
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Container>();

  form!: FormGroup;
  loading = signal(false);
  containers = signal<Container[]>([]);

  ngOnInit() {
    this.initForm();
    this.loadContainers();
  }

  initForm() {
    this.form = this.fb.group({
      container_id: [this.containerId, [Validators.required]],
      comment: ['', [Validators.required]],
    });
  }

  loadContainers() {
    // Cargar lista de contenedores para el select
    this.containerService.getContainers(1, undefined).subscribe({
      next: (response) => {
        const paginationData = response.data as any;
        this.containers.set(paginationData.data || []);
      },
      error: (error) => console.error('Error cargando contenedores:', error)
    });
  }

  onClose() {
    this.close.emit();
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading.set(true);
    const { container_id, comment } = this.form.value;

    // Aquí deberías llamar a un endpoint específico para actualizar el estado
    // Por ahora simulamos la llamada
    console.log('Actualizar estado:', { container_id, comment });
    
    // Simulación - reemplazar con llamada real al backend
    setTimeout(() => {
      this.loading.set(false);
      this.save.emit({} as Container);
      this.close.emit();
    }, 1000);
  }
}
