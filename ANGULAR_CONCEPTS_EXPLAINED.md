# 📚 Angular Explicado: Conceptos Fundamentales

> **Guía completa con analogías y ejemplos prácticos**

---

## 📑 Tabla de Contenidos

1. [Nomenclaturas y Convenciones](#nomenclaturas-y-convenciones)
2. [Standalone Components vs NgModules](#standalone-components-vs-ngmodules)
3. [Directivas](#directivas)
4. [Interceptors](#interceptors)
5. [Guards](#guards)
6. [Signals](#signals)
7. [CORS](#cors)
8. [Environments](#environments)
9. [angular.json](#angularjson)
10. [package.json y Scripts](#packagejson-y-scripts)
11. [Angular 16- vs Angular 17+](#angular-16-vs-angular-17)

---

# 1. Nomenclaturas y Convenciones

## 📝 Guía Completa de Naming y Buenas Prácticas

Angular tiene convenciones estrictas que ayudan a mantener el código consistente y legible.

---

## 📁 Naming de Archivos

### Patrón General

```
[nombre].[tipo].[extensión]
```

**Ejemplos:**
```
login.component.ts        ← Componente
auth.service.ts           ← Servicio
auth.guard.ts             ← Guard
http-error.interceptor.ts ← Interceptor
user.model.ts             ← Modelo/Interface
client-list.pipe.ts       ← Pipe
highlight.directive.ts    ← Directiva
app.routes.ts             ← Rutas
app.config.ts             ← Configuración
```

### Reglas de Naming de Archivos

✅ **Usar kebab-case** (minúsculas con guiones)
```
✅ client-list.component.ts
✅ auth-http.interceptor.ts
✅ password-reset.component.ts

❌ ClientList.component.ts     (PascalCase)
❌ client_list.component.ts    (snake_case)
❌ clientList.component.ts     (camelCase)
```

✅ **Incluir el tipo en el nombre**
```
✅ auth.service.ts              (se ve que es servicio)
✅ admin.guard.ts               (se ve que es guard)

❌ auth.ts                      (¿qué es?)
❌ admin-protection.ts          (confuso)
```

✅ **Nombres descriptivos**
```
✅ client-form.component.ts     (claro)
✅ user-avatar.component.ts     (claro)

❌ form.component.ts            (muy genérico)
❌ comp1.component.ts           (sin sentido)
```

---

## 🏗️ Naming de Clases

### PascalCase para Clases

```typescript
// ✅ BIEN - PascalCase
export class LoginComponent { }
export class AuthService { }
export class AdminGuard { }
export class HttpErrorInterceptor { }
export interface User { }
export class ClientFormComponent { }

// ❌ MAL
export class loginComponent { }      // minúscula
export class auth_service { }        // snake_case
export class adminGuard { }          // camelCase
```

### Sufijos según el tipo

```typescript
// Componentes → Component
export class LoginComponent { }
export class UserAvatarComponent { }

// Servicios → Service
export class AuthService { }
export class ClientService { }

// Guards → Guard
export class AuthGuard { }
export class AdminGuard { }

// Interceptors → Interceptor
export class AuthInterceptor { }
export class ErrorInterceptor { }

// Directivas → Directive
export class HighlightDirective { }
export class TooltipDirective { }

// Pipes → Pipe
export class DateFormatPipe { }
export class CurrencyPipe { }

// Interfaces → Sin sufijo
export interface User { }
export interface Client { }
export interface LoginRequest { }
```

---

## 🔤 Naming de Variables y Métodos

### camelCase para variables y métodos

```typescript
export class LoginComponent {
  // ✅ Variables - camelCase
  userName: string;
  isLoading: boolean;
  selectedClient: Client | null;
  totalAmount: number;

  // ❌ MAL
  UserName: string;          // PascalCase
  is_loading: boolean;       // snake_case
  SELECTED_CLIENT: Client;   // SCREAMING_SNAKE_CASE

  // ✅ Métodos - camelCase
  getUserData() { }
  calculateTotal() { }
  onSubmitForm() { }

  // ❌ MAL
  GetUserData() { }          // PascalCase
  calculate_total() { }      // snake_case
}
```

---

## 🎯 RxJS Observables - Nomenclatura con $

### Regla: Observables terminan en $

**¿Por qué?** Para identificar inmediatamente que es un Observable (requiere subscribe).

```typescript
// ✅ BIEN - Observables con $
export class ClientService {
  private clientsSubject = new BehaviorSubject<Client[]>([]);
  public clients$ = this.clientsSubject.asObservable();
  //             ↑ $ indica que es Observable

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>('/api/clients');
  }
}

// En el componente
export class ClientListComponent {
  clients$: Observable<Client[]>;
  //      ↑ $ indica Observable

  ngOnInit() {
    this.clients$ = this.clientService.getClients();
  }
}
```

```html
<!-- En el template con async pipe -->
<div *ngFor="let client of clients$ | async">
  {{ client.name }}
</div>
```

**Patrón completo:**
```typescript
export class UserComponent {
  // Subject privado (sin $)
  private userSubject = new BehaviorSubject<User | null>(null);

  // Observable público (con $)
  public user$ = this.userSubject.asObservable();

  // Método que retorna Observable
  getUser(): Observable<User> {
    return this.http.get<User>('/api/user');
  }
}
```

---

## ⚡ Signals - Nomenclatura

### Regla: Signals SIN $, sin sufijo especial

**¿Por qué?** Signals se leen como funciones `()`, ya es claro que son reactivos.

```typescript
// ✅ BIEN - Signals sin sufijo
export class AuthService {
  // Signal
  public currentUser = signal<User | null>(null);
  //                   ↑ Sin $, sin sufijo

  // Computed signal
  public isAuthenticated = computed(() => this.currentUser() !== null);
  public isAdmin = computed(() => this.currentUser()?.role === 'admin');

  // ❌ MAL - No usar $
  public currentUser$ = signal<User | null>(null);  // Confuso
  public userSignal = signal<User | null>(null);    // Redundante
}
```

**En el template:**
```html
<!-- ✅ BIEN -->
@if (authService.currentUser()) {
  <p>{{ authService.currentUser()!.name }}</p>
}

<!-- ❌ MAL -->
@if (authService.currentUser$ | async) {
  <!-- Signals no usan async pipe -->
}
```

---

## 🔀 Mezclar Observables y Signals

```typescript
export class ClientService {
  // Signals
  public clients = signal<Client[]>([]);
  public loading = signal(false);

  // Observables (con $)
  private refreshTrigger$ = new Subject<void>();

  // Método que retorna Observable
  loadClients(): Observable<Client[]> {
    return this.http.get<Client[]>('/api/clients');
  }

  // Computed
  public clientCount = computed(() => this.clients().length);
}
```

**Regla clara:**
- **Observable** → `nombre$`
- **Signal** → `nombre` (sin sufijo)
- **Variable normal** → `nombre` (sin sufijo)

---

## 🏷️ Constantes

### SCREAMING_SNAKE_CASE para constantes

```typescript
// ✅ Constantes globales - SCREAMING_SNAKE_CASE
export const API_BASE_URL = 'https://api.example.com';
export const MAX_RETRY_ATTEMPTS = 3;
export const DEFAULT_TIMEOUT = 30000;

// ✅ Enums - PascalCase para el enum, SCREAMING_SNAKE_CASE para valores
export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client',
  GUEST = 'guest'
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Uso
const role = UserRole.ADMIN;
const status = OrderStatus.PENDING;
```

---

## 📦 Interfaces vs Types vs Classes

### Cuándo usar cada uno

#### Interfaces (para modelos de datos)

```typescript
// ✅ Interfaces - PascalCase, sin sufijo 'I'
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'client';
}

export interface Client {
  id: number;
  companyName: string;
  contactEmail: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

// ❌ MAL - No usar prefijo 'I'
export interface IUser { }       // Estilo C#/Java
export interface UserInterface { } // Redundante
```

#### Types (para tipos complejos)

```typescript
// ✅ Types - PascalCase
export type UserRole = 'admin' | 'client' | 'guest';
export type OrderStatus = 'pending' | 'processing' | 'completed';

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// Union types
export type ApiResponse<T> = {
  data: T;
  message: string;
} | {
  error: string;
  message: string;
};
```

#### Classes (para lógica)

```typescript
// ✅ Classes - PascalCase
export class User {
  constructor(
    public id: number,
    public name: string,
    public email: string
  ) {}

  isAdmin(): boolean {
    return this.email.endsWith('@admin.com');
  }
}

export class DateUtils {
  static formatDate(date: Date): string {
    return date.toISOString();
  }
}
```

**Regla de decisión:**
```
¿Tiene métodos o lógica? → Class
¿Solo estructura de datos? → Interface
¿Union types o aliases? → Type
```

---

## 🔒 Public vs Private

### Nomenclatura con prefijos

```typescript
export class AuthService {
  // ✅ Público - sin prefijo
  public currentUser = signal<User | null>(null);
  public isAuthenticated = computed(() => this.currentUser() !== null);

  // ✅ Privado - sin prefijo (TypeScript infiere)
  private tokenKey = 'auth_token';
  private apiUrl = environment.apiUrl;

  // ❌ OPCIONAL - underscore para privados (viejo estilo)
  private _tokenKey = 'auth_token';  // Válido pero no necesario

  // ✅ Métodos públicos
  login(credentials: LoginRequest) { }
  logout() { }

  // ✅ Métodos privados
  private setToken(token: string) { }
  private getToken(): string | null { }
}
```

**Convención moderna Angular:**
```typescript
// ✅ RECOMENDADO
private apiUrl: string;
public currentUser: User;

// ⚠️ VÁLIDO pero antiguo
private _apiUrl: string;
public _currentUser: User;
```

---

## 🎭 Selectores de Componentes

### Prefijo personalizado + kebab-case

```typescript
// ✅ BIEN - Prefijo 'app-' + kebab-case
@Component({
  selector: 'app-login',
  selector: 'app-client-list',
  selector: 'app-user-avatar',
})

// ✅ BIEN - Prefijo personalizado
@Component({
  selector: 'sice-login',          // Prefijo de tu empresa
  selector: 'sice-client-form',
})

// ❌ MAL
@Component({
  selector: 'Login',               // PascalCase
  selector: 'login-component',     // Redundante
  selector: 'login',               // Sin prefijo (puede chocar con HTML nativo)
})
```

**¿Por qué prefijo?**
- Evita colisiones con elementos HTML nativos
- Identifica componentes de tu app
- Namespace para múltiples apps en un workspace

---

## 📂 Estructura de Carpetas

### Convenciones de organización

```
src/app/
├── core/                           ← Singleton services, guards, interceptors
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── admin.guard.ts
│   ├── interceptors/
│   │   ├── auth.interceptor.ts
│   │   └── error.interceptor.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── api.service.ts
│   └── models/
│       ├── user.model.ts           ← Interfaces/Types
│       ├── client.model.ts
│       └── order.model.ts
│
├── shared/                         ← Componentes reutilizables
│   ├── components/
│   │   ├── button/
│   │   │   ├── button.component.ts
│   │   │   ├── button.component.html
│   │   │   └── button.component.scss
│   │   └── modal/
│   ├── pipes/
│   │   └── date-format.pipe.ts
│   └── directives/
│       └── highlight.directive.ts
│
├── features/                       ← Módulos por feature
│   ├── auth/
│   │   ├── login/
│   │   ├── signup/
│   │   └── auth.routes.ts
│   ├── admin/
│   │   ├── clients/
│   │   │   ├── client-list/
│   │   │   ├── client-form/
│   │   │   └── client-detail/
│   │   └── admin.routes.ts
│   └── client/
│
├── app.component.ts
├── app.routes.ts
└── app.config.ts
```

---

## 🎨 Naming de Métodos Lifecycle

### Orden y nomenclatura

```typescript
export class MyComponent {
  // 1. Properties primero
  title = 'Mi Componente';
  users: User[] = [];

  // 2. Constructor
  constructor(private userService: UserService) {}

  // 3. Lifecycle hooks en orden de ejecución
  ngOnChanges() { }      // 1. Cuando @Input cambia
  ngOnInit() { }         // 2. Inicialización
  ngDoCheck() { }        // 3. Change detection manual
  ngAfterContentInit() { }  // 4. Content projection iniciado
  ngAfterContentChecked() { }
  ngAfterViewInit() { }  // 5. View iniciada
  ngAfterViewChecked() { }
  ngOnDestroy() { }      // 6. Limpieza

  // 4. Métodos públicos
  loadUsers() { }
  deleteUser(id: number) { }

  // 5. Métodos privados
  private formatDate(date: Date) { }

  // 6. Event handlers (prefijo 'on')
  onSubmit() { }
  onClick() { }
  onUserSelected(user: User) { }
}
```

---

## 🎯 Event Handlers

### Prefijo 'on' para eventos

```typescript
export class LoginComponent {
  // ✅ Event handlers con 'on'
  onSubmit() { }
  onClick() { }
  onInputChange(event: Event) { }
  onFormSubmit(form: FormGroup) { }
  onUserSelected(user: User) { }
  onDeleteConfirmed() { }

  // ❌ MAL
  submit() { }              // Confuso
  handleClick() { }         // Verboso
  userSelected() { }        // No se ve que es evento
}
```

```html
<!-- En el template -->
<form (ngSubmit)="onSubmit()">
  <button (click)="onClick()">Click</button>
  <input (change)="onInputChange($event)">
</form>
```

---

## 📝 Métodos CRUD

### Convención para operaciones de datos

```typescript
export class ClientService {
  // ✅ CRUD - Verbos claros
  getAll(): Observable<Client[]> { }
  getById(id: number): Observable<Client> { }
  create(client: Client): Observable<Client> { }
  update(id: number, client: Client): Observable<Client> { }
  delete(id: number): Observable<void> { }

  // ✅ Variantes aceptadas
  findAll(): Observable<Client[]> { }
  findOne(id: number): Observable<Client> { }
  save(client: Client): Observable<Client> { }
  remove(id: number): Observable<void> { }

  // ❌ MAL
  getAllClients(): Observable<Client[]> { }  // Redundante con el nombre de la clase
  clientById(id: number) { }                 // Confuso
  doCreate(client: Client) { }               // 'do' innecesario
}
```

---

## 🔧 Métodos Booleanos

### Prefijos is/has/can/should

```typescript
export class AuthService {
  // ✅ Métodos booleanos con prefijos
  isAuthenticated(): boolean { }
  isAdmin(): boolean { }
  isClient(): boolean { }

  hasPermission(permission: string): boolean { }
  hasRole(role: string): boolean { }

  canEdit(resource: Resource): boolean { }
  canDelete(resource: Resource): boolean { }

  shouldShowMenu(): boolean { }
  shouldRedirect(): boolean { }

  // ✅ Signals booleanos
  public isLoading = signal(false);
  public isValid = computed(() => this.form().valid);
  public hasErrors = computed(() => this.errors().length > 0);
}
```

---

## 📋 Template Variables

### Convención en templates

```html
<!-- ✅ Template reference variables - lowercase o camelCase -->
<input #emailInput type="email">
<form #loginForm="ngForm">
<div #modalContent>

<!-- Uso -->
<button (click)="emailInput.focus()">Focus</button>

<!-- ✅ Structural directive variables -->
@for (item of items; track item.id) {
  {{ item.name }}
}

@if (user; as currentUser) {
  {{ currentUser.name }}
}

<!-- ❌ MAL -->
<input #EmailInput>      <!-- PascalCase -->
<input #email_input>     <!-- snake_case -->
```

---

## 🎨 CSS/SCSS Naming

### BEM o kebab-case

```scss
// ✅ BIEN - kebab-case
.login-container {
  .login-header { }
  .login-form { }
  .login-button { }
}

// ✅ BIEN - BEM
.login {
  &__header { }
  &__form { }
  &__button {
    &--primary { }
    &--disabled { }
  }
}

// ❌ MAL
.LoginContainer { }     // PascalCase
.login_container { }    // snake_case
.loginContainer { }     // camelCase
```

---

## 📦 Imports - Orden

### Organización de imports

```typescript
// ✅ ORDEN RECOMENDADO

// 1. Angular core
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// 2. RxJS
import { Observable, Subject } from 'rxjs';
import { map, filter, debounceTime } from 'rxjs/operators';

// 3. Librerías de terceros
import { jwtDecode } from 'jwt-decode';

// 4. Environments
import { environment } from '../../../environments/environment';

// 5. Models
import { User, Client, LoginRequest } from '../../models';

// 6. Services
import { AuthService } from '../../services/auth.service';
import { ClientService } from '../../services/client.service';

// 7. Components locales
import { NavbarComponent } from '../navbar/navbar.component';
```

---

## 💬 Comentarios

### Convención de comentarios

```typescript
/**
 * AuthService maneja la autenticación de usuarios.
 *
 * @example
 * ```typescript
 * authService.login({ email: 'user@example.com', password: '123' })
 *   .subscribe(response => console.log(response));
 * ```
 */
export class AuthService {
  /**
   * Usuario actualmente autenticado.
   * Se actualiza automáticamente después del login/logout.
   */
  public currentUser = signal<User | null>(null);

  /**
   * Inicia sesión con email y contraseña.
   *
   * @param credentials - Email y contraseña del usuario
   * @returns Observable con la respuesta del login
   * @throws Error si las credenciales son inválidas
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    // TODO: Agregar validación de email
    // FIXME: El timeout debería ser configurable
    return this.http.post<LoginResponse>('/api/login', credentials);
  }

  /**
   * Cierra la sesión del usuario actual.
   * Limpia el token y redirige al login.
   */
  logout(): void {
    // Limpiar token
    localStorage.removeItem('token');

    // Actualizar signal
    this.currentUser.set(null);
  }
}
```

---

## 📊 Resumen de Convenciones

### Tabla de Referencia Rápida

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| **Archivos** | kebab-case.tipo.ts | `auth.service.ts` |
| **Clases** | PascalCase + Sufijo | `AuthService` |
| **Interfaces** | PascalCase (sin 'I') | `User`, `LoginRequest` |
| **Variables** | camelCase | `userName`, `isLoading` |
| **Métodos** | camelCase | `getUsers()`, `onClick()` |
| **Observables** | camelCase + $ | `users$`, `loading$` |
| **Signals** | camelCase (sin $) | `users`, `loading` |
| **Constantes** | SCREAMING_SNAKE_CASE | `API_URL`, `MAX_ATTEMPTS` |
| **Enums** | PascalCase | `UserRole.ADMIN` |
| **Selectores** | prefijo-kebab-case | `app-login`, `sice-button` |
| **CSS Classes** | kebab-case o BEM | `.login-form`, `.button--primary` |
| **Booleanos** | is/has/can/should + camelCase | `isValid`, `hasPermission` |
| **Event Handlers** | on + PascalCase | `onClick`, `onSubmit` |
| **CRUD Methods** | get/create/update/delete | `getById()`, `create()` |

---

## ✅ Checklist de Buenas Prácticas

```typescript
// ✅ ARCHIVO: auth.service.ts (kebab-case)
import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { User, LoginRequest } from '../models';

// ✅ CLASE: PascalCase + Service
@Injectable({ providedIn: 'root' })
export class AuthService {

  // ✅ Signal: camelCase, sin $
  public currentUser = signal<User | null>(null);

  // ✅ Computed: camelCase, prefijo 'is'
  public isAuthenticated = computed(() => this.currentUser() !== null);
  public isAdmin = computed(() => this.currentUser()?.role === 'admin');

  // ✅ Constante privada: camelCase
  private readonly TOKEN_KEY = 'auth_token';

  // ✅ Constructor
  constructor(private http: HttpClient) {}

  // ✅ Método público CRUD: camelCase
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/login', credentials);
  }

  // ✅ Método público booleano: 'is' prefix
  isTokenValid(): boolean {
    return !!this.getToken();
  }

  // ✅ Método privado: camelCase
  private getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
```

---

## 🎯 Ejercicio de Práctica

### Corrige este código:

```typescript
// ❌ TODO MAL
export class login_component {
  User$: User;
  is_loading: boolean;
  ClientList: Client[];

  constructor(private Auth_Service: AuthService) {}

  Submit() {
    this.is_loading = true;
    this.Auth_Service.Login().subscribe();
  }

  check_auth(): boolean {
    return this.User$ !== null;
  }
}
```

### ✅ Corrección:

```typescript
// ✅ TODO BIEN
export class LoginComponent {
  user = signal<User | null>(null);
  isLoading = signal(false);
  clients = signal<Client[]>([]);

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.isLoading.set(true);
    this.authService.login().subscribe();
  }

  isAuthenticated(): boolean {
    return this.user() !== null;
  }
}
```

---

**Siguiente:** [Standalone Components vs NgModules](#standalone-components-vs-ngmodules)

---

# 2. Standalone Components vs NgModules

## 🏢 Analogía: Edificio de oficinas

### NgModules (Angular 16 y anteriores)

**Imagina un edificio de oficinas tradicional:**

```
🏢 EDIFICIO (NgModule)
├── 📦 Recepción (declarations)
│   ├── 👤 Empleado 1 (Component A)
│   ├── 👤 Empleado 2 (Component B)
│   └── 👤 Empleado 3 (Component C)
│
├── 🔧 Herramientas compartidas (imports)
│   ├── 🔨 Martillo (FormsModule)
│   ├── 🪛 Destornillador (HttpClientModule)
│   └── 📊 Calculadora (RouterModule)
│
├── 📤 Servicios externos (exports)
│   └── 🚚 Delivery (Component A disponible para otros edificios)
│
└── 🏪 Proveedores (providers)
    └── ☕ Máquina de café (Services)
```

**Código NgModule:**
```typescript
@NgModule({
  declarations: [    // 📦 Los empleados que trabajan en este edificio
    LoginComponent,
    DashboardComponent,
    NavbarComponent
  ],
  imports: [         // 🔧 Herramientas que este edificio necesita
    CommonModule,    // Herramientas básicas (if, for, etc.)
    FormsModule,     // Formularios
    HttpClientModule // HTTP requests
  ],
  exports: [         // 📤 Lo que este edificio comparte con otros
    NavbarComponent  // Otros edificios pueden usar el navbar
  ],
  providers: [       // 🏪 Servicios disponibles
    AuthService
  ]
})
export class AuthModule { }
```

**Problemas del NgModule:**

❌ **Dependencias confusas:**
```typescript
// Si LoginComponent necesita FormsModule, tienes que importarlo en el módulo
@NgModule({
  imports: [FormsModule], // ← Imports del módulo, no del componente
  declarations: [LoginComponent]
})
```
El componente no dice qué necesita, el módulo lo decide.

❌ **Mucho boilerplate:**
- Crear archivo `auth.module.ts`
- Declarar todos los componentes
- Importar módulos necesarios
- Configurar routing module separado
- etc.

❌ **Tree-shaking menos eficiente:**
Angular no puede eliminar código no usado tan fácilmente.

---

### Standalone Components (Angular 17+)

**Imagina trabajadores remotos independientes:**

```
👤 TRABAJADOR INDEPENDIENTE (Standalone Component)
├── 💼 Su propia mochila de herramientas (imports)
│   ├── 🔨 FormsModule (solo si lo necesita)
│   ├── 🪛 CommonModule (solo si lo necesita)
│   └── 📊 RouterModule (solo si lo necesita)
│
└── ✅ Listo para trabajar (no necesita edificio)
```

**Código Standalone:**
```typescript
@Component({
  selector: 'app-login',
  standalone: true,    // ✨ Soy independiente
  imports: [           // 💼 Mis propias herramientas
    CommonModule,      // Para usar @if, @for
    ReactiveFormsModule // Para formularios
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent { }
```

**Ventajas del Standalone:**

✅ **Claridad:**
```typescript
// El componente DICE exactamente qué necesita
imports: [ReactiveFormsModule, HttpClientModule]
// ↑ Veo inmediatamente las dependencias
```

✅ **Menos código:**
```typescript
// ANTES (NgModule) - 2 archivos
// auth.module.ts
@NgModule({
  declarations: [LoginComponent, SignupComponent],
  imports: [CommonModule, FormsModule]
})

// AHORA (Standalone) - En el mismo componente
@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
```

✅ **Mejor tree-shaking:**
Angular elimina automáticamente código no usado → bundle más pequeño.

✅ **Fácil de compartir:**
```typescript
// Puedes importar el componente directamente
@Component({
  imports: [LoginComponent] // ← Directo, sin módulo
})
```

---

## 🔄 Comparación Lado a Lado

### Crear un módulo de autenticación:

**Angular 16- (NgModule):**
```typescript
// ❌ auth.module.ts (archivo separado)
@NgModule({
  declarations: [
    LoginComponent,
    SignupComponent,
    PasswordResetComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AuthRoutingModule
  ]
})
export class AuthModule { }

// auth-routing.module.ts (otro archivo)
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }

// login.component.ts
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent { } // Sin imports
```

**Angular 17+ (Standalone):**
```typescript
// ✅ auth.routes.ts (simple archivo de rutas)
export const authRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent }
];

// login.component.ts
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // ← Directo aquí
  templateUrl: './login.component.html'
})
export class LoginComponent { }
```

**Resultado:**
- NgModule: 3 archivos, más complejo
- Standalone: 2 archivos, más simple

---

# 3. Directivas

## 🎨 Analogía: Etiquetas mágicas en HTML

Las directivas son **instrucciones especiales** que le dan superpoderes a tu HTML.

### Tipos de Directivas

```
🎨 DIRECTIVAS
├── 🏗️ Structural (cambian el DOM)
│   ├── *ngIf → Mostrar/ocultar elementos
│   ├── *ngFor → Repetir elementos
│   └── *ngSwitch → Cambiar entre opciones
│
├── 🎭 Attribute (cambian apariencia/comportamiento)
│   ├── [ngClass] → Agregar/quitar clases CSS
│   ├── [ngStyle] → Cambiar estilos inline
│   └── [disabled] → Cambiar atributos
│
└── 🔧 Component (son componentes)
    └── <app-login> → Un componente es una directiva con template
```

---

### A) Directivas Estructurales

**Cambian la estructura del DOM** (agregan/quitan elementos).

#### *ngIf - Mostrar/Ocultar

**Analogía:** Interruptor de luz 💡

```html
<!-- VIEJO (Angular 16-) -->
<div *ngIf="isLoggedIn">
  Bienvenido, {{ userName }}
</div>

<!-- NUEVO (Angular 17+) -->
@if (isLoggedIn) {
  <div>Bienvenido, {{ userName }}</div>
}

@if (isAdmin) {
  <button>Panel Admin</button>
} @else {
  <p>Acceso denegado</p>
}
```

**Qué hace:**
- Si `isLoggedIn` es `true` → el `<div>` **EXISTE** en el DOM
- Si `isLoggedIn` es `false` → el `<div>` **NO EXISTE** (ni siquiera está oculto)

---

#### *ngFor - Repetir elementos

**Analogía:** Fotocopiadora 📄📄📄

```html
<!-- VIEJO (Angular 16-) -->
<div *ngFor="let client of clients">
  {{ client.name }}
</div>

<!-- NUEVO (Angular 17+) -->
@for (client of clients; track client.id) {
  <div>{{ client.name }}</div>
}
```

**Qué hace:**
```typescript
clients = [
  { id: 1, name: 'Juan' },
  { id: 2, name: 'María' },
  { id: 3, name: 'Pedro' }
];
```

**Resultado en HTML:**
```html
<div>Juan</div>
<div>María</div>
<div>Pedro</div>
```

**El `track`:**
```html
@for (client of clients; track client.id) {
  ↑ Angular usa el ID para saber qué cambió
}
```

Esto mejora performance. Si María cambia su nombre, Angular solo actualiza ese `<div>`, no todos.

---

### B) Directivas de Atributo

**Cambian apariencia o comportamiento** (sin cambiar estructura).

#### [ngClass] - Agregar clases dinámicamente

**Analogía:** Cambiar de ropa según la ocasión 👔👕

```html
<button [ngClass]="{
  'btn-success': isActive,
  'btn-danger': !isActive,
  'btn-large': isImportant
}">
  Botón
</button>
```

**Si:**
- `isActive = true` y `isImportant = true`

**Resultado:**
```html
<button class="btn-success btn-large">Botón</button>
```

---

#### [ngStyle] - Cambiar estilos inline

```html
<div [ngStyle]="{
  'background-color': backgroundColor,
  'font-size': fontSize + 'px',
  'border': isHighlighted ? '2px solid red' : 'none'
}">
  Contenido
</div>
```

---

### C) Directivas Personalizadas

**Analogía:** Crear tu propia herramienta mágica 🪄

```typescript
// highlight.directive.ts
import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {
  constructor(private el: ElementRef) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.el.nativeElement.style.backgroundColor = 'yellow';
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.el.nativeElement.style.backgroundColor = '';
  }
}
```

**Uso:**
```html
<p appHighlight>Pasa el mouse aquí</p>
<!-- ↑ Se pone amarillo cuando pasas el mouse -->
```

---

# 4. Interceptors

## 🚦 Analogía: Inspector de Aduana

Imagina que tu app Angular es un país y el backend es otro país.

```
FRONTEND (Angular)        BACKEND (Laravel API)
┌─────────────┐          ┌──────────────┐
│             │          │              │
│  Component  │          │   Laravel    │
│      │      │          │     API      │
│      ▼      │          │              │
│  HttpClient │ ─────────│► /api/login  │
│      │      │          │              │
│      ▼      │          └──────────────┘
│ Interceptor │ ◄─ Inspector de aduana
│   (🚦)      │    Revisa TODO lo que entra/sale
└─────────────┘
```

**El interceptor es un "inspector" que:**
1. ✅ Revisa TODAS las requests antes de enviarlas
2. ✅ Puede modificarlas (agregar headers, tokens, etc.)
3. ✅ Revisa TODAS las responses antes de que lleguen al componente
4. ✅ Puede interceptar errores

---

## Ejemplo Real: AuthInterceptor

**Problema sin interceptor:**
```typescript
// ❌ Tienes que agregar el token manualmente EN CADA REQUEST
getClients() {
  const token = localStorage.getItem('token');
  return this.http.get('/api/clients', {
    headers: { Authorization: `Bearer ${token}` }
  });
}

getOrders() {
  const token = localStorage.getItem('token'); // Repetitivo
  return this.http.get('/api/orders', {
    headers: { Authorization: `Bearer ${token}` } // Repetitivo
  });
}
```

**Solución con interceptor:**
```typescript
// ✅ auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 🚦 Inspector: "¡Alto! ¿Tienes token?"
  const token = localStorage.getItem('sice_token');

  if (token) {
    // 📝 Agrega el token a la request automáticamente
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // ✅ "Okay, puedes pasar"
  return next(req);
};
```

**Ahora en tus servicios:**
```typescript
// ✅ No necesitas agregar el token manualmente
getClients() {
  return this.http.get('/api/clients');
  // ↑ El interceptor agrega el token automáticamente
}

getOrders() {
  return this.http.get('/api/orders');
  // ↑ El interceptor agrega el token automáticamente
}
```

---

## Tipos de Interceptors Comunes

### 1. Auth Interceptor (agregar token)

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req);
};
```

---

### 2. Error Interceptor (manejar errores globalmente)

```typescript
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 🚨 Intercepta TODOS los errores HTTP

      if (error.status === 401) {
        // Token expirado, redirigir a login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }

      if (error.status === 403) {
        alert('No tienes permisos');
      }

      if (error.status === 500) {
        alert('Error del servidor');
      }

      return throwError(() => error);
    })
  );
};
```

---

### 3. Loading Interceptor (mostrar spinner)

```typescript
import { inject } from '@angular/core';
import { LoadingService } from '../services/loading.service';
import { finalize } from 'rxjs';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // 🔄 Muestra el spinner
  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      // ✅ Oculta el spinner cuando termine (éxito o error)
      loadingService.hide();
    })
  );
};
```

---

### 4. Logging Interceptor (debug)

```typescript
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('📤 Request:', req.method, req.url);

  const started = Date.now();

  return next(req).pipe(
    tap(event => {
      if (event.type === HttpEventType.Response) {
        const elapsed = Date.now() - started;
        console.log(`📥 Response: ${req.url} (${elapsed}ms)`);
      }
    })
  );
};
```

---

## Registrar Interceptors

**app.config.ts:**
```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        authInterceptor,      // 1. Primero agrega token
        errorInterceptor,     // 2. Luego maneja errores
        loadingInterceptor    // 3. Finalmente maneja loading
      ])
    )
  ]
};
```

**⚠️ Orden importa:**
Los interceptors se ejecutan en el orden que los registras.

---

# 5. Guards

## 🛡️ Analogía: Guardia de seguridad en un edificio

```
🏢 TU APP (Edificio)
├── 🚪 Puerta de entrada (/login) ─────────── ✅ Abierto para todos
├── 🚪 Oficinas (/client/dashboard) ───────── 🛡️ Solo clientes autenticados
├── 🚪 Sala VIP (/admin/dashboard) ────────── 🛡️🛡️ Solo admins
└── 🚪 Sala de servidores (/config) ───────── ❌ Nadie puede entrar
```

Los **guards** son guardias que verifican si puedes entrar a una ruta.

---

## Tipos de Guards

### 1. CanActivate (¿Puedes entrar?)

**Analogía:** Guardia en la puerta del club 🕴️

```typescript
// auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 🛡️ "¿Tienes credencial (token)?"
  if (authService.isAuthenticated()) {
    return true; // ✅ "Adelante, puedes pasar"
  }

  // ❌ "Lo siento, necesitas iniciar sesión"
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url } // Guarda a dónde querías ir
  });
  return false;
};
```

**Uso en rutas:**
```typescript
// app.routes.ts
export const routes: Routes = [
  { path: 'login', component: LoginComponent }, // Sin guard

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard] // 🛡️ Protegida
  }
];
```

**Flujo:**
1. Usuario intenta ir a `/dashboard`
2. Guard pregunta: "¿Está autenticado?"
3. SI → Puede entrar
4. NO → Redirige a `/login`

---

### 2. Role Guard (¿Tienes el rol correcto?)

**Analogía:** Guardia con lista VIP 📋

```typescript
// admin.guard.ts
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 🛡️ "¿Eres admin?"
  if (authService.isAdmin()) {
    return true; // ✅ "Adelante"
  }

  // ❌ "Esta área es solo para admins"
  alert('Acceso denegado');
  router.navigate(['/client/dashboard']);
  return false;
};
```

**Uso:**
```typescript
export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard], // 🛡️🛡️ Doble protección
    children: [
      { path: 'clients', component: ClientListComponent },
      { path: 'orders', component: OrderListComponent }
    ]
  }
];
```

**Flujo:**
1. Usuario intenta ir a `/admin/clients`
2. `authGuard` pregunta: "¿Estás autenticado?" → SI
3. `adminGuard` pregunta: "¿Eres admin?" → NO
4. Redirige a `/client/dashboard`

---

### 3. CanDeactivate (¿Puedes salir?)

**Analogía:** Guardia que pregunta "¿Guardaste tus cambios?" 💾

```typescript
// unsaved-changes.guard.ts
export interface CanComponentDeactivate {
  canDeactivate: () => boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  // 🛡️ "¿Seguro que quieres salir sin guardar?"
  if (component.canDeactivate()) {
    return true;
  }

