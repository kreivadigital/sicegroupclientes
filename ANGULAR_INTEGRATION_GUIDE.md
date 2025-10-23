# 🚀 Guía de Integración Angular 20 + Laravel API

> **Compatibilidad:** Esta guía funciona con Angular 18, 19, 20 y versiones futuras.

## 📋 Tabla de Contenidos
1. [Novedades Angular 17+](#novedades-angular-17)
2. [Arquitectura Recomendada](#arquitectura-recomendada)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Instalación Paso a Paso](#instalación-paso-a-paso)
5. [Configuración Inicial](#configuración-inicial)
6. [Servicios y Autenticación](#servicios-y-autenticación)
7. [Guards y Protección de Rutas](#guards-y-protección-de-rutas)
8. [Estructura de Componentes](#estructura-de-componentes)
9. [Buenas Prácticas](#buenas-prácticas)
10. [Deploy](#deploy)

---

## ✨ Novedades Angular 17+

Si vienes de Angular 16 o menos, estas son las mejoras que usaremos:

### 1. **Nueva sintaxis de Control Flow** (más limpia)

**Antes (todavía funciona):**
```html
<div *ngIf="user">{{ user.name }}</div>
<div *ngFor="let item of items">{{ item }}</div>
```

**Ahora (Angular 17+):**
```html
@if (user) {
  <div>{{ user.name }}</div>
}

@for (item of items; track item.id) {
  <div>{{ item }}</div>
}
```

**Ventajas:**
- Mejor type checking
- Más legible
- Performance mejorado

---

### 2. **Standalone Components** (por defecto)

Ya **NO necesitas** `NgModule`. Los componentes son standalone:

```typescript
@Component({
  selector: 'app-login',
  standalone: true,  // ← Por defecto en Angular 17+
  imports: [CommonModule, ReactiveFormsModule],  // ← Imports directos
  templateUrl: './login.component.html'
})
export class LoginComponent { }
```

**Ventajas:**
- Menos código boilerplate
- Imports más claros
- Mejor tree-shaking (bundle más pequeño)

---

### 3. **Functional Interceptors y Guards**

**Antes (class-based):**
```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor { ... }
```

**Ahora (functional):**
```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Tu lógica
  return next(req);
};
```

**Más simple y funcional** ✅

---

### 4. **Signals** (RECOMENDADO para Angular 20)

Angular 16+ introduce **Signals** como la nueva forma de manejar estado reactivo.

**¿Por qué Signals?**
- ✅ Es la dirección oficial de Angular (el futuro del framework)
- ✅ Mejor performance (change detection granular)
- ✅ Más simple que RxJS para casos comunes
- ✅ No necesitas unsubscribe (no más memory leaks)
- ✅ Type safety mejorado

```typescript
// RxJS (todavía funciona, pero más complejo)
private userSubject = new BehaviorSubject<User | null>(null);
public user$ = this.userSubject.asObservable();

ngOnInit() {
  this.authService.user$.subscribe(user => {
    this.user = user; // Subscription manual
  });
}

ngOnDestroy() {
  this.subscription.unsubscribe(); // ⚠️ Puedes olvidarlo
}

// Signals (RECOMENDADO - más simple)
public currentUser = signal<User | null>(null);

// En el template se actualiza automáticamente
{{ currentUser()?.name }}
```

**Enfoque Híbrido (LO MEJOR):**
- **Signals** para estado (AuthService, componentes)
- **RxJS** para HTTP y operaciones async complejas
- **toSignal()** para convertir Observable → Signal cuando sea necesario

**Esta guía usa Signals como estándar**, combinando con RxJS solo donde es necesario (HTTP requests).

---

## 🏗️ Arquitectura Recomendada

### ¿Por qué separar Frontend y Backend?

**✅ RECOMENDADO: Proyectos Separados**

```
C:\projects\kd\
├── siceapi/              ← Backend Laravel (API)
│   ├── app/
│   ├── routes/
│   ├── database/
│   └── ...
└── sice-frontend/        ← Frontend Angular (NUEVO)
    ├── src/
    ├── angular.json
    └── ...
```

**Ventajas de esta arquitectura:**

1. **Separación de responsabilidades**
   - Backend: API REST pura (solo JSON)
   - Frontend: UI/UX completamente independiente

2. **Desarrollo independiente**
   - Equipos diferentes pueden trabajar en paralelo
   - Versionado independiente
   - Deploy independiente

3. **Escalabilidad**
   - Frontend puede usar CDN (Angular compilado)
   - Backend puede estar en servidor diferente
   - Fácil agregar otro frontend (mobile app, etc.)

4. **Testing más fácil**
   - Backend: tests de API
   - Frontend: tests de componentes
   - No hay mezcla de tecnologías

5. **Deploy flexible**
   - Backend: Hostinger (ya tienes)
   - Frontend: Vercel, Netlify, Firebase Hosting (GRATIS)

---

## 📁 Estructura del Proyecto Angular

### Estructura completa recomendada:

```
sice-frontend/
├── src/
│   ├── app/
│   │   ├── core/                    ← Servicios singleton, guards, interceptors
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts         # Protege rutas autenticadas
│   │   │   │   └── role.guard.ts         # Protege rutas por rol
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts   # Agrega JWT a requests
│   │   │   │   └── error.interceptor.ts  # Maneja errores globalmente
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts       # Login, logout, token
│   │   │   │   └── api.service.ts        # Base service para HTTP
│   │   │   └── models/
│   │   │       ├── user.model.ts
│   │   │       ├── client.model.ts
│   │   │       ├── order.model.ts
│   │   │       └── container.model.ts
│   │   │
│   │   ├── shared/                  ← Componentes reutilizables
│   │   │   ├── components/
│   │   │   │   ├── navbar/
│   │   │   │   ├── sidebar/
│   │   │   │   ├── table/
│   │   │   │   └── modal/
│   │   │   ├── pipes/
│   │   │   └── directives/
│   │   │
│   │   ├── features/                ← Módulos por funcionalidad
│   │   │   │
│   │   │   ├── auth/                # Módulo de autenticación
│   │   │   │   ├── login/
│   │   │   │   │   ├── login.component.ts
│   │   │   │   │   ├── login.component.html
│   │   │   │   │   └── login.component.scss
│   │   │   │   ├── password-reset/
│   │   │   │   ├── change-password/
│   │   │   │   └── auth-routing.module.ts
│   │   │   │
│   │   │   ├── admin/               # Módulo de admin (lazy loaded)
│   │   │   │   ├── dashboard/
│   │   │   │   ├── clients/
│   │   │   │   │   ├── client-list/
│   │   │   │   │   ├── client-form/
│   │   │   │   │   └── client-detail/
│   │   │   │   ├── orders/
│   │   │   │   │   ├── order-list/
│   │   │   │   │   ├── order-form/
│   │   │   │   │   └── order-detail/
│   │   │   │   ├── containers/
│   │   │   │   │   ├── container-list/
│   │   │   │   │   ├── container-form/
│   │   │   │   │   └── container-detail/
│   │   │   │   ├── admin-layout/
│   │   │   │   │   └── admin-layout.component.ts
│   │   │   │   └── admin-routing.module.ts
│   │   │   │
│   │   │   └── client/              # Módulo de cliente (lazy loaded)
│   │   │       ├── dashboard/
│   │   │       ├── orders/
│   │   │       │   ├── my-orders/
│   │   │       │   └── order-detail/
│   │   │       ├── profile/
│   │   │       ├── client-layout/
│   │   │       └── client-routing.module.ts
│   │   │
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app-routing.module.ts
│   │   └── app.module.ts
│   │
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   │       └── variables.scss
│   │
│   ├── environments/
│   │   ├── environment.ts           # Dev: localhost
│   │   └── environment.prod.ts      # Prod: api.sicegroup.com.uy
│   │
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
│
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

**Por qué esta estructura:**

- **`core/`**: Servicios singleton que se cargan UNA sola vez
- **`shared/`**: Componentes reutilizables en toda la app
- **`features/`**: Módulos lazy-loaded por funcionalidad (mejor performance)
- **Separación por roles**: Admin y Client tienen sus propios módulos

---

## 🔧 Instalación Paso a Paso

### Paso 1: Instalar Node.js (si no lo tienes)

```bash
# Verificar instalación
node -v    # Debe ser v18+
npm -v     # Debe ser v9+
```

Si no lo tienes, descarga desde: https://nodejs.org/ (versión LTS)

---

### Paso 2: Instalar Angular CLI

```bash
npm install -g @angular/cli@latest
```

Verificar:
```bash
ng version
# Debe mostrar Angular CLI: 20.x.x (o tu versión instalada)
```

**Nota:** Esta guía es compatible con Angular 18+ (incluyendo Angular 20)

---

### Paso 3: Crear el proyecto Angular

```bash
# Navegar a la carpeta padre
cd C:\projects\kd\

# Crear proyecto Angular
ng new sice-frontend

# Responder las preguntas:
? Would you like to add Angular routing? → YES
? Which stylesheet format would you like to use? → SCSS
```

**Por qué SCSS:**
- Variables reutilizables
- Anidamiento de estilos
- Mixins y funciones
- Mejor organización

---

### Paso 4: Instalar dependencias adicionales

```bash
cd sice-frontend

# Bootstrap para UI (opcional pero recomendado)
npm install bootstrap @popperjs/core

# Iconos
npm install bootstrap-icons

# JWT Decode (para leer el token)
npm install jwt-decode

# HTTP Client ya viene incluido en Angular
```

---

## ⚙️ Configuración Inicial

### 1. Configurar environments

**`src/environments/environment.ts`** (Desarrollo)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',  // Tu Laravel local
  appName: 'SICE Group'
};
```

**`src/environments/environment.prod.ts`** (Producción)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.sicegroup.com.uy/api',  // Tu API en Hostinger
  appName: 'SICE Group'
};
```

**Por qué usar environments:**
- No mezclas URLs de desarrollo con producción
- Angular automáticamente usa el correcto según el build
- Fácil de mantener

---

### 2. Configurar Bootstrap (opcional)

**`angular.json`** - Agregar en `projects.sice-frontend.architect.build.options`:
```json
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "node_modules/bootstrap-icons/font/bootstrap-icons.css",
  "src/styles.scss"
],
"scripts": [
  "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"
]
```

---

### 3. Configurar CORS en Laravel

**IMPORTANTE:** Laravel debe permitir requests desde Angular.

**`config/cors.php`**:
```php
<?php

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:4200',              // Angular dev
        'https://tusitio.com',                // Tu frontend en producción
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
```

---

## 🔐 Servicios y Autenticación

### 1. Crear modelos (TypeScript interfaces)

**`src/app/core/models/user.model.ts`**:
```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'client';
  status: 'active' | 'inactive';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}
```

**Por qué usar interfaces:**
- Type safety (TypeScript te avisa de errores)
- Autocompletado en VS Code
- Documentación implícita del código

---

### 2. Servicio de Autenticación

**`src/app/core/services/auth.service.ts`** (CON SIGNALS):
```typescript
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'sice_token';
  private readonly USER_KEY = 'sice_user';

  // ✨ SIGNALS - Estado reactivo automático
  public currentUser = signal<User | null>(this.getUserFromStorage());

  // Computed signals (se actualizan automáticamente)
  public isAuthenticated = computed(() => {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  });

  public isAdmin = computed(() => this.currentUser()?.role === 'admin');
  public isClient = computed(() => this.currentUser()?.role === 'client');

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Login del usuario
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/auth/login`,
      credentials
    ).pipe(
      tap(response => {
        // Guardar token y usuario
        this.setToken(response.access_token);
        this.setUser(response.user);
        this.currentUser.set(response.user); // ✨ Actualiza el signal
      })
    );
  }

  /**
   * Logout del usuario
   */
  logout(): void {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
      complete: () => {
        this.clearAuth();
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        // Aunque falle el API, limpiamos local
        this.clearAuth();
        this.router.navigate(['/auth/login']);
      }
    });
  }

  // ==========================================
  // Métodos privados
  // ==========================================

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null); // ✨ Limpia el signal
  }
}
```

**Ventajas de Signals sobre BehaviorSubject:**

✅ **Más simple:**
```typescript
// BehaviorSubject (viejo)
this.authService.currentUser$.subscribe(user => {
  this.user = user;
});

// Signal (nuevo)
this.user = this.authService.currentUser(); // ¡Eso es todo!
```

✅ **Computed automáticos:**
```typescript
// Se recalculan automáticamente cuando currentUser cambia
public isAdmin = computed(() => this.currentUser()?.role === 'admin');
```

✅ **No necesitas unsubscribe:**
Los signals se manejan solos, no hay memory leaks.

✅ **Type safety mejorado:**
TypeScript detecta errores mejor con signals.

---

### 3. Interceptor para JWT

**`src/app/core/interceptors/auth.interceptor.ts`**:
```typescript
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Obtener el token
    const token = this.authService.getToken();

    // Si existe, agregar a los headers
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }
}
```

**Por qué usar interceptor:**
- No tienes que agregar manualmente el header en cada request
- Centralizado y automático
- Fácil de mantener

---

### 4. Interceptor de errores

**`src/app/core/interceptors/error.interceptor.ts`**:
```typescript
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token inválido o expirado
          this.authService.logout();
        }

        if (error.status === 403) {
          // Sin permisos
          alert('No tienes permisos para realizar esta acción');
        }

        return throwError(() => error);
      })
    );
  }
}
```

---

### 5. Registrar interceptors en app.config

**`src/app/app.config.ts`** (Angular 18 usa standalone):
```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    )
  ]
};
```

---

## 🛡️ Guards y Protección de Rutas

### 1. Auth Guard (protege rutas autenticadas)

**`src/app/core/guards/auth.guard.ts`**:
```typescript
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // ✨ Los computed signals se leen con ()
  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirigir al login
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};
```

---

### 2. Role Guard (protege rutas por rol)

**`src/app/core/guards/role.guard.ts`**:
```typescript
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // ✨ Signals se leen con ()
  if (authService.isAdmin()) {
    return true;
  }

  router.navigate(['/client/dashboard']);
  return false;
};

export const clientGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isClient()) {
    return true;
  }

  router.navigate(['/admin/dashboard']);
  return false;
};
```

**Nota:** Como `isAdmin` e `isClient` son **computed signals**, se leen con `()` igual que signals normales.

---

### 3. Configurar rutas principales

**`src/app/app.routes.ts`**:
```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard, clientGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Ruta raíz redirige según rol
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },

  // Módulo de autenticación (público)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },

  // Módulo de admin (protegido)
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes)
  },

  // Módulo de cliente (protegido)
  {
    path: 'client',
    canActivate: [authGuard, clientGuard],
    loadChildren: () => import('./features/client/client.routes').then(m => m.clientRoutes)
  },

  // 404
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
```

**Por qué lazy loading (loadChildren):**
- Solo carga el código que necesitas
- Admin no carga el código de cliente y viceversa
- App inicial más rápida

---

## 🎨 Estructura de Componentes

### Componente de Login

**Generar:**
```bash
ng generate component features/auth/login
```

**`src/app/features/auth/login/login.component.ts`**:
```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        // Redirigir según rol
        if (response.user.role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/client/dashboard']);
        }
      },
      error: (error) => {
        this.error = error.error.message || 'Error al iniciar sesión';
        this.loading = false;
      }
    });
  }
}
```

**`src/app/features/auth/login/login.component.html`**:
```html
<div class="login-container">
  <div class="login-card">
    <h2>Iniciar Sesión</h2>

    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <!-- Email -->
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input
          type="email"
          class="form-control"
          id="email"
          formControlName="email"
          [class.is-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
        />
        <!-- Nueva sintaxis @if (Angular 17+) -->
        @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
          <div class="invalid-feedback d-block">
            Email inválido
          </div>
        }
      </div>

      <!-- Password -->
      <div class="mb-3">
        <label for="password" class="form-label">Contraseña</label>
        <input
          type="password"
          class="form-control"
          id="password"
          formControlName="password"
          [class.is-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
        />
        @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
          <div class="invalid-feedback d-block">
            Mínimo 6 caracteres
          </div>
        }
      </div>

      <!-- Error message -->
      @if (error) {
        <div class="alert alert-danger">
          {{ error }}
        </div>
      }

      <!-- Submit button -->
      <button
        type="submit"
        class="btn btn-primary w-100"
        [disabled]="loading || loginForm.invalid"
      >
        @if (loading) {
          <span>Cargando...</span>
        } @else {
          <span>Ingresar</span>
        }
      </button>
    </form>

    <div class="mt-3 text-center">
      <a routerLink="/auth/password-reset">¿Olvidaste tu contraseña?</a>
    </div>
  </div>
</div>
```

**Nota Angular 17+:** Usamos la nueva sintaxis `@if` en lugar de `*ngIf` (más limpia y con mejor type checking)

---

### Servicios para Entities (Clients, Orders, Containers)

**`src/app/core/services/client.service.ts`**:
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Client {
  id: number;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = `${environment.apiUrl}/clients`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<{ data: Client[] }> {
    return this.http.get<{ data: Client[] }>(this.apiUrl);
  }

  getById(id: number): Observable<{ data: Client }> {
    return this.http.get<{ data: Client }>(`${this.apiUrl}/${id}`);
  }

  create(client: Partial<Client>): Observable<{ data: Client }> {
    return this.http.post<{ data: Client }>(this.apiUrl, client);
  }

  update(id: number, client: Partial<Client>): Observable<{ data: Client }> {
    return this.http.put<{ data: Client }>(`${this.apiUrl}/${id}`, client);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

**Replica esto para:**
- `order.service.ts`
- `container.service.ts`
- `notification.service.ts`

---

## 📦 Buenas Prácticas

### 1. Manejo de errores consistente

Crea un servicio de notificaciones:
```bash
ng generate service core/services/notification
```

```typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  success(message: string): void {
    // Usar Toast o Alert
    alert(`✅ ${message}`);
  }

  error(message: string): void {
    alert(`❌ ${message}`);
  }

  warning(message: string): void {
    alert(`⚠️ ${message}`);
  }
}
```

Úsalo en los componentes:
```typescript
this.clientService.create(data).subscribe({
  next: () => {
    this.notificationService.success('Cliente creado exitosamente');
    this.router.navigate(['/admin/clients']);
  },
  error: (err) => {
    this.notificationService.error(err.error.message || 'Error al crear cliente');
  }
});
```

---

### 2. Leer Signals en Templates

Los signals se leen con `()`:

```html
<!-- ✅ BIEN - Signal con () -->
@if (authService.currentUser()) {
  <p>Hola {{ authService.currentUser()!.name }}</p>
}

<!-- ✅ Computed signal -->
@if (authService.isAdmin()) {
  <button>Panel Admin</button>
}

<!-- ❌ MAL - Sin () no funciona -->
@if (authService.currentUser) {
  <!-- Esto NO funciona -->
}
```

**En el componente:**
```typescript
export class NavbarComponent {
  // Puedes exponer el servicio directamente
  constructor(public authService: AuthService) {}

  // O crear signals locales
  public user = this.authService.currentUser;
}
```

---

### 3. Convertir Observable a Signal (toSignal)

Cuando trabajas con HTTP (que retorna Observables):

```typescript
import { toSignal } from '@angular/core/rxjs-interop';

export class ClientListComponent {
  private clientService = inject(ClientService);

  // Convierte Observable → Signal
  public clients = toSignal(
    this.clientService.getAll(),
    { initialValue: [] }
  );
}

// En el template:
@for (client of clients(); track client.id) {
  <div>{{ client.company_name }}</div>
}
```

---

### 4. Unsubscribe de Observables (si usas RxJS directamente)

Solo necesitas esto si usas `.subscribe()` manualmente:

```typescript
import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({...})
export class MyComponent {
  constructor(private myService: MyService) {
    this.myService.getData()
      .pipe(takeUntilDestroyed())
      .subscribe(data => {
        // Tu código
      });
  }
}
```

**Mejor aún:** Usa `toSignal()` y evita `.subscribe()` completamente.

---

### 5. Componentes reutilizables

Crea componentes genéricos:
```bash
ng generate component shared/components/data-table
ng generate component shared/components/modal
ng generate component shared/components/loading-spinner
```

---

### 6. Variables SCSS centralizadas

**`src/assets/styles/_variables.scss`**:
```scss
// Colores
$primary-color: #0d6efd;
$secondary-color: #6c757d;
$success-color: #198754;
$danger-color: #dc3545;
$warning-color: #ffc107;

// Espaciado
$spacing-xs: 0.5rem;
$spacing-sm: 1rem;
$spacing-md: 1.5rem;
$spacing-lg: 2rem;
$spacing-xl: 3rem;

// Breakpoints
$breakpoint-mobile: 576px;
$breakpoint-tablet: 768px;
$breakpoint-desktop: 992px;
$breakpoint-wide: 1200px;
```

Importa en `styles.scss`:
```scss
@import './assets/styles/variables';
```

---

### 7. Separar lógica de UI

**MAL:**
```typescript
// Todo en el componente
this.http.get('...').subscribe(...)
```

**BIEN:**
```typescript
// Lógica en servicios
this.clientService.getAll().subscribe(...)
```

---

### 8. Tipado fuerte

Siempre define interfaces:
```typescript
// MAL
data: any;

// BIEN
data: Client[];
```

---

## 🚀 Deploy

### Frontend (Angular)

**Build para producción:**
```bash
ng build --configuration production
```

Esto genera la carpeta `dist/sice-frontend/` con archivos estáticos.

**Opciones de hosting gratuito:**

1. **Vercel** (RECOMENDADO)
   - Conecta tu repositorio de GitHub
   - Deploy automático en cada push
   - HTTPS gratis
   - CDN global

2. **Netlify**
   - Similar a Vercel
   - Drag & drop de la carpeta `dist/`

3. **Firebase Hosting**
   - Google
   - CDN global

---

### Backend (Laravel)

Ya tienes el backend en Hostinger. Solo asegúrate de:

1. Actualizar CORS para permitir tu dominio de frontend
2. Variables de entorno correctas
3. JWT configurado

---

## 📝 Checklist de inicio rápido

### Día 1: Setup
- [ ] Instalar Node.js y Angular CLI
- [ ] Crear proyecto Angular
- [ ] Configurar environments
- [ ] Instalar Bootstrap
- [ ] Configurar CORS en Laravel

### Día 2: Autenticación
- [ ] Crear modelos TypeScript
- [ ] Crear AuthService
- [ ] Crear interceptors
- [ ] Crear guards
- [ ] Componente de login

### Día 3: Admin Module
- [ ] Layout de admin
- [ ] Dashboard
- [ ] CRUD de clientes
- [ ] CRUD de órdenes

### Día 4: Client Module
- [ ] Layout de cliente
- [ ] Dashboard
- [ ] Mis órdenes
- [ ] Detalle de orden

### Día 5: Testing y Deploy
- [ ] Probar todos los flujos
- [ ] Build de producción
- [ ] Deploy frontend
- [ ] Conectar con API en producción

---

## 🎯 Comandos útiles

```bash
# Crear componente
ng generate component features/admin/clients/client-list

# Crear servicio
ng generate service core/services/order

# Crear guard
ng generate guard core/guards/auth

# Servir en desarrollo
ng serve

# Build para producción
ng build --configuration production

# Ver en navegador
# http://localhost:4200
```

---

## 🆘 Troubleshooting

### Error CORS
**Síntoma:** "Access-Control-Allow-Origin" error
**Solución:** Configurar CORS en Laravel (ver sección configuración)

### Token no se envía
**Síntoma:** 401 Unauthorized
**Solución:** Verificar que AuthInterceptor esté registrado

### Rutas no funcionan después de reload
**Síntoma:** 404 en producción
**Solución:** Configurar server para SPA (todas las rutas van a index.html)

---

## 📚 Recursos adicionales

- **Angular Docs**: https://angular.dev
- **Angular Signals**: https://angular.dev/guide/signals
- **Bootstrap**: https://getbootstrap.com
- **RxJS**: https://rxjs.dev
- **TypeScript**: https://www.typescriptlang.org

---

## 🎯 Signals vs RxJS - Guía de Decisión

### ✅ Usa SIGNALS para:

**1. Estado local de componentes**
```typescript
export class ClientFormComponent {
  public loading = signal(false);
  public selectedClient = signal<Client | null>(null);
}
```

**2. Estado compartido entre componentes**
```typescript
// AuthService
public currentUser = signal<User | null>(null);
public isAdmin = computed(() => this.currentUser()?.role === 'admin');
```

**3. Computed values (valores derivados)**
```typescript
public totalPrice = computed(() =>
  this.items().reduce((sum, item) => sum + item.price, 0)
);
```

**4. Estado que cambia con interacción del usuario**
```typescript
public selectedTab = signal('clients');
public showModal = signal(false);
```

---

### ✅ Usa RxJS para:

**1. HTTP requests (ya retornan Observables)**
```typescript
// ClientService
getAll(): Observable<Client[]> {
  return this.http.get<Client[]>(`${this.apiUrl}/clients`);
}
```

**2. Operaciones async complejas**
```typescript
// Buscar con debounce
searchTerm$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(term => this.search(term))
).subscribe(results => {
  this.results.set(results); // ← Guarda en signal
});
```

**3. Streams de eventos**
```typescript
fromEvent(window, 'resize').pipe(
  throttleTime(200)
).subscribe(() => {
  this.windowWidth.set(window.innerWidth);
});
```

**4. Combinación de múltiples fuentes async**
```typescript
combineLatest([
  this.userService.getUser(id),
  this.orderService.getUserOrders(id)
]).subscribe(([user, orders]) => {
  this.user.set(user);
  this.orders.set(orders);
});
```

---

### ✅ Combínalos (LO MEJOR):

**Patrón recomendado:**
```typescript
export class ClientListComponent {
  private clientService = inject(ClientService);

  // ✨ Signal para el estado
  public clients = signal<Client[]>([]);
  public loading = signal(false);
  public error = signal<string | null>(null);

  loadClients() {
    this.loading.set(true);
    this.error.set(null);

    // RxJS para el HTTP request
    this.clientService.getAll().subscribe({
      next: (data) => {
        this.clients.set(data); // ← Actualiza el signal
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }
}
```

**O usa `toSignal()` (más simple):**
```typescript
export class ClientListComponent {
  private clientService = inject(ClientService);

  // ✨ Convierte Observable → Signal automáticamente
  public clients = toSignal(
    this.clientService.getAll(),
    { initialValue: [] }
  );
}
```

---

### 📊 Comparación rápida:

| Característica | Signals | RxJS Observables |
|---|---|---|
| **Simplicidad** | ⭐⭐⭐⭐⭐ Muy simple | ⭐⭐⭐ Más complejo |
| **Performance** | ⭐⭐⭐⭐⭐ Granular | ⭐⭐⭐⭐ Bueno |
| **Async operations** | ⭐⭐⭐ Básico | ⭐⭐⭐⭐⭐ Excelente |
| **Unsubscribe** | ✅ Automático | ⚠️ Manual |
| **Learning curve** | ⭐⭐ Fácil | ⭐⭐⭐⭐ Difícil |
| **Type safety** | ⭐⭐⭐⭐⭐ Excelente | ⭐⭐⭐⭐ Bueno |
| **Futuro en Angular** | ✅ SÍ | ⚠️ Todavía necesario |

---

## ✅ Siguiente paso

**Ejecuta el primer comando:**
```bash
cd C:\projects\kd\
ng new sice-frontend
```

Y después te guío componente por componente. ¡Vamos! 🚀
