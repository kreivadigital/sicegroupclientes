import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Modal } from '../../../../shared/components/modal/modal';
import { OrderService } from '../../../../core/services/order.service';
import { ClientService } from '../../../../core/services/client.service';
import { ContainerService } from '../../../../core/services/container.service';
import { Order, OrderFormData } from '../../../../core/models/order.model';
import { Client } from '../../../../core/models/client.model';
import { Container } from '../../../../core/models/container.model';

@Component({
  selector: 'app-order-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Modal],
  templateUrl: './order-modal.html',
  styleUrl: './order-modal.scss',
})
export class OrderModal implements OnInit {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private clientService = inject(ClientService);
  private containerService = inject(ContainerService);

  @Input() mode: 'create' | 'edit' | 'view' = 'create';
  @Input() orderId?: number;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Order>();

  form!: FormGroup;
  loading = signal(false);
  order = signal<Order | null>(null);
  clients = signal<Client[]>([]);
  containers = signal<Container[]>([]);

  // Archivos
  performaPdfFile: File | null = null;
  packinListFile: File | null = null;
  invoiceFile: File | null = null;

  ngOnInit() {
    this.initForm();
    this.loadClients();
    this.loadContainers();

    if (this.mode !== 'create' && this.orderId) {
      this.loadOrder();
    }
  }

  initForm() {
    this.form = this.fb.group({
      client_id: ['', [Validators.required]],
      description: [''],
      delivery_address: [''],
      bulk_quantity: [''],
      status: ['pending', [Validators.required]],
      container_id: [''],
    });

    if (this.mode === 'view') {
      this.form.disable();
    }
  }

  loadClients() {
    // Cargar todos los clientes para el select
    this.clientService.getClients(1, undefined).subscribe({
      next: (response) => {
        const paginationData = response.data as any;
        this.clients.set(paginationData.data || []);
      },
      error: (error) => console.error('Error cargando clientes:', error)
    });
  }

  loadContainers() {
    // Cargar todos los contenedores para el select
    this.containerService.getContainers(1, undefined).subscribe({
      next: (response) => {
        const paginationData = response.data as any;
        this.containers.set(paginationData.data || []);
      },
      error: (error) => console.error('Error cargando contenedores:', error)
    });
  }

  loadOrder() {
    if (!this.orderId) return;

    this.loading.set(true);
    this.orderService.getOrder(this.orderId).subscribe({
      next: (response) => {
        const order = response.data;
        this.order.set(order);

        this.form.patchValue({
          client_id: order.client_id,
          description: order.description || '',
          status: order.status,
          container_id: order.container_id || '',
        });

        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error cargando orden:', error);
        this.loading.set(false);
      }
    });
  }

  onFileSelect(event: Event, type: 'performa' | 'packin' | 'invoice') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (type === 'performa') {
        this.performaPdfFile = file;
      } else if (type === 'packin') {
        this.packinListFile = file;
      } else if (type === 'invoice') {
        this.invoiceFile = file;
      }
    }
  }

  getTitle(): string {
    const titles = {
      'create': 'Agregar nueva orden',
      'edit': 'Editar orden',
      'view': 'Orden'
    };
    return titles[this.mode];
  }

  onClose() {
    this.close.emit();
  }

  onSubmit() {
    if (this.form.invalid || this.mode === 'view') return;

    this.loading.set(true);
    const formData: OrderFormData = {
      ...this.form.value,
      performa_pdf: this.performaPdfFile || undefined,
    };

    if (this.mode === 'create') {
      this.orderService.createOrder(formData).subscribe({
        next: (response) => {
          this.loading.set(false);
          this.save.emit(response.data);
          this.close.emit();
        },
        error: (error) => {
          console.error('Error creando orden:', error);
          this.loading.set(false);
        }
      });
    } else if (this.mode === 'edit' && this.orderId) {
      this.orderService.updateOrder(this.orderId, formData).subscribe({
        next: (response) => {
          this.loading.set(false);
          this.save.emit(response.data);
          this.close.emit();
        },
        error: (error) => {
          console.error('Error actualizando orden:', error);
          this.loading.set(false);
        }
      });
    }
  }
}