  return confirm('Tienes cambios sin guardar. ¿Quieres salir de todos modos?');
};
```

**En el componente:**
```typescript
export class ClientFormComponent implements CanComponentDeactivate {
  form: FormGroup;

  canDeactivate(): boolean {
    // Si el formulario está limpio, puede salir
    return !this.form.dirty;
  }
}
```

**Uso:**
```typescript
{
  path: 'client/edit/:id',
  component: ClientFormComponent,
  canDeactivate: [unsavedChangesGuard] // 🛡️ Pregunta antes de salir
}
```

---

### 4. CanLoad (¿Puedes cargar este módulo?)

**Analogía:** Guardia que ni siquiera te deja ver el edificio 🚧

```typescript
export const canLoadAdminGuard: CanMatchFn = () => {
  const authService = inject(AuthService);

  // Si no eres admin, ni siquiera cargues el código
  return authService.isAdmin();
};
```

**Diferencia con CanActivate:**
- **CanActivate:** Carga el código, luego verifica
- **CanLoad:** Verifica primero, solo carga si puede

**Uso:**
```typescript
{
  path: 'admin',
  canMatch: [canLoadAdminGuard], // No carga si no es admin
  loadChildren: () => import('./features/admin/admin.routes')
}
```

---

## Múltiples Guards

```typescript
{
  path: 'admin/clients/edit/:id',
  component: ClientEditComponent,
  canActivate: [authGuard, adminGuard],       // Debe estar autenticado Y ser admin
  canDeactivate: [unsavedChangesGuard]        // Pregunta antes de salir
}
```

**Orden de ejecución:**
1. `authGuard` → ¿Autenticado?
2. `adminGuard` → ¿Es admin?
3. Si ambos OK, carga el componente
4. Al salir, `unsavedChangesGuard` → ¿Guardó cambios?

---

# 6. Signals

## ⚡ Analogía: Variables mágicas que avisan cuando cambian

### Problema sin Signals

**Variables normales:**
```typescript
export class CounterComponent {
  count = 0;

