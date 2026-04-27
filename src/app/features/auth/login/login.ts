import { Component, signal, computed, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { UserRole } from '../../../core/models/enums';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, LoadingSpinner, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnDestroy {
  // Formulario reactivo
  loginForm: FormGroup;

  // Signals para estado
  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);

  // Cooldown (rate limit)
  cooldownSeconds = signal<number | null>(null);
  private cooldownInterval: ReturnType<typeof setInterval> | null = null;

  isLocked = computed(() => this.cooldownSeconds() !== null);

  cooldownDisplay = computed(() => {
    const s = this.cooldownSeconds();
    if (s === null) return null;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  });

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Inicializar formulario con validaciones
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnDestroy() {
    this.clearCooldown();
  }

  /**
   * Alternar visibilidad de contraseña
   */
  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  /**
   * Verificar si un campo es inválido y ha sido tocado
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Obtener mensaje de error de un campo
   */
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return 'Este campo es requerido';
    }
    if (field.errors['email']) {
      return 'Ingresa un email válido';
    }
    if (field.errors['minlength']) {
      return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    }
    return 'Campo inválido';
  }

  /**
   * Manejo del submit del formulario
   */
  onSubmit() {
    // Bloqueado por rate limit
    if (this.isLocked()) {
      return;
    }

    // Marcar todos los campos como tocados para mostrar errores
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Limpiar error anterior
    this.error.set(null);
    this.loading.set(true);

    // Hacer login
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.loading.set(false);

        // Obtener URL de retorno o redirigir según rol
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];

        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        } else {
          // Redirigir según rol
          if (response.user.role === UserRole.Administrator) {
            this.router.navigate(['/admin/contenedores']);
          } else {
            this.router.navigate(['/client/dashboard']);
          }
        }
      },
      error: (err) => {
        this.loading.set(false);

        if (err.status === 429) {
          const seconds = Number(err.error?.retry_after_seconds) || 60;
          this.error.set(null);
          this.startCooldown(seconds);
          return;
        }

        // Manejar diferentes tipos de error
        if (err.status === 401) {
          this.error.set('Credenciales incorrectas. Verifica tu email y contraseña.');
        } else if (err.status === 403) {
          this.error.set('Tu cuenta está inactiva. Contacta al administrador.');
        } else if (err.status === 422) {
          // Error de validación
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
          this.error.set(err.error?.message || 'Error al iniciar sesión. Intenta nuevamente.');
        }

        // Hacer focus en el campo de email para facilitar reintento
        setTimeout(() => {
          const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
          emailInput?.focus();
        }, 100);
      }
    });
  }

  /**
   * Limpiar mensajes de error cuando el usuario empieza a escribir
   */
  onFieldChange() {
    if (this.error()) {
      this.error.set(null);
    }
  }

  private startCooldown(seconds: number) {
    this.clearCooldown();
    this.cooldownSeconds.set(seconds);

    this.cooldownInterval = setInterval(() => {
      const current = this.cooldownSeconds();
      if (current === null || current <= 1) {
        this.clearCooldown();
        return;
      }
      this.cooldownSeconds.set(current - 1);
    }, 1000);
  }

  private clearCooldown() {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
      this.cooldownInterval = null;
    }
    this.cooldownSeconds.set(null);
  }
}
