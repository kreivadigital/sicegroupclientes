import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Modal } from '../../../../shared/components/modal/modal';
import { ClientService } from '../../../../core/services/client.service';
import { Client, ClientFormData } from '../../../../core/models/client.model';

@Component({
  selector: 'app-client-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Modal],
  templateUrl: './client-modal.html',
  styleUrl: './client-modal.scss',
})
export class ClientModal implements OnInit {
  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);

  @Input() mode: 'create' | 'edit' | 'view' = 'create';
  @Input() clientId?: number;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Client>();

  form!: FormGroup;
  loading = signal(false);
  client = signal<Client | null>(null);
  formChanged = signal(false);
  private originalFormValue: any = null;

  ngOnInit() {
    this.initForm();

    if (this.mode !== 'create' && this.clientId) {
      this.loadClient();
    }
  }

  initForm() {
    this.form = this.fb.group({
      // User data
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],

      // Client data
      company_name: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      rut: ['', [Validators.required]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      country: ['', [Validators.required]],
    });

    // Campos adicionales en modo create o edit
    if (this.mode === 'create') {
      this.form.addControl('password', this.fb.control('', [Validators.required, Validators.minLength(6)]));
      this.form.addControl('password_confirmation', this.fb.control('', [Validators.required]));
    }

    if (this.mode === 'edit') {
      this.form.addControl('status', this.fb.control('active'));
      // Contraseña opcional en edición
      this.form.addControl('current_password', this.fb.control(''));
      this.form.addControl('new_password', this.fb.control(''));
    }

    // Deshabilitar formulario en modo view
    if (this.mode === 'view') {
      this.form.disable();
    }
  }

  loadClient() {
    if (!this.clientId) return;

    this.loading.set(true);
    this.clientService.getClient(this.clientId).subscribe({
      next: (response) => {
        const client = response.data;
        this.client.set(client);

        // Poblar formulario con todos los datos, incluyendo status
        this.form.patchValue({
          name: client.user?.name || '',
          email: client.user?.email || '',
          company_name: client.company_name,
          phone: client.phone,
          rut: client.rut || '',
          address: client.address || '',
          city: client.city || '',
          country: client.country || '',
          ...(this.mode === 'edit' && { status: client.user?.status || 'active' })
        });

        // Guardar valores originales después de cargar el cliente
        if (this.mode === 'edit') {
          // Usar setTimeout para asegurar que el valor se guarde después de todos los patchValue
          setTimeout(() => {
            // Hacer copia profunda del valor original para evitar problemas de referencia
            this.originalFormValue = JSON.parse(JSON.stringify(this.form.getRawValue()));
            console.log('Original form value:', this.originalFormValue);

            // Activar detección de cambios DESPUÉS de guardar el valor original
            this.form.valueChanges.subscribe(() => {
              this.checkFormChanges();
            });
          }, 0);
        }

        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error cargando cliente:', error);
        this.loading.set(false);
      }
    });
  }

  checkFormChanges() {
    if (!this.originalFormValue) {
      this.formChanged.set(false);
      return;
    }

    const currentValue = this.form.getRawValue();
    const hasChanges = JSON.stringify(currentValue) !== JSON.stringify(this.originalFormValue);
    console.log('Checking changes:', {
      current: currentValue,
      original: this.originalFormValue,
      hasChanges
    });
    this.formChanged.set(hasChanges);
  }

  getTitle(): string {
    const titles = {
      'create': 'Agregar nuevo cliente',
      'edit': 'Editar cliente',
      'view': 'Detalles del cliente'
    };
    return titles[this.mode];
  }

  capitalizeName() {
    const nameControl = this.form.get('name');
    if (nameControl && nameControl.value) {
      const capitalizedName = nameControl.value
        .toLowerCase()
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      nameControl.setValue(capitalizedName, { emitEvent: false });

      // Detectar cambios manualmente después de capitalizar
      if (this.mode === 'edit') {
        this.checkFormChanges();
      }
    }
  }

  capitalizeCompanyName() {
    const companyControl = this.form.get('company_name');
    if (companyControl && companyControl.value) {
      const capitalizedCompany = companyControl.value
        .toLowerCase()
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      companyControl.setValue(capitalizedCompany, { emitEvent: false });

      // Detectar cambios manualmente después de capitalizar
      if (this.mode === 'edit') {
        this.checkFormChanges();
      }
    }
  }

  lowercaseEmail() {
    const emailControl = this.form.get('email');
    if (emailControl && emailControl.value) {
      emailControl.setValue(emailControl.value.toLowerCase(), { emitEvent: false });

      // Detectar cambios manualmente después de convertir a minúsculas
      if (this.mode === 'edit') {
        this.checkFormChanges();
      }
    }
  }

  onClose() {
    this.close.emit();
  }

  onSubmit() {
    if (this.form.invalid || this.mode === 'view') return;

    this.loading.set(true);
    const formData: ClientFormData = this.form.value;

    if (this.mode === 'create') {
      this.clientService.createClient(formData).subscribe({
        next: (response) => {
          this.loading.set(false);
          this.save.emit(response.data);
          this.close.emit();
        },
        error: (error) => {
          console.error('Error creando cliente:', error);
          this.loading.set(false);
        }
      });
    } else if (this.mode === 'edit' && this.clientId) {
      this.clientService.updateClient(this.clientId, formData).subscribe({
        next: (response) => {
          this.loading.set(false);
          this.save.emit(response.data);
          this.close.emit();
        },
        error: (error) => {
          console.error('Error actualizando cliente:', error);
          this.loading.set(false);
        }
      });
    }
  }
}
