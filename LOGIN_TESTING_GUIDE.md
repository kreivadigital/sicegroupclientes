# 🧪 GUÍA DE PRUEBAS - LOGIN COMPONENT

## ✅ LOGIN IMPLEMENTADO COMPLETAMENTE

El componente de Login ha sido implementado con todas las características modernas de Angular 20.

---

## 📋 CARACTERÍSTICAS IMPLEMENTADAS

### 1. **Formulario Reactivo**
- ✅ Validación de email
- ✅ Validación de contraseña (mínimo 6 caracteres)
- ✅ Mensajes de error personalizados
- ✅ Feedback visual (campos inválidos en rojo)

### 2. **Signals (Estado Reactivo)**
- ✅ `loading` - Estado de carga
- ✅ `error` - Mensajes de error
- ✅ `showPassword` - Toggle de visibilidad

### 3. **Experiencia de Usuario**
- ✅ Botón "mostrar/ocultar contraseña"
- ✅ Loading spinner durante login
- ✅ Mensajes de error claros y específicos
- ✅ Deshabilitar botones durante carga
- ✅ Auto-focus en email después de error
- ✅ Limpiar errores al escribir

### 4. **Manejo de Errores**
- ✅ Error 401 - Credenciales incorrectas
- ✅ Error 422 - Validación del servidor
- ✅ Error 0 - Sin conexión al servidor
- ✅ Errores genéricos

### 5. **Redirección Inteligente**
- ✅ Según rol (admin → `/admin/dashboard`, client → `/client/dashboard`)
- ✅ Return URL (volver a la página que intentabas visitar)

### 6. **Diseño Moderno**
- ✅ Gradiente animado de fondo
- ✅ Tarjeta flotante con sombras
- ✅ Animaciones suaves
- ✅ Responsive (móvil y desktop)
- ✅ Bootstrap Icons

---

## 🚀 CÓMO PROBAR

### **Paso 1: Iniciar el servidor Angular**

```bash
cd C:\projects\kd\siceweb
npm start
```

Espera a que compile y abre: `http://localhost:4200`

---

### **Paso 2: Iniciar el backend Laravel**

```bash
cd C:\projects\kd\siceapi
php artisan serve
```

Debe estar corriendo en: `http://localhost:8000`

---

### **Paso 3: Probar el Login**

#### **OPCIÓN A: Con Backend Laravel (Real)**

Si tienes usuarios en la base de datos:

```
Email: admin@example.com (o el que tengas)
Password: password (o la que hayas configurado)
```

**Flujo esperado:**
1. Ingresas credenciales
2. Click en "Iniciar Sesión"
3. Loading spinner aparece
4. AuthService hace petición a `http://localhost:8000/api/auth/login`
5. auth-interceptor agrega token JWT
6. Backend valida y responde
7. Signal `currentUser` se actualiza
8. Guards permiten acceso
9. Redirige a dashboard según rol
10. Navbar muestra tu nombre
11. Sidebar muestra menú según rol

---

#### **OPCIÓN B: Sin Backend (Testing de UI)**

Puedes probar la validación del formulario sin backend:

**Casos de prueba:**

1. **Email inválido**
   - Email: `test`
   - Password: `123456`
   - Resultado: "Ingresa un email válido"

2. **Contraseña corta**
   - Email: `test@example.com`
   - Password: `123`
   - Resultado: "Mínimo 6 caracteres"

3. **Campos vacíos**
   - Dejar ambos campos vacíos
   - Click en "Iniciar Sesión"
   - Resultado: "Este campo es requerido"

4. **Toggle contraseña**
   - Escribir contraseña
   - Click en ícono de ojo
   - Resultado: Contraseña visible/oculta

---

### **Paso 4: Probar Guards**

#### **Test 1: Sin autenticación**
1. En nueva pestaña incógnita: `http://localhost:4200/admin/dashboard`
2. Resultado esperado: Redirige a `/auth/login`
3. URL incluye `?returnUrl=/admin/dashboard`