  increment() {
    this.count++; // Cambia, pero Angular no se entera inmediatamente
  }
}
```

Angular usa **Change Detection** para detectar cambios. Revisa TODO el árbol de componentes en cada evento.

---

### Solución con Signals

```typescript
import { signal } from '@angular/core';

export class CounterComponent {
  count = signal(0); // ⚡ Variable mágica

  increment() {
    this.count.set(this.count() + 1);
    // ↑ Angular se entera INMEDIATAMENTE
  }
}
```

**En el template:**
```html
<p>Contador: {{ count() }}</p>
<!-- ↑ Se actualiza automáticamente cuando cambia -->
```

---

## Tipos de Signals

### 1. Signal básico

```typescript
public name = signal('Juan');

// Leer
console.log(this.name()); // 'Juan'

// Escribir
this.name.set('María'); // Cambia a 'María'

// Actualizar basado en valor anterior
this.name.update(currentName => currentName.toUpperCase()); // 'MARÍA'
```

---

### 2. Computed Signal (valor derivado)

**Analogía:** Fórmula en Excel que se recalcula sola 📊

```typescript
export class CartComponent {
  // Signals base
  public items = signal([
    { name: 'Manzana', price: 100, quantity: 2 },
    { name: 'Pan', price: 50, quantity: 1 }
  ]);

