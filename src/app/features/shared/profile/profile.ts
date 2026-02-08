import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth } from '../../../core/services/auth';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../core/models/client.model';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private auth = inject(Auth);
  private clientService = inject(ClientService);
  private fb = inject(FormBuilder);

  // Signals
  client = signal<Client | null>(null);
  loading = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  updateSuccess = signal<boolean>(false);
  updateError = signal<string>('');
  passwordChangeSuccess = signal<boolean>(false);
  passwordError = signal<string>('');

  // Computed para verificar rol
  isAdmin = computed(() => this.auth.isAdmin());

  // Forms
  personalInfoForm: FormGroup;
  companyInfoForm: FormGroup;
  securityForm: FormGroup;

  constructor() {
    // Inicializar formularios
    this.personalInfoForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''] // Será requerido solo para clientes
    });

    this.companyInfoForm = this.fb.group({
      company_name: ['', [Validators.required]],
      address: ['', [Validators.required]],
      rut: ['']
    });

    this.securityForm = this.fb.group({
      current_password: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    // Deshabilitar formularios en modo vista
    this.personalInfoForm.disable();
    this.companyInfoForm.disable();
  }

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    const user = this.auth.currentUser();
    if (!user || !user.id) return;

    // Si es admin, solo cargar datos del usuario
    if (this.isAdmin()) {
      this.populateAdminForms(user);
      return;
    }

    // Para clientes, agregar validador required al phone
    this.personalInfoForm.get('phone')?.setValidators([Validators.required]);
    this.personalInfoForm.get('phone')?.updateValueAndValidity();

    this.loading.set(true);

    // Buscar el cliente asociado al usuario
    this.clientService.getAllClients().subscribe({
      next: (response) => {
        const clients = response.data || [];
        const userClient = clients.find((c: Client) => c.user_id === user.id);

        if (userClient) {
          this.client.set(userClient);
          this.populateClientForms(userClient, user);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error cargando datos del cliente:', error);
        this.loading.set(false);
      }
    });
  }

  populateAdminForms(user: any) {
    this.personalInfoForm.patchValue({
      name: user.name,
      email: user.email
    });
  }

  populateClientForms(client: Client, user: any) {
    this.personalInfoForm.patchValue({
      name: user.name,
      email: user.email,
      phone: client.phone
    });

    this.companyInfoForm.patchValue({
      company_name: client.company_name,
      address: client.address,
      rut: client.rut
    });
  }

  toggleEditMode() {
    const newMode = !this.isEditMode();
    this.isEditMode.set(newMode);

    if (newMode) {
      if (this.isAdmin()) {
        // Admin solo puede editar name y email
        this.personalInfoForm.get('name')?.enable();
        this.personalInfoForm.get('email')?.enable();
      } else {
        // Cliente puede editar todo
        this.personalInfoForm.enable();
        this.companyInfoForm.enable();
      }
    } else {
      this.personalInfoForm.disable();
      this.companyInfoForm.disable();
      // Restaurar valores originales
      const user = this.auth.currentUser();
      if (this.isAdmin()) {
        if (user) {
          this.populateAdminForms(user);
        }
      } else {
        const clientData = this.client();
        if (user && clientData) {
          this.populateClientForms(clientData, user);
        }
      }
    }
  }

  onUpdateProfile() {
    // Si es admin, usar endpoint de usuario
    if (this.isAdmin()) {
      this.updateAdminProfile();
      return;
    }

    // Si es cliente, usar endpoint de cliente
    this.updateClientProfile();
  }

  private updateAdminProfile() {
    if (this.personalInfoForm.get('name')?.invalid || this.personalInfoForm.get('email')?.invalid) {
      this.personalInfoForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.updateError.set('');

    const updateData = {
      name: this.personalInfoForm.value.name,
      email: this.personalInfoForm.value.email
    };

    this.auth.updateProfile(updateData).subscribe({
      next: () => {
        this.updateSuccess.set(true);
        this.isEditMode.set(false);
        this.personalInfoForm.disable();
        this.loading.set(false);

        setTimeout(() => this.updateSuccess.set(false), 3000);
      },
      error: (error) => {
        console.error('Error actualizando perfil:', error);
        this.loading.set(false);
        this.handleUpdateError(error);
      }
    });
  }

  private updateClientProfile() {
    if (this.personalInfoForm.invalid || this.companyInfoForm.invalid) {
      this.personalInfoForm.markAllAsTouched();
      this.companyInfoForm.markAllAsTouched();
      return;
    }

    const clientData = this.client();
    if (!clientData) return;

    this.loading.set(true);
    this.updateError.set('');

    const updateData = {
      name: this.personalInfoForm.value.name,
      email: this.personalInfoForm.value.email,
      phone: this.personalInfoForm.value.phone,
      company_name: this.companyInfoForm.value.company_name,
      address: this.companyInfoForm.value.address,
      rut: this.companyInfoForm.value.rut,
      city: clientData.city,
      country: clientData.country
    };

    this.clientService.updateClient(clientData.id, updateData).subscribe({
      next: (response) => {
        this.client.set(response.data);
        this.updateSuccess.set(true);
        this.isEditMode.set(false);
        this.personalInfoForm.disable();
        this.companyInfoForm.disable();
        this.loading.set(false);

        // Actualizar el usuario en Auth
        this.auth.refreshUser().subscribe();

        setTimeout(() => this.updateSuccess.set(false), 3000);
      },
      error: (error) => {
        console.error('Error actualizando perfil:', error);
        this.loading.set(false);
        this.handleUpdateError(error);
      }
    });
  }

  private handleUpdateError(error: any) {
    if (error.status === 422) {
      const errors = error.error?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0];
        this.updateError.set(Array.isArray(firstError) ? firstError[0] : String(firstError));
      } else {
        this.updateError.set('Error de validación');
      }
    } else {
      this.updateError.set('Error al actualizar el perfil. Intenta nuevamente.');
    }

    setTimeout(() => this.updateError.set(''), 5000);
  }

  onChangePassword() {
    if (this.securityForm.invalid) {
      this.securityForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.passwordError.set('');

    this.auth.changePassword(this.securityForm.value).subscribe({
      next: () => {
        this.passwordChangeSuccess.set(true);
        this.securityForm.reset();
        this.loading.set(false);

        setTimeout(() => this.passwordChangeSuccess.set(false), 3000);
      },
      error: (error) => {
        console.error('Error cambiando contraseña:', error);
        this.loading.set(false);

        if (error.status === 400) {
          this.passwordError.set(error.error?.message || 'La contraseña actual es incorrecta');
        } else if (error.status === 422) {
          const errors = error.error?.errors;
          if (errors) {
            const firstError = Object.values(errors)[0];
            this.passwordError.set(Array.isArray(firstError) ? firstError[0] : String(firstError));
          } else {
            this.passwordError.set('Error de validación');
          }
        } else {
          this.passwordError.set('Error al cambiar la contraseña. Intenta nuevamente.');
        }

        setTimeout(() => this.passwordError.set(''), 5000);
      }
    });
  }

  getInitials(): string {
    if (this.isAdmin()) {
      const user = this.auth.currentUser();
      if (!user || !user.name) return 'A';

      const words = user.name.split(' ');
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }

    const clientData = this.client();
    if (!clientData || !clientData.company_name) return '?';

    const words = clientData.company_name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return clientData.company_name.substring(0, 2).toUpperCase();
  }

  getDisplayName(): string {
    return this.auth.currentUser()?.name || '';
  }

  getUserRole(): string {
    if (this.isAdmin()) {
      return 'Administrador';
    }
    return 'Gerente de Compras';
  }

  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmation = group.get('password_confirmation')?.value;
    return password === confirmation ? null : { passwordMismatch: true };
  }
}
