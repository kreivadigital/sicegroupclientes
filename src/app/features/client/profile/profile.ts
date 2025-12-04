import { Component, OnInit, inject, signal } from '@angular/core';
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
  passwordChangeSuccess = signal<boolean>(false);

  // Forms
  personalInfoForm: FormGroup;
  companyInfoForm: FormGroup;
  securityForm: FormGroup;

  constructor() {
    // Inicializar formularios
    this.personalInfoForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]]
    });

    this.companyInfoForm = this.fb.group({
      address: ['', [Validators.required]],
      rut: ['', [Validators.required]]
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
    this.loadClientData();
  }

  loadClientData() {
    const user = this.auth.currentUser();
    if (!user || !user.id) return;

    this.loading.set(true);

    // Buscar el cliente asociado al usuario
    this.clientService.getClients(1).subscribe({
      next: (response) => {
        const paginationData = response.data as any;
        const clients = paginationData.data || [];
        const userClient = clients.find((c: Client) => c.user_id === user.id);

        if (userClient) {
          this.client.set(userClient);
          this.populateForms(userClient, user);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error cargando datos del cliente:', error);
        this.loading.set(false);
      }
    });
  }

  populateForms(client: Client, user: any) {
    this.personalInfoForm.patchValue({
      name: user.name,
      email: user.email,
      phone: client.phone
    });

    this.companyInfoForm.patchValue({
      address: client.address,
      rut: client.rut
    });
  }

  toggleEditMode() {
    const newMode = !this.isEditMode();
    this.isEditMode.set(newMode);

    if (newMode) {
      this.personalInfoForm.enable();
      this.companyInfoForm.enable();
    } else {
      this.personalInfoForm.disable();
      this.companyInfoForm.disable();
      // Restaurar valores originales
      const user = this.auth.currentUser();
      const clientData = this.client();
      if (user && clientData) {
        this.populateForms(clientData, user);
      }
    }
  }

  onUpdateProfile() {
    if (this.personalInfoForm.invalid || this.companyInfoForm.invalid) {
      return;
    }

    const clientData = this.client();
    if (!clientData) return;

    this.loading.set(true);

    const updateData = {
      name: this.personalInfoForm.value.name,
      email: this.personalInfoForm.value.email,
      phone: this.personalInfoForm.value.phone,
      address: this.companyInfoForm.value.address,
      rut: this.companyInfoForm.value.rut,
      company_name: clientData.company_name,
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
      }
    });
  }

  onChangePassword() {
    if (this.securityForm.invalid) {
      return;
    }

    this.loading.set(true);

    this.auth.changePassword(this.securityForm.value).subscribe({
      next: (response) => {
        this.passwordChangeSuccess.set(true);
        this.securityForm.reset();
        this.loading.set(false);

        setTimeout(() => this.passwordChangeSuccess.set(false), 3000);
      },
      error: (error) => {
        console.error('Error cambiando contraseña:', error);
        this.loading.set(false);
        // Aquí podrías mostrar un mensaje de error al usuario
      }
    });
  }

  getInitials(): string {
    const clientData = this.client();
    if (!clientData || !clientData.company_name) return '?';

    const words = clientData.company_name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return clientData.company_name.substring(0, 2).toUpperCase();
  }

  getUserRole(): string {
    // Por ahora retornamos un rol fijo, podría venir del backend
    return 'Gerente de Compras';
  }

  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmation = group.get('password_confirmation')?.value;
    return password === confirmation ? null : { passwordMismatch: true };
  }
}
