import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Modal } from '../../../../shared/components/modal/modal';
import { UserService, User, UserRole } from '../../../../core/services/user.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Modal],
  templateUrl: './user-modal.html',
  styleUrl: './user-modal.scss',
})
export class UserModal implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private toast = inject(ToastService);

  @Input() mode: 'create' | 'edit' = 'create';
  @Input() userId?: number;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<User>();

  form!: FormGroup;
  loading = signal(false);
  loadingRoles = signal(false);
  user = signal<User | null>(null);
  roles = signal<UserRole[]>([]);

  ngOnInit() {
    this.loadRoles();
    this.initForm();

    if (this.mode === 'edit' && this.userId) {
      this.loadUser();
    }
  }

  initForm() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', [Validators.required]],
      password: ['', this.mode === 'create' ? [Validators.required, Validators.minLength(8)] : [Validators.minLength(8)]],
      password_confirmation: [''],
    });
  }

  loadRoles() {
    this.loadingRoles.set(true);
    this.userService.getRoles().subscribe({
      next: (response) => {
        this.roles.set(response.data);
        this.loadingRoles.set(false);
      },
      error: (error) => {
        console.error('Error cargando roles:', error);
        this.loadingRoles.set(false);
      }
    });
  }

  loadUser() {
    if (!this.userId) return;

    this.loading.set(true);
    this.userService.getUser(this.userId).subscribe({
      next: (response) => {
        const user = response.data;
        this.user.set(user);

        this.form.patchValue({
          name: user.name,
          email: user.email,
          role: user.role,
        });

        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error cargando usuario:', error);
        this.loading.set(false);
      }
    });
  }

  getTitle(): string {
    return this.mode === 'create' ? 'Agregar nuevo usuario' : 'Editar usuario';
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
    }
  }

  lowercaseEmail() {
    const emailControl = this.form.get('email');
    if (emailControl && emailControl.value) {
      emailControl.setValue(emailControl.value.toLowerCase(), { emitEvent: false });
    }
  }

  onClose() {
    this.close.emit();
  }

  onSubmit() {
    if (this.form.invalid) return;

    // Validar que las contraseñas coincidan si se proporciona una
    const password = this.form.get('password')?.value;
    const passwordConfirmation = this.form.get('password_confirmation')?.value;

    if (password && password !== passwordConfirmation) {
      this.toast.error('Las contraseñas no coinciden');
      return;
    }

    this.loading.set(true);

    if (this.mode === 'create') {
      const createData = {
        name: this.form.value.name,
        email: this.form.value.email,
        role: this.form.value.role,
        password: this.form.value.password,
        password_confirmation: this.form.value.password_confirmation,
      };

      this.userService.createUser(createData).subscribe({
        next: (response) => {
          this.loading.set(false);
          this.toast.success('Usuario creado correctamente');
          this.save.emit(response.data);
          this.close.emit();
        },
        error: (error) => {
          console.error('Error creando usuario:', error);
          this.toast.error(error.error?.message || 'Error al crear el usuario');
          this.loading.set(false);
        }
      });
    } else if (this.mode === 'edit' && this.userId) {
      const updateData: any = {
        name: this.form.value.name,
        email: this.form.value.email,
        role: this.form.value.role,
      };

      // Solo incluir contraseña si se proporciona
      if (password) {
        updateData.password = password;
        updateData.password_confirmation = passwordConfirmation;
      }

      this.userService.updateUser(this.userId, updateData).subscribe({
        next: (response) => {
          this.loading.set(false);
          this.toast.success('Usuario actualizado correctamente');
          this.save.emit(response.data);
          this.close.emit();
        },
        error: (error) => {
          console.error('Error actualizando usuario:', error);
          this.toast.error(error.error?.message || 'Error al actualizar el usuario');
          this.loading.set(false);
        }
      });
    }
  }
}