  // ⚡ Computed: se recalcula automáticamente
  public total = computed(() => {
    return this.items().reduce((sum, item) =>
      sum + (item.price * item.quantity), 0
    );
  });

  public itemCount = computed(() => this.items().length);
}
```

**En el template:**
```html
<p>Total: ${{ total() }}</p>
<p>Productos: {{ itemCount() }}</p>

<!-- Si agregas un item, total() y itemCount() se actualizan SOLOS -->
```

**Magia:**
```typescript
addItem(item: Item) {
  this.items.update(current => [...current, item]);
  // ↑ total() y itemCount() se recalculan AUTOMÁTICAMENTE
}
```

---

### 3. Effect (ejecutar código cuando algo cambia)

**Analogía:** Alarma que se activa cuando algo cambia 🚨

```typescript
import { effect } from '@angular/core';

export class UserComponent {
  public user = signal({ name: 'Juan', age: 25 });

  constructor() {
    // ⚡ Se ejecuta cuando user cambia
    effect(() => {
      console.log('Usuario cambió:', this.user());

      // Guardar en localStorage
      localStorage.setItem('user', JSON.stringify(this.user()));
    });
  }

  updateName(name: string) {
    this.user.update(u => ({ ...u, name }));
    // ↑ Effect se ejecuta automáticamente
  }
}
```

---

## Signals vs RxJS

### ¿Cuándo usar cada uno?

**SIGNALS para:**
```typescript
// ✅ Estado local
public loading = signal(false);
public selectedTab = signal('clients');