#### **Test 2: Rol incorrecto**
1. Login como Cliente
2. Intentar acceder: `http://localhost:4200/admin/dashboard`
3. Resultado esperado: Redirige a `/client/dashboard`

---

### **Paso 5: Probar Interceptors**

Abre DevTools (F12) → Network:

1. Haz login
2. En Network busca la petición a `/api/auth/login`
3. Verifica headers:
   - `Authorization: Bearer [token]` (agregado por interceptor)
4. Si ves 401, el error-interceptor hará logout automático

---

## 🎨 VISTA PREVIA DEL LOGIN

```
╔═══════════════════════════════════════════╗
║                                           ║
║          [Icono de Contenedor]            ║
║                                           ║
║      Sice Group Dashboard                 ║
║   Ingresa a tu cuenta para continuar      ║
║                                           ║
║   ┌─────────────────────────────────┐    ║
║   │ ✉ Correo Electrónico            │    ║
║   │ tu@email.com                    │    ║
║   └─────────────────────────────────┘    ║
║                                           ║
║   ┌──────────────────────────┬─────┐     ║
║   │ 🔒 Contraseña            │ 👁   │    ║
║   │ ••••••••                 │     │    ║
║   └──────────────────────────┴─────┘     ║
║                                           ║
║   ┌─────────────────────────────────┐    ║
║   │   ➡️  Iniciar Sesión            │    ║
║   └─────────────────────────────────┘    ║
║                                           ║
║        🔑 ¿Olvidaste tu contraseña?       ║
║                                           ║
║   ──────────────────────────────────     ║
║   🛡 Conexión segura con SSL              ║
║                                           ║
╚═══════════════════════════════════════════╝
```

---

## 🔍 VERIFICACIÓN DEL FLUJO COMPLETO

### **1. Verificar Signals funcionando**

Abre DevTools Console y ejecuta:

```javascript
// El currentUser signal debe actualizarse después del login
ng.getComponent($0) // Selecciona el componente
```

### **2. Verificar Guards**

En DevTools Console:

```javascript
// Después del login, intenta acceder directamente
window.location.href = '/admin/dashboard'
// Si eres cliente, el roleGuard te redirigirá a /client/dashboard
```

### **3. Verificar Interceptors**

En Network tab:
- Todas las peticiones HTTP deben tener `Authorization: Bearer ...`
- Si no lo tienen, el interceptor no está funcionando

### **4. Verificar LocalStorage**

En DevTools → Application → Local Storage:

```
sice_token: "eyJ0eXAiOiJKV1..."
sice_user: "{"id":1,"name":"Admin"...}"
```

---

## ⚠️ PROBLEMAS COMUNES

### **Problema 1: CORS Error**

**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solución:**

En Laravel (`C:\projects\kd\siceapi\config\cors.php`):

```php
'allowed_origins' => [
    'http://localhost:4200',  // ← Agregar esto
],
```

---

### **Problema 2: Cannot connect to API**

**Error:** "No se pudo conectar con el servidor"

**Verificar:**
1. Laravel está corriendo en `http://localhost:8000`
2. Environment.ts tiene `apiBase: 'http://localhost:8000/api'`

---

### **Problema 3: Guards no redirigen**

**Verificar:**
1. `app.routes.ts` tiene `canActivate: [authGuard, adminGuard]`
2. Token JWT no ha expirado
3. Signal `currentUser` tiene datos

---

### **Problema 4: Interceptor no agrega token**

**Verificar:**
1. `app.config.ts` tiene `provideHttpClient(withInterceptors([...]))`
2. Token existe en localStorage
3. AuthService.getToken() retorna el token

---

## 📊 FLUJO DE DATOS VISUAL

