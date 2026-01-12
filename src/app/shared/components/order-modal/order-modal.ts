import { Component, Input, Output, EventEmitter, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Modal } from '../modal/modal';
import { SearchableSelect, SelectOption } from '../searchable-select/searchable-select';
import { OrderService } from '../../../core/services/order.service';
import { ClientService } from '../../../core/services/client.service';
import { ContainerService } from '../../../core/services/container.service';
import { ToastService } from '../../../core/services/toast.service';
import { Auth } from '../../../core/services/auth';
import { Order, OrderFormData } from '../../../core/models/order.model';
import { Client } from '../../../core/models/client.model';
import { Container } from '../../../core/models/container.model';
import { isOrderStatusLocked, getAutoOrderStatus, ContainerStatusLabels } from '../../../core/models/enums';

@Component({
  selector: 'app-order-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Modal, SearchableSelect],
  templateUrl: './order-modal.html',
  styleUrl: './order-modal.scss',
})
export class OrderModal implements OnInit {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private clientService = inject(ClientService);
  private containerService = inject(ContainerService);
  private toast = inject(ToastService);
  public auth = inject(Auth);

  @Input() mode: 'create' | 'edit' | 'view' = 'create';
  @Input() orderId?: number;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Order>();

  form!: FormGroup;
  loading = signal(false);
  order = signal<Order | null>(null);
  clients = signal<Client[]>([]);
  containers = signal<Container[]>([]);

  // Opciones para el searchable select de clientes
  clientOptions = computed<SelectOption[]>(() =>
    this.clients().map((client) => ({
      value: client.id,
      label: client.company_name,
    }))
  );

  // Control de bloqueo de estado según contenedor
  statusLocked = signal(false);
  statusLockedMessage = signal('');

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
      delivery_address: ['', [Validators.required]],
      package_count: ['', [Validators.required, Validators.min(1)]],
      status: ['pending', [Validators.required]],
      container_id: [''],
    });

    if (this.mode === 'view') {
      this.form.disable();
    }

    // Suscribirse a cambios en el contenedor para actualizar el estado automáticamente
    this.form.get('container_id')?.valueChanges.subscribe((containerId) => {
      this.onContainerChange(containerId);
    });
  }

  /**
   * Maneja el cambio de contenedor y actualiza el estado de la orden si corresponde
   */
  onContainerChange(containerId: string | number | null) {
    if (!containerId) {
      // Sin contenedor, el estado es editable
      this.statusLocked.set(false);
      this.statusLockedMessage.set('');
      return;
    }

    const container = this.containers().find(c => c.id === +containerId);
    if (!container) {
      this.statusLocked.set(false);
      this.statusLockedMessage.set('');
      return;
    }

    if (isOrderStatusLocked(container.status)) {
      const autoStatus = getAutoOrderStatus(container.status);
      if (autoStatus) {
        this.form.get('status')?.setValue(autoStatus);
        this.statusLocked.set(true);
        const containerStatusLabel = ContainerStatusLabels[container.status as keyof typeof ContainerStatusLabels] || container.status;
        this.statusLockedMessage.set(`Estado asignado automáticamente porque el contenedor está "${containerStatusLabel}"`);
      }
    } else {
      this.statusLocked.set(false);
      this.statusLockedMessage.set('');
    }
  }

  loadClients() {
    // Cargar TODOS los clientes para el select (sin paginación)
    this.clientService.getAllClients().subscribe({
      next: (response) => {
        this.clients.set(response.data || []);
      },
      error: (error) => console.error('Error cargando clientes:', error)
    });
  }

  loadContainers() {
    // Cargar todos los contenedores para el select (sin paginación)
    this.containerService.getAllContainers().subscribe({
      next: (response) => {
        this.containers.set(response.data || []);
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
          delivery_address: order.delivery_address || '',
          package_count: order.package_count || '',
          status: order.status,
          container_id: order.container_id || '',
        });

        // Verificar si el contenedor bloquea el estado (usando el container de la orden)
        if (order.container && order.container.status) {
          if (isOrderStatusLocked(order.container.status)) {
            this.statusLocked.set(true);
            const containerStatusLabel = ContainerStatusLabels[order.container.status as keyof typeof ContainerStatusLabels] || order.container.status;
            this.statusLockedMessage.set(`Estado asignado automáticamente porque el contenedor está "${containerStatusLabel}"`);
          }
        }

        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error cargando orden:', error);
        this.loading.set(false);
      }
    });
  }

  onFileSelect(event: Event, type: 'performa' | 'picking' | 'invoice') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (type === 'performa') {
        this.performaPdfFile = file;
      } else if (type === 'picking') {
        this.packinListFile = file;
      } else if (type === 'invoice') {
        this.invoiceFile = file;
      }
    }
  }

  removeFile(type: 'performa' | 'picking' | 'invoice') {
    if (type === 'performa') {
      this.performaPdfFile = null;
    } else if (type === 'picking') {
      this.packinListFile = null;
    } else if (type === 'invoice') {
      this.invoiceFile = null;
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

  downloadFile(type: 'picking-list' | 'invoice' | 'performa-pdf') {
    if (!this.orderId) return;
    this.orderService.downloadFile(this.orderId, type);
  }

  // Extrae el nombre del archivo desde el path del servidor
  getFileName(path: string | undefined): string | null {
    if (!path) return null;
    const parts = path.split('/');
    return parts[parts.length - 1] || null;
  }

  // Trunca el nombre del archivo a 20 caracteres
  truncateFileName(name: string | null | undefined): string {
    if (!name) return '';
    if (name.length <= 20) return name;
    return name.substring(0, 17) + '...';
  }

  onClose() {
    this.close.emit();
  }

  onSubmit() {
    if (this.form.invalid || this.mode === 'view') return;

    this.loading.set(true);
    const formData: OrderFormData = {
      ...this.form.value,
      performa_pdf_file: this.performaPdfFile || undefined,
      picking_list_file: this.packinListFile || undefined,
      invoice_file: this.invoiceFile || undefined,
    };

    if (this.mode === 'create') {
      this.orderService.createOrder(formData).subscribe({
        next: (response) => {
          this.loading.set(false);
          this.toast.success('Orden creada correctamente');
          this.save.emit(response.data);
          this.close.emit();
        },
        error: (error) => {
          console.error('Error creando orden:', error);
          this.toast.error(error.error?.message || 'Error al crear la orden');
          this.loading.set(false);
        }
      });
    } else if (this.mode === 'edit' && this.orderId) {
      this.orderService.updateOrder(this.orderId, formData).subscribe({
        next: (response) => {
          this.loading.set(false);
          this.toast.success('Orden actualizada correctamente');
          this.save.emit(response.data);
          this.close.emit();
        },
        error: (error) => {
          console.error('Error actualizando orden:', error);
          this.toast.error(error.error?.message || 'Error al actualizar la orden');
          this.loading.set(false);
        }
      });
    }
  }
}