// ✅ Estado compartido
// auth.service.ts
public currentUser = signal<User | null>(null);

// ✅ Valores derivados
public isAdmin = computed(() => this.currentUser()?.role === 'admin');

// ✅ Listas que cambian
public clients = signal<Client[]>([]);
```

**RxJS para:**
```typescript
// ✅ HTTP requests (retornan Observables)
getClients(): Observable<Client[]> {
  return this.http.get<Client[]>('/api/clients');
}

// ✅ Operaciones async complejas
searchTerm$.pipe(
  debounceTime(300),           // Espera 300ms
  distinctUntilChanged(),      // Solo si cambió
  switchMap(term => this.search(term)) // Buscar
)

// ✅ Eventos
fromEvent(window, 'scroll').pipe(
  throttleTime(100)
)
```

---

## Convertir Observable → Signal

```typescript
import { toSignal } from '@angular/core/rxjs-interop';

export class ClientListComponent {
  private clientService = inject(ClientService);

  // Observable (HTTP request)
  private clients$ = this.clientService.getAll();

  // ⚡ Convertir a Signal
  public clients = toSignal(this.clients$, {
    initialValue: [] // Valor mientras carga
  });
}

// En el template:
@for (client of clients(); track client.id) {
  <div>{{ client.name }}</div>
}
```

---

# 7. CORS

## 🌐 Analogía: Guardia de fronteras entre países

```
FRONTEND                    BACKEND
http://localhost:4200       https://api.sicegroup.com.uy
┌──────────────┐            ┌─────────────────┐
│   Angular    │   CORS?    │   Laravel API   │
│              │ ◄────────► │                 │
│  Navegador   │   🚧       │   Servidor      │
└──────────────┘            └─────────────────┘
```

**CORS = Cross-Origin Resource Sharing**

"¿Permites que sitios de OTROS dominios hagan requests a tu API?"

---

## El Problema

**Por defecto, los navegadores BLOQUEAN requests entre diferentes orígenes:**

```
FRONTEND: http://localhost:4200
         ↓ (intenta hacer request)
BACKEND:  https://api.sicegroup.com.uy
         ↓
NAVEGADOR: ❌ "¡CORS bloqueado! Son diferentes orígenes"
```

**Diferentes orígenes:**
- `http://localhost:4200` vs `https://api.sicegroup.com.uy` (diferente dominio)
- `http://localhost:4200` vs `http://localhost:3000` (diferente puerto)
- `http://example.com` vs `https://example.com` (diferente protocolo)

---

## La Solución: Configurar Laravel

**Laravel debe decir:** "Sí, permito requests desde Angular"

**config/cors.php:**
```php
<?php

return [
    // Qué rutas permiten CORS
    'paths' => ['api/*'],

    // Qué métodos HTTP están permitidos
    'allowed_methods' => ['*'], // GET, POST, PUT, DELETE, etc.

    // Qué orígenes están permitidos
    'allowed_origins' => [
        'http://localhost:4200',              // Angular en desarrollo
        'https://tusitio.com',                // Tu frontend en producción
    ],

    // Qué headers están permitidos
    'allowed_headers' => ['*'], // Authorization, Content-Type, etc.

    // Exponer headers al frontend
    'exposed_headers' => [],

    // Tiempo de cache de preflight
    'max_age' => 0,

    // Permitir cookies/credenciales
    'supports_credentials' => false,
];
```

---

## Cómo Funciona CORS

### Request Simple (GET)

```
1. ANGULAR:
   fetch('https://api.sicegroup.com.uy/api/clients')

2. NAVEGADOR (automáticamente agrega):
   Origin: http://localhost:4200

3. LARAVEL responde con:
   Access-Control-Allow-Origin: http://localhost:4200
   ↑ "Sí, permito requests desde localhost:4200"

4. NAVEGADOR:
   ✅ "OK, Laravel permite este origen. Entrego la response a Angular"
```

---

### Request Complejo (POST con headers custom)

```
1. NAVEGADOR (hace preflight automáticamente):
   OPTIONS https://api.sicegroup.com.uy/api/clients
   Origin: http://localhost:4200
   Access-Control-Request-Method: POST
   Access-Control-Request-Headers: Authorization, Content-Type

2. LARAVEL responde:
   Access-Control-Allow-Origin: http://localhost:4200
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE
   Access-Control-Allow-Headers: Authorization, Content-Type
   ↑ "Sí, permito esos métodos y headers"

3. NAVEGADOR:
   ✅ "OK, Laravel permite. Ahora sí hago el POST real"

4. ANGULAR:
   POST https://api.sicegroup.com.uy/api/clients
   (con Authorization header)

5. LARAVEL responde con los datos
```

---

## Errores CORS Comunes

### ❌ Error 1: "No 'Access-Control-Allow-Origin' header"

```
Access to fetch at 'https://api.sicegroup.com.uy/api/clients'
from origin 'http://localhost:4200' has been blocked by CORS policy
```

**Causa:** Laravel no tiene CORS configurado o tu origen no está permitido.

**Solución:**
```php
// config/cors.php
'allowed_origins' => [
    'http://localhost:4200', // ← Agrega tu origen
],
```

---

### ❌ Error 2: "Preflight request doesn't pass"

**Causa:** El preflight (OPTIONS) falla.

**Solución:**
```php
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

---

### ❌ Error 3: "Credentials mode is 'include'"

**Causa:** Angular envía cookies pero Laravel no lo permite.

**Solución:**
```php
'supports_credentials' => true,
```

```typescript
// Angular
this.http.get(url, {
  withCredentials: true // ← Envía cookies
})
```

---

## Desarrollo vs Producción

```php
// config/cors.php

// ❌ MAL (permite todo en producción)
'allowed_origins' => ['*'],

// ✅ BIEN (específico por ambiente)
'allowed_origins' => env('FRONTEND_URL')
    ? [env('FRONTEND_URL')]
    : ['http://localhost:4200'],
