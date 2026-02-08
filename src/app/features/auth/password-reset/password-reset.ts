import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-password-reset',
  imports: [ReactiveFormsModule, LoadingSpinner, RouterLink],
  templateUrl: './password-reset.html',
  styleUrl: './password-reset.scss',
})
export class PasswordReset {
  resetForm: FormGroup;

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: Auth
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.resetForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.resetForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return 'Este campo es requerido';
    }
    if (field.errors['email']) {
      return 'Ingresa un email válido';
    }
    return 'Campo inválido';
  }

  onSubmit() {
    if (this.resetForm.invalid) {
      Object.keys(this.resetForm.controls).forEach(key => {
        this.resetForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.error.set(null);
    this.loading.set(true);

    this.authService.requestPasswordReset(this.resetForm.value.email).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: (err) => {
        this.loading.set(false);

        if (err.status === 404) {
          this.error.set('No existe una cuenta con este correo electrónico.');
        } else if (err.status === 403) {
          this.error.set('Tu cuenta está inactiva. Contacta al administrador.');
        } else if (err.status === 422) {
          const validationErrors = err.error.errors;
          if (validationErrors) {
            const firstError = Object.values(validationErrors)[0] as string[];
            this.error.set(firstError[0]);
          } else {
            this.error.set(err.error.message || 'Error de validación');
          }
        } else if (err.status === 0) {
          this.error.set('No se pudo conectar con el servidor. Verifica tu conexión.');
        } else {
          this.error.set(err.error?.message || 'Error al procesar la solicitud. Intenta nuevamente.');
        }
      }
    });
  }

  onFieldChange() {
    if (this.error()) {
      this.error.set(null);
    }
  }
}