```
1. USUARIO ESCRIBE EMAIL Y PASSWORD
   ↓
2. COMPONENTE VALIDA FORMULARIO
   ↓
3. LLAMA AuthService.login(credentials)
   ↓
4. AuthService hace http.post('/api/auth/login')
   ↓
5. auth-interceptor agrega "Authorization: Bearer token"
   ↓
6. PETICIÓN VA AL BACKEND LARAVEL
   ↓
7. Backend valida y responde { access_token, user }
   ↓
8. AuthService guarda token en localStorage
   ↓
9. AuthService actualiza signal: currentUser.set(user)
   ↓
10. COMPONENTE DETECTA CAMBIO (automático con signals)
   ↓
11. REDIRIGE según rol:
    - Admin → /admin/dashboard (con adminGuard)
    - Client → /client/dashboard (con clientGuard)
    ↓
12. Guards verifican autenticación y rol
    ↓
13. DASHBOARD SE RENDERIZA
    - Navbar muestra nombre del usuario
    - Sidebar muestra menú según rol
```

---

## 🎯 CHECKLIST DE TESTING

### **Frontend (UI)**
- [ ] Formulario valida email formato correcto
- [ ] Formulario valida contraseña mínimo 6 caracteres
- [ ] Botón muestra loading spinner durante petición
- [ ] Botón está deshabilitado durante carga
- [ ] Toggle contraseña funciona (ojo/ojo tachado)
- [ ] Mensajes de error se muestran correctamente
- [ ] Mensajes de error se limpian al escribir
- [ ] Auto-focus en email después de error
- [ ] Diseño responsive en móvil
- [ ] Animaciones funcionan suavemente

### **Integración con Backend**
- [ ] Petición se envía a `http://localhost:8000/api/auth/login`
- [ ] auth-interceptor agrega header Authorization
- [ ] Token JWT se guarda en localStorage
- [ ] Usuario se guarda en localStorage
- [ ] Signal currentUser se actualiza

### **Guards**
- [ ] authGuard bloquea acceso sin token
- [ ] authGuard detecta token expirado
- [ ] adminGuard permite acceso solo a admins
- [ ] clientGuard permite acceso solo a clientes
- [ ] Redirección con returnUrl funciona

### **Interceptors**
- [ ] auth-interceptor agrega token a TODAS las peticiones
- [ ] error-interceptor detecta 401 y hace logout
- [ ] error-interceptor detecta 422 y muestra errores de validación
- [ ] error-interceptor detecta error 0 (sin conexión)

### **Navegación**
- [ ] Admin redirige a `/admin/dashboard`
- [ ] Cliente redirige a `/client/dashboard`
- [ ] Navbar muestra nombre del usuario
- [ ] Sidebar muestra menú según rol
- [ ] Logout funciona correctamente

---

## 🚀 PRÓXIMOS PASOS

Ahora que el login funciona, puedes implementar:

1. **Password Reset Component**
2. **Client CRUD** (Lista, Crear, Editar)
3. **Order CRUD**
4. **Container Tracking**
5. **Notifications System**

---

## 💡 TIPS DE DESARROLLO

### **Tip 1: Usar datos de prueba**

Si no tienes usuarios en la BD, crea uno:

```bash
php artisan tinker

User::create([
    'name' => 'Admin Test',
    'email' => 'admin@test.com',
    'password' => bcrypt('123456'),
    'role' => 'administrator',
    'status' => 'active'
]);
```

### **Tip 2: Ver requests en DevTools**

Network tab → Filter → XHR → Ver todas las peticiones HTTP

### **Tip 3: Debuggear Signals**

En el componente:
```typescript
effect(() => {
  console.log('User changed:', this.authService.currentUser());
});
```

### **Tip 4: Simular errores**

En el componente, comenta temporalmente la petición real:

```typescript
// Simular error
this.error.set('Credenciales incorrectas (simulado)');
this.loading.set(false);
```

---

¡El login está listo para usarse! 🎉