```

**.env (desarrollo):**
```
FRONTEND_URL=http://localhost:4200
```

**.env (producción):**
```
FRONTEND_URL=https://tusitio.com
```

---

# 8. Environments

## 🌍 Analogía: Configuraciones según el lugar

```
TU APP
├── 🏠 Casa (Development)
│   └── WiFi: "MiCasa123"
│   └── API: http://localhost:8000
│
├── 🏢 Oficina (Staging)
│   └── WiFi: "OficinaWiFi"
│   └── API: https://staging.api.com
│
└── 🌐 Mundo (Production)
    └── WiFi: "PublicWiFi"
    └── API: https://api.sicegroup.com.uy
```

Los **environments** son archivos con configuraciones diferentes según dónde corre la app.

---

## Estructura de Environments

```
src/
└── environments/
    ├── environment.ts           ← Development (default)
    ├── environment.staging.ts   ← Staging
    └── environment.prod.ts      ← Production
```

---

## Configuración de Environments

### environment.ts (Development)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  appName: 'SICE Group DEV',

  // Features flags
  enableDebugMode: true,
  enableAnalytics: false,

  // API Keys
  googleMapsKey: 'DEV_KEY_123',

  // Timeouts
  apiTimeout: 30000, // 30 segundos

  // Logging
  logLevel: 'debug'
};
```

---

### environment.staging.ts (Pre-producción)

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://staging-api.sicegroup.com.uy/api',
  appName: 'SICE Group STAGING',

  enableDebugMode: true,
  enableAnalytics: true, // Test analytics

  googleMapsKey: 'STAGING_KEY_456',

  apiTimeout: 30000,

  logLevel: 'info'
};
```

---

### environment.prod.ts (Producción)

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.sicegroup.com.uy/api',
  appName: 'SICE Group',

  enableDebugMode: false,
  enableAnalytics: true,

  googleMapsKey: 'PROD_KEY_789',

  apiTimeout: 10000, // 10 segundos (más estricto)

  logLevel: 'error' // Solo errores
};
```

---

## Usar Environments en el Código

```typescript
// auth.service.ts
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl; // ← Se adapta según el ambiente

  login(credentials: LoginRequest) {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials);
    // DEV:     http://localhost:8000/api/auth/login
    // STAGING: https://staging-api.sicegroup.com.uy/api/auth/login
    // PROD:    https://api.sicegroup.com.uy/api/auth/login
  }
}
```

```typescript
// logger.service.ts
import { environment } from '../../../environments/environment';

export class LoggerService {
  log(message: string) {
    if (environment.logLevel === 'debug') {
      console.log(message); // Solo en dev
    }
  }

  error(message: string) {
    if (['debug', 'info', 'error'].includes(environment.logLevel)) {
      console.error(message); // En todos
    }
  }
}
```

---

## Configurar angular.json para Environments

**angular.json:**
```json
{
  "projects": {
    "sice-frontend": {
      "architect": {
        "build": {
          "configurations": {

            "development": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.ts"
                }
              ],
              "optimization": false,
              "sourceMap": true,
              "extractLicenses": false
            },

            "staging": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.staging.ts"
                }
              ],
              "optimization": true,
              "sourceMap": false,
              "budgets": [...]
            },

            "production": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.prod.ts"
                }
              ],
              "optimization": true,
              "outputHashing": "all",
              "sourceMap": false,
              "extractCss": true,
              "namedChunks": false,
              "aot": true,
              "extractLicenses": true,
              "vendorChunk": false,
              "buildOptimizer": true,
              "budgets": [...]
            }
          }
        },

        "serve": {
          "configurations": {
            "development": {
              "buildTarget": "sice-frontend:build:development"
            },
            "staging": {
              "buildTarget": "sice-frontend:build:staging"
            },
            "production": {
              "buildTarget": "sice-frontend:build:production"
            }
          }
        }
      }
    }
  }
}
```

---

## Comandos para Usar Environments

```bash
# Development (default)
ng serve
# o
ng serve --configuration development
# Usa: environment.ts
# URL: http://localhost:4200

# Staging
ng serve --configuration staging
# Usa: environment.staging.ts
# URL: http://localhost:4200 (pero apunta a staging API)

# Production (local)
ng serve --configuration production
# Usa: environment.prod.ts
# URL: http://localhost:4200 (pero apunta a prod API)
```

---

## Build para cada Ambiente

```bash
# Development build
ng build
# Genera: dist/ con environment.ts

# Staging build
ng build --configuration staging
# Genera: dist/ con environment.staging.ts
# Optimizado, pero con sourcemaps

# Production build
ng build --configuration production
# Genera: dist/ con environment.prod.ts
# Totalmente optimizado, minificado, sin sourcemaps
```

---

## Variables de Entorno Secretas

**⚠️ NUNCA pongas secrets en environments:**

```typescript
// ❌ MAL
export const environment = {
  apiKey: 'super_secret_key_123' // ← Visible en el código compilado
};
```

**✅ BIEN - Usa variables de entorno del servidor:**

```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.sicegroup.com.uy/api',
  // No incluyas API keys aquí
};
```

En el backend (Laravel), usa `.env`:
```
API_SECRET=super_secret_key_123
```

---

# 9. angular.json

## 📋 Analogía: Manual de instrucciones de tu app

El `angular.json` es como el **manual de construcción** de tu app. Le dice a Angular:
- Cómo compilar
- Qué archivos usar
- Dónde guardar el resultado
- Qué optimizaciones aplicar

---

## Estructura Principal

```json
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "sice-frontend": { ... }  // ← Tu proyecto
  }
}
```

---

## Secciones Importantes

### 1. Build Configuration

```json
{
  "projects": {
    "sice-frontend": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            // 📁 Archivos principales
            "outputPath": "dist/sice-frontend",  // Dónde guarda el build
            "index": "src/index.html",           // HTML principal
            "main": "src/main.ts",               // Archivo TypeScript principal
            "polyfills": ["zone.js"],            // Compatibilidad navegadores viejos

            // 🎨 Assets y estilos
            "assets": [
              "src/favicon.ico",
              "src/assets"                       // Carpeta de imágenes, etc.
            ],
            "styles": [
              "node_modules/bootstrap/dist/css/bootstrap.min.css",
              "src/styles.scss"                  // Estilos globales
            ],
            "scripts": [
              "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"
            ],

            // 🔧 Configuración TypeScript
            "tsConfig": "tsconfig.app.json"
          }
        }
      }
    }
  }
}
```

---

### 2. Configurations (Development, Staging, Production)

```json
{
  "build": {
    "configurations": {

      // 🏠 Development
      "development": {
        "optimization": false,        // No optimizar (más rápido)
        "extractLicenses": false,     // No extraer licencias
        "sourceMap": true,            // Incluir source maps (debug)
        "namedChunks": true,          // Nombres legibles en chunks
        "fileReplacements": [
          {
            "replace": "src/environments/environment.ts",
            "with": "src/environments/environment.ts"
          }
        ]
      },

      // 🏢 Staging
      "staging": {
        "optimization": true,         // Optimizar código
        "outputHashing": "all",       // Hash en archivos (cache busting)
        "sourceMap": true,            // Incluir source maps (debug staging)
        "namedChunks": false,         // Nombres minificados
        "extractLicenses": true,
        "budgets": [
          {
            "type": "initial",
            "maximumWarning": "2mb",  // Aviso si pasa 2MB
            "maximumError": "5mb"     // Error si pasa 5MB
          }
        ],
        "fileReplacements": [
          {
            "replace": "src/environments/environment.ts",
            "with": "src/environments/environment.staging.ts"
          }
        ]
      },

      // 🌐 Production
      "production": {
        "optimization": true,         // Optimización máxima
        "outputHashing": "all",       // Hash en todo
        "sourceMap": false,           // SIN source maps (seguridad)
        "namedChunks": false,
        "aot": true,                  // Compilación ahead-of-time
        "extractLicenses": true,
        "vendorChunk": false,         // No separar vendor chunk
        "buildOptimizer": true,       // Optimizador de build
        "budgets": [
          {
            "type": "initial",
            "maximumWarning": "500kb",
            "maximumError": "1mb"
          },
          {
            "type": "anyComponentStyle",
            "maximumWarning": "2kb",
            "maximumError": "4kb"
          }
        ],
        "fileReplacements": [
          {
            "replace": "src/environments/environment.ts",
            "with": "src/environments/environment.prod.ts"
          }
        ]
      }
    }
  }
}
```

---

### 3. Serve Configuration (ng serve)

```json
{
  "serve": {
    "builder": "@angular-devkit/build-angular:dev-server",
    "options": {
      "buildTarget": "sice-frontend:build"
    },
    "configurations": {

      // ng serve (default)
      "development": {
        "buildTarget": "sice-frontend:build:development",
        "port": 4200,
        "host": "localhost"
      },

      // ng serve --configuration staging
      "staging": {
        "buildTarget": "sice-frontend:build:staging",
        "port": 4300,
        "host": "0.0.0.0"  // Accesible desde red local
      },

      // ng serve --configuration production
      "production": {
        "buildTarget": "sice-frontend:build:production",
        "port": 4400
      }
    },
    "defaultConfiguration": "development"
  }
}
```

---

### 4. Test Configuration

