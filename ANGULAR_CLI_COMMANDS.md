# 🚀 Angular CLI - Comandos Útiles

> **Guía completa de comandos `ng` para Angular 20+**

---

## 📋 Tabla de Contenidos

1. [Comandos Básicos](#comandos-básicos)
2. [Generar Código (ng generate)](#generar-código-ng-generate)
3. [Desarrollo (ng serve)](#desarrollo-ng-serve)
4. [Build (ng build)](#build-ng-build)
5. [Testing (ng test)](#testing-ng-test)
6. [Análisis y Optimización](#análisis-y-optimización)
7. [Actualización (ng update)](#actualización-ng-update)
8. [Configuración (ng config)](#configuración-ng-config)
9. [Comandos Avanzados](#comandos-avanzados)
10. [Atajos y Aliases](#atajos-y-aliases)

---

## 🎯 Comandos Básicos

### Crear un nuevo proyecto

```bash
# Crear proyecto básico
ng new nombre-proyecto

# Con opciones interactivas
ng new sice-frontend

# ¿Routing? → Yes
# ¿Estilos? → SCSS

# Crear sin interacción (con defaults)
ng new mi-proyecto --routing --style=scss --skip-git

# Crear sin instalar dependencias (instalar después manualmente)
ng new mi-proyecto --skip-install
```

**Opciones útiles:**
```bash
--routing                    # Agrega Angular Router
--style=css|scss|sass|less   # Tipo de estilos
--skip-git                   # No inicializa Git
--skip-install               # No ejecuta npm install
--strict                     # Modo estricto TypeScript (recomendado)
--standalone                 # Usa standalone components (default en Angular 17+)
--prefix=sice                # Prefijo personalizado para componentes (default: app)
```

---

### Ver versión de Angular

```bash
# Ver versión de Angular CLI
ng version
# o
ng v

# Output:
#     _                      _                 ____ _     ___
#    / \   _ __   __ _ _   _| | __ _ _ __     / ___| |   |_ _|
#   / △ \ | '_ \ / _` | | | | |/ _` | '__|   | |   | |    | |
#  / ___ \| | | | (_| | |_| | | (_| | |      | |___| |___ | |
# /_/   \_\_| |_|\__, |\__,_|_|\__,_|_|       \____|_____|___|
#                |___/
# Angular CLI: 20.3.7
# Node: 22.14.0
# Package Manager: npm 11.6.0
```

---

### Ver ayuda

```bash
# Ayuda general
ng help
ng --help
ng -h

# Ayuda de un comando específico
ng generate --help
ng serve --help
ng build --help
```

---

## 🎨 Generar Código (ng generate)

### Alias: `ng g`

Genera automáticamente archivos con la estructura correcta.

---

### Componentes

```bash
# Componente básico
ng generate component nombre
ng g c nombre

# Componente en una carpeta específica
ng g c features/auth/login

# Componente standalone (default en Angular 17+)
ng g c login

# Componente con módulo (viejo estilo)
ng g c login --standalone=false

# Componente inline (sin archivos separados)
ng g c navbar --inline-template --inline-style
ng g c navbar -t -s  # Alias corto

# Componente sin archivo de test
ng g c login --skip-tests

# Componente flat (sin carpeta propia)
ng g c login --flat

# Componente con OnPush change detection
ng g c client-list --change-detection=OnPush

# Componente con prefijo personalizado
ng g c login --prefix=sice
# Genera: <sice-login>
```

**Ejemplo completo:**
```bash
ng g c features/admin/clients/client-list --skip-tests --change-detection=OnPush

# Genera:
# features/admin/clients/client-list/
# ├── client-list.component.ts
# ├── client-list.component.html
# └── client-list.component.scss
```

---

### Servicios

```bash
# Servicio básico
ng generate service nombre
ng g s nombre

# Servicio en carpeta específica
ng g s core/services/auth

# Servicio sin test
ng g s auth --skip-tests

# Servicio flat (sin carpeta)
ng g s auth --flat

# Genera:
# core/services/
# └── auth.service.ts
```

---

### Guards

```bash
# Guard funcional (Angular 15+)
ng generate guard nombre
ng g guard auth

# Opciones de guard:
# ✓ CanActivate        (proteger ruta)
# ✓ CanActivateChild   (proteger hijos)
# ✓ CanDeactivate      (prevenir salida)
# ✓ CanMatch           (lazy loading condicional)

# Guard específico
ng g guard core/guards/auth --implements CanActivate

# Múltiples guards
ng g guard core/guards/auth --implements CanActivate CanDeactivate

# Genera:
# core/guards/
# └── auth.guard.ts
```

---

### Interceptors

```bash
# Interceptor funcional
ng generate interceptor nombre
ng g interceptor auth

# En carpeta específica
ng g interceptor core/interceptors/auth

# Genera:
# core/interceptors/
# └── auth.interceptor.ts
```

---

### Directivas

```bash
# Directiva
ng generate directive nombre
ng g d highlight

# Directiva standalone
ng g d shared/directives/highlight

# Genera:
# shared/directives/
# ├── highlight.directive.ts
# └── highlight.directive.spec.ts
```

---

### Pipes

```bash
# Pipe
ng generate pipe nombre
ng g pipe dateFormat

# Pipe standalone
ng g pipe shared/pipes/currency-format

# Genera:
# shared/pipes/
# ├── currency-format.pipe.ts
# └── currency-format.pipe.spec.ts
```

---

### Interfaces / Models

```bash
# Interface
ng generate interface nombre
ng g interface User

# En carpeta específica
ng g interface core/models/user

# Con tipo específico
ng g interface core/models/user --type=model
# Genera: user.model.ts (en lugar de user.ts)

# Genera:
# core/models/
# └── user.model.ts
```

---

### Enums

```bash
# Enum
ng generate enum nombre
ng g enum UserRole

# En carpeta
ng g enum core/models/user-role

# Genera:
# core/models/
# └── user-role.enum.ts
```

---

### Classes

```bash
# Class
ng generate class nombre
ng g class User

# En carpeta
ng g class core/models/user --type=model

# Genera:
# core/models/
# └── user.model.ts
```

---

### Environments

```bash
# Generar environment (si no existe)
ng generate environments

# Genera:
# src/environments/
# ├── environment.ts
# └── environment.development.ts
```

---

### Módulos (viejo estilo, Angular 16-)

```bash
# Módulo (solo si usas NgModules)
ng generate module nombre
ng g m admin

# Módulo con routing
ng g m admin --routing

# Genera:
# admin/
# ├── admin.module.ts
# └── admin-routing.module.ts
```

---

### Rutas

```bash
# No hay comando directo, pero puedes generar archivo
# Crear manualmente: app.routes.ts
```

---

## 🏃 Desarrollo (ng serve)

### Iniciar servidor de desarrollo

```bash
# Básico (puerto 4200)
ng serve

# Con auto-open en navegador
ng serve --open
ng serve -o

# Puerto personalizado
ng serve --port 4300
ng serve -p 4300

# Host personalizado (accesible desde red)
ng serve --host 0.0.0.0
# Ahora puedes acceder desde: http://192.168.x.x:4200

# Con configuración específica
ng serve --configuration development
ng serve --configuration staging
ng serve --configuration production

# Con proxy (evitar CORS en desarrollo)
ng serve --proxy-config proxy.conf.json

# Sin live reload
ng serve --live-reload=false

# Sin abrir automáticamente
ng serve --no-open

# Con SSL
ng serve --ssl
ng serve --ssl --ssl-cert path/to/cert.pem --ssl-key path/to/key.pem

# Modo verbose (más logs)
ng serve --verbose

# Con poll (útil en Docker/VM)
ng serve --poll 2000
```

**Ejemplo completo:**
```bash
# Desarrollo con proxy y auto-open
ng serve --open --proxy-config proxy.conf.json

# Staging en puerto 4300
ng serve --configuration staging --port 4300 --open

# Producción local (para probar)
ng serve --configuration production
```

---

## 🔨 Build (ng build)

### Compilar el proyecto

```bash
# Build básico (development)
ng build

# Build de producción
ng build --configuration production
ng build --prod  # Alias (deprecated)

# Build de staging
ng build --configuration staging

# Output path personalizado
ng build --output-path dist/mi-app

# Base href (para subdirectorios)
ng build --base-href /mi-app/

# Build con source maps (para debug en producción)
ng build --configuration production --source-map

# Build sin optimización (más rápido, para testing)
ng build --optimization=false

# Build con stats (para análisis)
ng build --stats-json

# Watch mode (recompila al cambiar archivos)
ng build --watch
ng build -w
```

**Ejemplo completo:**
```bash
# Build de producción con stats para análisis
ng build --configuration production --stats-json

# Build de staging con source maps
ng build --configuration staging --source-map
```

---

## 🧪 Testing (ng test)

### Ejecutar tests unitarios

```bash
# Ejecutar tests (con watch)
ng test

# Ejecutar tests una vez (sin watch)
ng test --watch=false
ng test --no-watch

# Con code coverage
ng test --code-coverage
ng test --no-watch --code-coverage

# Navegador específico
ng test --browsers=Chrome
ng test --browsers=ChromeHeadless  # Para CI/CD

# Tests específicos
ng test --include='**/*.component.spec.ts'
```

---

### Ejecutar tests E2E

```bash
# E2E con Cypress (si está configurado)
ng e2e

# E2E específico
ng e2e --configuration production
```

---

## 📊 Análisis y Optimización

### Analizar bundle size

```bash
# Generar stats.json
ng build --configuration production --stats-json

# Luego usar webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/sice-frontend/stats.json
```

---

### Lint (verificar código)

```bash
# Ejecutar linter
ng lint

# Lint con auto-fix
ng lint --fix

# Lint de archivos específicos
ng lint --files='src/app/**/*.ts'
```

---

### Extract i18n (internacionalización)

```bash
# Extraer traducciones
ng extract-i18n

# Output personalizado
ng extract-i18n --output-path src/locale

# Formato específico
ng extract-i18n --format xlf2
```

---

## 🔄 Actualización (ng update)

### Actualizar Angular y dependencias

```bash
# Ver qué se puede actualizar
ng update

# Actualizar Angular CLI y Core
ng update @angular/cli @angular/core

# Actualizar a versión específica
ng update @angular/cli@20 @angular/core@20

# Actualizar todo lo posible
ng update --all

# Actualizar con migraciones
ng update @angular/core --migrate-only

# Forzar actualización (usar con cuidado)
ng update @angular/cli @angular/core --force

# Ver siguiente versión disponible
ng update --next
```

**Flujo recomendado:**
```bash
# 1. Ver qué hay para actualizar
ng update

# 2. Actualizar CLI y Core
ng update @angular/cli @angular/core

# 3. Actualizar Material (si lo usas)
ng update @angular/material

# 4. Verificar que todo funcione
ng serve
ng test
ng build --configuration production
```

---

## ⚙️ Configuración (ng config)

### Ver y modificar configuración

```bash
# Ver toda la configuración
ng config

# Ver configuración específica
ng config projects.sice-frontend.architect.build.options.outputPath

# Cambiar configuración
ng config projects.sice-frontend.architect.build.options.outputPath "dist/my-app"

# Ver configuración global
ng config --global

# Cambiar package manager
ng config --global cli.packageManager npm
ng config --global cli.packageManager yarn
ng config --global cli.packageManager pnpm
```

---

## 🚀 Comandos Avanzados

### Agregar librería

```bash
# Agregar Angular Material
ng add @angular/material

# Agregar Bootstrap
ng add @ng-bootstrap/ng-bootstrap

# Agregar PWA
ng add @angular/pwa

# Agregar Service Worker
ng add @angular/service-worker

# Agregar Firebase
ng add @angular/fire

# Agregar Tailwind CSS
ng add @angular/tailwind
```

---

### Deploy

```bash
# Deploy a GitHub Pages
ng add angular-cli-ghpages
ng deploy

# Deploy a Firebase
ng add @angular/fire
ng deploy
```

---

### Generar múltiples archivos

```bash
# Generar feature completo (componente + servicio + routing)
ng g c features/admin/clients/client-list
ng g s features/admin/clients/client
ng g guard features/admin/clients/client
```

---

### Cache

```bash
# Limpiar cache de Angular CLI
ng cache clean

# Ver info de cache
ng cache info

# Habilitar/deshabilitar cache
ng cache enable
ng cache disable
```

---

### Completions (autocompletado)

```bash
# Habilitar autocompletado en la terminal
ng completion

# Luego seguir las instrucciones según tu shell (bash/zsh/fish)
```

---

## 🎯 Atajos y Aliases

### Tabla de Aliases

| Comando Completo | Alias | Ejemplo |
|-----------------|-------|---------|
| `ng generate` | `ng g` | `ng g c login` |
| `ng generate component` | `ng g c` | `ng g c navbar` |
| `ng generate service` | `ng g s` | `ng g s auth` |
| `ng generate directive` | `ng g d` | `ng g d highlight` |
| `ng generate guard` | `ng g guard` | `ng g guard auth` |
| `ng generate pipe` | `ng g p` | `ng g p currency` |
| `ng generate interface` | `ng g i` | `ng g i User` |
| `ng generate class` | `ng g cl` | `ng g cl User` |
| `ng generate enum` | `ng g e` | `ng g e UserRole` |
| `ng serve --open` | `ng s -o` | `ng s -o` |
| `ng build` | `ng b` | `ng b --prod` |
| `ng test` | `ng t` | `ng t --no-watch` |

---

## 📦 Comandos por Flujo de Trabajo

### Flujo: Crear Nuevo Feature

```bash
# 1. Crear estructura de carpetas y componentes
ng g c features/admin/clients/client-list --skip-tests
ng g c features/admin/clients/client-form --skip-tests
ng g c features/admin/clients/client-detail --skip-tests

# 2. Crear servicio
ng g s features/admin/clients/client --skip-tests

# 3. Crear modelos
ng g i core/models/client --type=model

# 4. Crear guard si es necesario
ng g guard core/guards/admin --implements CanActivate
```

---

### Flujo: Preparar para Producción

```bash
# 1. Limpiar cache
ng cache clean

# 2. Lint y fix
ng lint --fix

# 3. Ejecutar tests
ng test --no-watch --code-coverage

# 4. Build de producción con stats
ng build --configuration production --stats-json

# 5. Analizar bundle
npx webpack-bundle-analyzer dist/sice-frontend/stats.json

# 6. Verificar tamaño
ls -lh dist/sice-frontend/
```

---

### Flujo: Debugging

```bash
# 1. Servir con source maps
ng serve --source-map

# 2. Build con source maps
ng build --source-map

# 3. Verbose mode
ng serve --verbose

# 4. Ver configuración
ng config
```

---

## 🔥 Comandos Más Usados en el Día a Día

### Top 10 comandos

```bash
# 1. Iniciar desarrollo
ng serve --open

# 2. Generar componente
ng g c nombre

# 3. Generar servicio
ng g s nombre

# 4. Build de producción
ng build --configuration production

# 5. Ejecutar tests
ng test --no-watch

# 6. Ver versión
ng version

# 7. Actualizar Angular
ng update @angular/cli @angular/core

# 8. Generar guard
ng g guard auth

# 9. Lint
ng lint --fix

# 10. Limpiar cache
ng cache clean
```

---

## 🎨 Ejemplos Prácticos Completos

### Ejemplo 1: Crear Feature "Clientes"

```bash
# Estructura completa
ng g c features/admin/clients/client-list --skip-tests
ng g c features/admin/clients/client-form --skip-tests
ng g c features/admin/clients/client-detail --skip-tests
ng g s core/services/client --skip-tests
ng g i core/models/client --type=model
ng g guard core/guards/admin --implements CanActivate

# Resultado:
# features/admin/clients/
# ├── client-list/
# ├── client-form/
# └── client-detail/
# core/services/
# └── client.service.ts
# core/models/
# └── client.model.ts
# core/guards/
# └── admin.guard.ts
```

---

### Ejemplo 2: Shared Components

```bash
# Componentes reutilizables
ng g c shared/components/navbar --skip-tests
ng g c shared/components/sidebar --skip-tests
ng g c shared/components/modal --skip-tests
ng g c shared/components/button --skip-tests

# Pipes personalizados
ng g p shared/pipes/date-format --skip-tests
ng g p shared/pipes/currency-format --skip-tests

# Directivas
ng g d shared/directives/highlight --skip-tests
ng g d shared/directives/tooltip --skip-tests
```

---

### Ejemplo 3: Setup Completo de Auth

```bash
# Componentes
ng g c features/auth/login --skip-tests
ng g c features/auth/signup --skip-tests
ng g c features/auth/password-reset --skip-tests

# Servicio
ng g s core/services/auth --skip-tests

# Guards
ng g guard core/guards/auth --implements CanActivate
ng g guard core/guards/role --implements CanActivate

# Interceptor
ng g interceptor core/interceptors/auth

# Models
ng g i core/models/user --type=model
ng g i core/models/login-request --type=model
ng g i core/models/login-response --type=model
```

---

## 🛠️ Opciones Globales

Estas opciones funcionan con la mayoría de comandos:

```bash
--dry-run          # Simular sin crear archivos
--force            # Forzar sobrescritura
--skip-tests       # No generar archivos .spec.ts
--skip-import      # No importar en módulo
--project          # Proyecto específico (monorepo)
--verbose          # Más información en consola
--help             # Ayuda del comando
```

**Ejemplo con dry-run:**
```bash
# Ver qué se generaría sin crear archivos
ng g c login --dry-run

# Output:
# CREATE src/app/login/login.component.scss (0 bytes)
# CREATE src/app/login/login.component.html (20 bytes)
# CREATE src/app/login/login.component.spec.ts (577 bytes)
# CREATE src/app/login/login.component.ts (213 bytes)
# NOTE: The "--dry-run" option means no changes were made.
```

---

## 📚 Recursos y Referencias

### Documentación Oficial
- **Angular CLI**: https://angular.dev/cli
- **Schematics**: https://angular.dev/tools/cli/schematics

### Comandos de Ayuda
```bash
# Lista completa de comandos
ng help

# Ayuda de generación
ng generate --help

# Ver opciones de componente
ng generate component --help
```

---

## 🎯 Cheat Sheet Rápido

```bash
# NUEVO PROYECTO
ng new mi-app --routing --style=scss

# DESARROLLO
ng serve -o                           # Iniciar con auto-open
ng serve --port 4300                  # Puerto personalizado

# GENERAR CÓDIGO
ng g c nombre                         # Componente
ng g s nombre                         # Servicio
ng g guard nombre                     # Guard
ng g interceptor nombre               # Interceptor
ng g i nombre --type=model            # Interface/Model
ng g p nombre                         # Pipe
ng g d nombre                         # Directiva

# BUILD
ng build --configuration production   # Build producción
ng build --stats-json                 # Con estadísticas

# TESTING
ng test --no-watch                    # Tests una vez
ng test --code-coverage               # Con coverage

# ACTUALIZACIÓN
ng update                             # Ver actualizaciones
ng update @angular/cli @angular/core  # Actualizar Angular

# UTILIDADES
ng version                            # Ver versión
ng lint --fix                         # Lint con auto-fix
ng cache clean                        # Limpiar cache
```

---

## ✅ Tips y Mejores Prácticas

### 1. Usar --dry-run antes de generar
```bash
# Siempre verifica primero
ng g c login --dry-run
# Si está bien, ejecuta sin --dry-run
ng g c login
```

### 2. Usar --skip-tests en desarrollo rápido
```bash
# Genera sin archivos de test (créalos después)
ng g c login --skip-tests
```

### 3. Usar alias para velocidad
```bash
# En lugar de:
ng generate component features/admin/login

# Usa:
ng g c features/admin/login
```

### 4. Aprovechar tab-completion
```bash
# Instala completions
ng completion

# Ahora puedes usar Tab para autocompletar
ng g c fea<TAB>  # Autocompleta features/
```

### 5. Guardar configuraciones frecuentes
```bash
# En package.json
{
  "scripts": {
    "start": "ng serve --open",
    "start:staging": "ng serve --configuration staging --open",
    "build:prod": "ng build --configuration production",
    "test:ci": "ng test --no-watch --code-coverage --browsers=ChromeHeadless"
  }
}

# Luego ejecuta:
npm run start
npm run build:prod
```

---

**¡Listo para empezar!** 🚀

Este es tu arsenal completo de comandos Angular CLI. Guarda este archivo como referencia rápida.