```json
{
  "test": {
    "builder": "@angular-devkit/build-angular:karma",
    "options": {
      "polyfills": ["zone.js", "zone.js/testing"],
      "tsConfig": "tsconfig.spec.json",
      "assets": ["src/favicon.ico", "src/assets"],
      "styles": ["src/styles.scss"],
      "scripts": [],
      "karmaConfig": "karma.conf.js"
    }
  }
}
```

---

## Configurar Multiple Environments en angular.json

**Ejemplo completo para localhost, staging, production:**

```json
{
  "projects": {
    "sice-frontend": {
      "architect": {
        "build": {
          "configurations": {

            "localhost": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.ts"
                }
              ],
              "optimization": false,
              "sourceMap": true
            },

            "staging": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.staging.ts"
                }
              ],
              "optimization": true,
              "outputHashing": "all",
              "sourceMap": true
            },

            "production": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.prod.ts"
                }
              ],
              "optimization": true,
              "outputHashing": "all",
              "sourceMap": false,
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kb",
                  "maximumError": "1mb"
                }
              ]
            }
          }
        },

        "serve": {
          "configurations": {
            "localhost": {
              "buildTarget": "sice-frontend:build:localhost",
              "port": 4200,
              "proxyConfig": "proxy.conf.json"  // ← Proxy para evitar CORS en dev
            },
            "staging": {
              "buildTarget": "sice-frontend:build:staging",
              "port": 4200
            },
            "production": {
              "buildTarget": "sice-frontend:build:production",
              "port": 4200
            }
          }
        }
      }
    }
  }
}
```

---

## Proxy Configuration (evitar CORS en desarrollo)

**proxy.conf.json:**
```json
{
  "/api": {
    "target": "http://localhost:8000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

**Cómo funciona:**
```typescript
// En development con proxy
this.http.get('/api/clients')
// ↓ Angular redirige automáticamente a:
// http://localhost:8000/api/clients
```

Sin proxy tendrías CORS errors porque Angular (4200) → Laravel (8000).

---

## Budgets (límites de tamaño)

```json
{
  "budgets": [
    {
      "type": "initial",           // Bundle inicial
      "maximumWarning": "500kb",   // Aviso si pasa 500KB
      "maximumError": "1mb"        // ERROR si pasa 1MB
    },
    {
      "type": "anyComponentStyle", // Estilos de componentes
      "maximumWarning": "2kb",
      "maximumError": "4kb"
    }
  ]
}
```

Si el build pasa estos límites:
```
Warning: initial exceeded maximum budget. Budget 500.00 kB was not met by 123.45 kB with a total of 623.45 kB.
```

---

# 10. package.json y Scripts

## 📦 Analogía: Lista de compras y recetas

**package.json** es como:
1. **Lista de compras** (dependencies) - "Qué ingredientes necesito"
2. **Libro de recetas** (scripts) - "Cómo cocinar"

---

## Estructura del package.json

```json
{
  "name": "sice-frontend",
  "version": "1.0.0",
  "scripts": { ... },
  "dependencies": { ... },
  "devDependencies": { ... }
}
```

---

## Dependencies vs DevDependencies

### dependencies (Runtime - van a producción)

**Analogía:** Ingredientes que van en el plato final 🍕

```json
{
  "dependencies": {
    "@angular/animations": "^20.0.0",
    "@angular/common": "^20.0.0",
    "@angular/core": "^20.0.0",
    "@angular/forms": "^20.0.0",
    "@angular/router": "^20.0.0",

    "bootstrap": "^5.3.0",          // UI framework
    "jwt-decode": "^4.0.0",         // Decodificar JWT
    "rxjs": "^7.8.0",               // Reactive programming
    "zone.js": "^0.15.0"            // Change detection
  }
}
```

Estas librerías **SE INCLUYEN** en el bundle final.

---

### devDependencies (Build time - NO van a producción)

**Analogía:** Utensilios de cocina 🔪 (no van en el plato)

```json
{
  "devDependencies": {
    "@angular/cli": "^20.0.0",        // Herramienta de desarrollo
    "@angular/compiler-cli": "^20.0.0", // Compilador
    "typescript": "~5.4.0",           // Lenguaje TypeScript

    "karma": "^6.4.0",                // Test runner
    "jasmine": "^5.0.0",              // Testing framework

    "eslint": "^8.50.0",              // Linter (revisar código)
    "prettier": "^3.0.0"              // Formatter (formatear código)
  }
}
```

Estas librerías **NO SE INCLUYEN** en el bundle final.

---

## Scripts (Comandos personalizados)

### Scripts Básicos

```json
{
  "scripts": {
    // 🏃 Desarrollo
    "start": "ng serve",
    "start:staging": "ng serve --configuration staging",
    "start:prod": "ng serve --configuration production",

    // 🔨 Build
    "build": "ng build",
    "build:staging": "ng build --configuration staging",
    "build:prod": "ng build --configuration production",

    // 🧪 Testing
    "test": "ng test",
    "test:ci": "ng test --watch=false --browsers=ChromeHeadless",

    // 🔍 Linting
    "lint": "ng lint",
    "lint:fix": "ng lint --fix",

    // 📊 Análisis
    "analyze": "ng build --configuration production --stats-json && webpack-bundle-analyzer dist/sice-frontend/stats.json"
  }
}
```

---

### Scripts Avanzados

```json
{
  "scripts": {
    // 🚀 Desarrollo con proxy
    "dev": "ng serve --configuration development --proxy-config proxy.conf.json --open",

    // 🏗️ Build + Deploy
    "deploy:staging": "npm run build:staging && firebase deploy --only hosting:staging",
    "deploy:prod": "npm run build:prod && firebase deploy --only hosting:production",

    // 🧹 Limpieza
    "clean": "rm -rf dist node_modules",
    "clean:install": "npm run clean && npm install",

    // 📝 Pre-commit
    "format": "prettier --write \"src/**/*.{ts,html,scss}\"",
    "format:check": "prettier --check \"src/**/*.{ts,html,scss}\"",

    // 🔄 Actualizar dependencias
    "update": "ng update @angular/cli @angular/core",

    // 📦 Bundle size check
    "bundle:report": "ng build --configuration production --stats-json && webpack-bundle-analyzer dist/sice-frontend/stats.json --mode static --report bundle-report.html",

    // 🧪 Tests con coverage
    "test:coverage": "ng test --no-watch --code-coverage",

    // 🔐 Security audit
    "audit": "npm audit --production",
    "audit:fix": "npm audit fix"
  }
}
```

---

### Scripts Completos para Proyecto Real

```json
{
  "name": "sice-frontend",
  "version": "1.0.0",
  "scripts": {
    // ===================================
    // 🏃 DESARROLLO
    // ===================================
    "start": "ng serve --open",
    "dev": "ng serve --configuration development --proxy-config proxy.conf.json --open",
    "dev:staging": "ng serve --configuration staging --open",

    // ===================================
    // 🔨 BUILD
    // ===================================
    "build": "ng build",
    "build:dev": "ng build --configuration development",
    "build:staging": "ng build --configuration staging",
    "build:prod": "ng build --configuration production",

    // ===================================
    // 🧪 TESTING
    // ===================================
    "test": "ng test",
    "test:watch": "ng test --watch=true",
    "test:ci": "ng test --watch=false --code-coverage --browsers=ChromeHeadless",
    "test:coverage": "ng test --no-watch --code-coverage && open coverage/index.html",

    // ===================================
    // 🔍 LINTING & FORMATTING
    // ===================================
    "lint": "ng lint",
    "lint:fix": "ng lint --fix",
    "format": "prettier --write \"src/**/*.{ts,html,scss,json}\"",
    "format:check": "prettier --check \"src/**/*.{ts,html,scss,json}\"",

    // ===================================
    // 🚀 DEPLOYMENT
    // ===================================
    "deploy:staging": "npm run build:staging && firebase deploy --only hosting:staging",
    "deploy:prod": "npm run build:prod && firebase deploy --only hosting:production",

    // ===================================
    // 📊 ANÁLISIS
    // ===================================
    "analyze": "ng build --configuration production --stats-json && webpack-bundle-analyzer dist/sice-frontend/browser/stats.json",
    "bundle:report": "npm run build:prod -- --stats-json && webpack-bundle-analyzer dist/sice-frontend/browser/stats.json --mode static",

    // ===================================
    // 🧹 MANTENIMIENTO
    // ===================================
    "clean": "rm -rf dist .angular node_modules",
    "clean:install": "npm run clean && npm install",
    "clean:cache": "npm cache clean --force",

    // ===================================
    // 🔄 UPDATES
    // ===================================
    "update:check": "ng update",
    "update:angular": "ng update @angular/cli @angular/core",
    "update:all": "ng update @angular/cli @angular/core && npm update",

    // ===================================
    // 🔐 SECURITY
    // ===================================
    "audit": "npm audit --production",
    "audit:fix": "npm audit fix",

    // ===================================
    // 🎯 PRE-COMMIT (usar con Husky)
    // ===================================
    "pre-commit": "npm run format && npm run lint:fix && npm run test:ci"
  },
  "dependencies": {
    "@angular/animations": "^20.3.7",
    "@angular/common": "^20.3.7",
    "@angular/compiler": "^20.3.7",
    "@angular/core": "^20.3.7",
    "@angular/forms": "^20.3.7",
    "@angular/platform-browser": "^20.3.7",
    "@angular/platform-browser-dynamic": "^20.3.7",
    "@angular/router": "^20.3.7",
    "bootstrap": "^5.3.0",
    "bootstrap-icons": "^1.11.0",
    "jwt-decode": "^4.0.0",
    "rxjs": "^7.8.0",
    "zone.js": "^0.15.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^20.3.7",
    "@angular/cli": "^20.3.7",
    "@angular/compiler-cli": "^20.3.7",
    "@types/jasmine": "~5.1.0",
    "jasmine-core": "~5.4.0",
    "karma": "~6.4.0",
    "karma-chrome-launcher": "~3.2.0",
    "karma-coverage": "~2.2.0",
    "karma-jasmine": "~5.1.0",
    "karma-jasmine-html-reporter": "~2.1.0",
    "prettier": "^3.0.0",
    "typescript": "~5.6.2",
    "webpack-bundle-analyzer": "^4.9.0"
  }
}
```

---

## Usar los Scripts

```bash
# Ejecutar un script
npm run [nombre-script]

# Ejemplos:
npm run dev              # ng serve con proxy
npm run build:prod       # Build de producción
npm run test:coverage    # Tests con coverage
npm run deploy:staging   # Deploy a staging
npm run analyze          # Análisis de bundle

# Script "start" es especial (puede omitir "run")
npm start                # = npm run start
```

---

## Scripts con Argumentos

```bash
# Pasar argumentos con --
npm run build:prod -- --verbose
# Ejecuta: ng build --configuration production --verbose

npm start -- --port 4300
# Ejecuta: ng serve --port 4300
```

---

## Versionado Semántico (^ vs ~)

```json
{
  "dependencies": {
    "bootstrap": "^5.3.0",   // ← Actualiza a 5.x.x (MAJOR fijo)
    "rxjs": "~7.8.0"         // ← Actualiza a 7.8.x (MINOR fijo)
  }
}
```

**Formato:** `MAJOR.MINOR.PATCH`

- **^5.3.0** → Permite 5.3.1, 5.4.0, 5.9.9 (NO 6.0.0)
- **~7.8.0** → Permite 7.8.1, 7.8.9 (NO 7.9.0)
- **5.3.0** → Exactamente 5.3.0 (fijo)
- **latest** → Última versión (peligroso)

---

# 11. Angular 16- vs Angular 17+

## 🆚 Comparación Completa

### Resumen de Cambios Mayores

| Feature | Angular 16- | Angular 17+ |
|---------|------------|------------|
| **Componentes** | NgModules obligatorios | Standalone por defecto |
| **Control Flow** | `*ngIf`, `*ngFor` | `@if`, `@for` |
| **Routing** | NgModule + RouterModule | Routes funcionales |
| **Signals** | No existe | Nativo y recomendado |
| **Guards** | Class-based | Functional |
| **Interceptors** | Class-based | Functional |
| **Performance** | Bueno | Excelente |
| **Bundle size** | Más grande | Más pequeño |

---

### 1. Componentes

**Angular 16-:**
```typescript
// ❌ component.ts
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent { }

// ❌ module.ts (archivo separado obligatorio)
@NgModule({
  declarations: [LoginComponent],
  imports: [CommonModule, FormsModule],
  exports: [LoginComponent]
})
export class AuthModule { }
```

**Angular 17+:**
```typescript
// ✅ component.ts (todo en uno)
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent { }

// No necesitas module.ts
```

---

### 2. Templates (Control Flow)

**Angular 16-:**
```html
<!-- ❌ Sintaxis vieja -->
<div *ngIf="user; else loading">
  Hola {{ user.name }}
</div>
<ng-template #loading>
  Cargando...
</ng-template>

<div *ngFor="let item of items; trackBy: trackByFn">
  {{ item.name }}
</div>

<div [ngSwitch]="role">
  <div *ngSwitchCase="'admin'">Admin Panel</div>
  <div *ngSwitchCase="'client'">Client Panel</div>
  <div *ngSwitchDefault>No access</div>
</div>
```

**Angular 17+:**
```html
<!-- ✅ Nueva sintaxis -->
@if (user) {
  Hola {{ user.name }}
} @else {
  Cargando...
}

@for (item of items; track item.id) {
  {{ item.name }}
}

@switch (role) {
  @case ('admin') {
    Admin Panel
  }
  @case ('client') {
    Client Panel
  }
  @default {
    No access
  }
}
```

**Ventajas de la nueva sintaxis:**
- Más legible
- Mejor type checking
- Mejor performance
- No necesitas `ng-template`

---

### 3. Routing

**Angular 16-:**
```typescript
// ❌ app-routing.module.ts
const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

// ❌ admin-routing.module.ts
const routes: Routes = [
  { path: '', component: AdminDashboardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }

// ❌ admin.module.ts
@NgModule({
  declarations: [AdminDashboardComponent],
  imports: [CommonModule, AdminRoutingModule]
})
export class AdminModule { }
```

**Angular 17+:**
```typescript
// ✅ app.routes.ts (simple archivo)
export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes)
  }
];

// ✅ admin.routes.ts
export const adminRoutes: Routes = [
  { path: '', component: AdminDashboardComponent }
];

// No necesitas módulos
```

---

### 4. Guards

**Angular 16-:**
```typescript
// ❌ Class-based guard
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
```

**Angular 17+:**
```typescript
// ✅ Functional guard (más simple)
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};
```

---

### 5. Interceptors

**Angular 16-:**
```typescript
// ❌ Class-based interceptor
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');

    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(req);
  }
}

// Registro complejo en module
@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
```

**Angular 17+:**
```typescript
// ✅ Functional interceptor (más simple)
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req);
};

// Registro simple
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
```

---

### 6. Signals (Nueva Feature)

**Angular 16-:**
```typescript
// ❌ RxJS únicamente
export class CounterComponent {
  private countSubject = new BehaviorSubject(0);
  public count$ = this.countSubject.asObservable();

  increment() {
    this.countSubject.next(this.countSubject.value + 1);
  }

  ngOnDestroy() {
    this.countSubject.complete(); // Necesitas limpiar
  }
}

// Template
<p>{{ count$ | async }}</p>
```

**Angular 17+:**
```typescript
// ✅ Signals (más simple)
export class CounterComponent {
  public count = signal(0);

  increment() {
    this.count.update(n => n + 1);
  }

  // No necesitas ngOnDestroy
}

// Template
<p>{{ count() }}</p>
```

---

### 7. Dependency Injection

**Angular 16-:**
```typescript
// ❌ Constructor injection
export class MyComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}
}
```

**Angular 17+:**
```typescript
// ✅ inject() function (más flexible)
export class MyComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);

  // O todavía puedes usar constructor
  constructor() {}
}
```

**Ventaja de `inject()`:**
```typescript
// Puedes usarlo fuera del constructor
export class MyComponent {
  private loadData = () => {
    const http = inject(HttpClient); // ← Funciona
    return http.get('/api/data');
  };
}
```

---

### 8. Performance

**Mejoras en Angular 17+:**

✅ **Cambio de detección más eficiente:**
- Signals permiten change detection granular
- Solo actualiza lo que realmente cambió

✅ **Bundle size más pequeño:**
- Tree-shaking mejorado
- Standalone elimina código no usado

✅ **Hydration (SSR):**
- Mejor server-side rendering
- Menos flicker al cargar

**Benchmarks:**

| Métrica | Angular 16 | Angular 17+ | Mejora |
|---------|-----------|-------------|---------|
| Bundle inicial | 150 KB | 120 KB | -20% |
| Change detection | 5ms | 2ms | -60% |
| Time to Interactive | 2.5s | 1.8s | -28% |

---

### 9. Bootstrapping

**Angular 16-:**
```typescript
// ❌ main.ts
platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));

// ❌ app.module.ts
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

**Angular 17+:**
```typescript
// ✅ main.ts (más simple)
bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));

// ✅ app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
};

// No necesitas app.module.ts
```

---

### 10. Testing

**Angular 16-:**
```typescript
// ❌ TestBed con módulos
TestBed.configureTestingModule({
  declarations: [LoginComponent],
  imports: [ReactiveFormsModule, HttpClientTestingModule]
});
```

**Angular 17+:**
```typescript
// ✅ TestBed con standalone
TestBed.configureTestingModule({
  imports: [LoginComponent] // ← Importa el componente directamente
});
```

---

## 🎯 Migración de Angular 16 a 17+

### Paso 1: Actualizar CLI
```bash
npm install -g @angular/cli@latest
ng version
```

### Paso 2: Actualizar proyecto
```bash
ng update @angular/core@17 @angular/cli@17
```

### Paso 3: Migrar a standalone
```bash
ng generate @angular/core:standalone
```

Este comando convierte automáticamente:
- Componentes a standalone
- Guards a functional
- Interceptors a functional

---

## 📊 Conclusión: ¿Por qué Angular 17+ es mejor?

| Aspecto | Mejora |
|---------|---------|
| **Código** | 30-40% menos líneas |
| **Performance** | 20-30% más rápido |
| **Bundle** | 15-25% más pequeño |
| **Developer Experience** | Mucho mejor |
| **Learning Curve** | Más fácil para nuevos |
| **Mantenibilidad** | Más simple de mantener |

---

**Tu situación:** Empezar con Angular 20 = ¡Perfecto! Ya tienes todas estas mejoras desde el inicio.

