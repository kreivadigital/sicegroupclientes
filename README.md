# 🎯 Sice Group Clientes - Frontend (Angular)

Dashboard web para gestión de clientes y órdenes en el sistema Sice Group.

**Tecnología**: Angular 20.3.7 | TypeScript 5.9 | Bootstrap 5.3 | SCSS

---

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Requisitos Previos](#requisitos-previos)
- [Instalación Local](#instalación-local)
- [Desarrollo](#desarrollo)
- [Scripts Disponibles](#scripts-disponibles)
- [Build y Deployment](#build-y-deployment)
- [Deploy a Servidor (SSH/FTP)](#deploy-a-servidor-sshftp)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Commits y Versioning](#commits-y-versioning)
- [Troubleshooting](#troubleshooting)

---

## 📖 Descripción General

**Siceweb** es una aplicación Angular 20 con arquitectura standalone components que permite:

- ✅ Autenticación por JWT
- ✅ Dashboard diferenciado por roles (Admin/Cliente)
- ✅ Lazy loading de módulos
- ✅ Server-Side Rendering (SSR) con Express
- ✅ Build optimizado para 3 ambientes (desarrollo, staging, producción)

### Stack Técnico

| Componente | Versión |
|-----------|---------|
| **Angular** | 20.3.7 |
| **Node.js** | 18+ (recomendado) |
| **TypeScript** | 5.9.2 |
| **Bootstrap** | 5.3.8 |
| **JWT** | jwt-decode 4.0.0 |
| **HTTP Client** | RxJS 7.8.0 |

---

## ✅ Requisitos Previos

### Local (Desarrollo)
```bash
# Node.js 18+ con npm 9+
node --version    # v18.0.0+
npm --version     # 9.0.0+

# Angular CLI
npm install -g @angular/cli@20.3.7
```

### Servidor Production/Staging
```
- Node.js 18+ LTS
- npm o yarn
- Espacio disco: 500MB mínimo
- Puerto 4200 (desarrollo) o 3000+ (producción)
```

---

## 🚀 Instalación Local

### 1. Clonar repositorio

```bash
git clone https://github.com/kreivadigital/sicegroupclientes.git
cd sicegroupclientes
git checkout develop  # rama de desarrollo
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
# No necesita .env en cliente Angular
# Las variables están en src/environments/environment*.ts
```

### 4. Verificar instalación

```bash
npm start
# Abre http://localhost:4200
```

---

## 💻 Desarrollo

### Servidor de Desarrollo

```bash
npm start
```

**Comportamiento**:
- 🔄 Auto-reload en cambios de código
- 🗺️ Source maps incluidos
- 🐛 Debugging activado
- 📍 URL: http://localhost:4200

### Generar componentes, servicios y más

```bash
# Generar componente
ng generate component features/auth/login
ng g c features/auth/login

# Generar servicio
ng generate service core/services/auth
ng g s core/services/auth

# Generar guardia
ng generate guard core/guards/auth
ng g g core/guards/auth

# Generar directiva, pipe, interfaz, enum
ng g d shared/custom-directive
ng g p shared/custom-pipe
ng g i core/interfaces/user
ng g e core/models/user-role
```

### Debugging en navegador

```typescript
// En componente o servicio
console.log('Debug:', variable);

// Con DevTools de Chrome
// F12 → Sources → Breakpoints
// (funciona gracias a source maps en desarrollo)
```

### Testing

```bash
# Ejecutar tests unitarios
npm test

# Tests en modo watch
ng test --watch=true

# Ver cobertura
ng test --code-coverage
# Resultado en: coverage/
```

---

## 📦 Scripts Disponibles

### Desarrollo

| Script | Comando | Descripción |
|--------|---------|-------------|
| **start** | `npm start` | Dev server local (4200) |
| **watch** | `npm run watch` | Build incremental con live reload |
| **test** | `npm test` | Tests unitarios (Karma + Jasmine) |

### Build para diferentes ambientes

| Script | Comando | Para qué | API |
|--------|---------|----------|-----|
| **build** | `npm run build` | Producción (default) | prod |
| **build:staging** | `npm run build:staging` | Pre-producción con source maps | staging |
| **build:prod** | `npm run build:prod` | Producción optimizado | prod |

### Utilidades

| Script | Comando | Descripción |
|--------|---------|-------------|
| **sync:enums** | `npm run sync:enums` | Sincronizar enums con backend Laravel |

---

## 🏗️ Build y Deployment

### 1. Build para Staging

```bash
npm run build:staging
```

**Características**:
- ✅ Optimización habilitada
- ✅ Source maps incluidos (debugging)
- ✅ API: `https://api.sicegroup.com.uy/api`
- ✅ App Name: "Sice Group Dashboard [STAGING]"

### 2. Build para Producción

```bash
npm run build:prod
```

**Características**:
- ✅ Tree-shaking completo
- ✅ Minificación y compresión
- ✅ Sin source maps (seguridad)
- ✅ API: `https://api.sicegroup.com/api`
- ✅ Bundle budgets: 800KB inicial

### 3. Verificar Build

```bash
# Después de build
ls -la dist/siceweb/browser/

# Ver tamaño de archivos
du -sh dist/siceweb/browser/*
```

---

## 🌐 Deploy a Servidor (SSH/FTP)

### Opción A: Deploy via SSH (Recomendado)

#### Paso 1: Build localmente

```bash
npm run build:prod
```

#### Paso 2: Conectar a servidor via SSH

```bash
# SSH básico
ssh usuario@dominio.com

# Con puerto custom
ssh -p 2222 usuario@dominio.com

# Con clave .pem
ssh -i ~/.ssh/tu_llave.pem usuario@dominio.com
```

#### Paso 3: Preparar carpeta en servidor

```bash
# En el servidor
mkdir -p /var/www/sicegroupclientes

# Asignar permisos
sudo chown -R usuario:www-data /var/www/sicegroupclientes
sudo chmod -R 755 /var/www/sicegroupclientes
```

#### Paso 4: Subir archivos con SCP

```bash
# Desde tu máquina local - Subir build
scp -r dist/siceweb/browser/* usuario@dominio.com:/var/www/sicegroupclientes/

# Con puerto custom
scp -P 2222 -r dist/siceweb/browser/* usuario@dominio.com:/var/www/sicegroupclientes/

# Con clave .pem
scp -i ~/.ssh/tu_llave.pem -r dist/siceweb/browser/* usuario@dominio.com:/var/www/sicegroupclientes/
```

#### Paso 5: Configurar servidor web

**Nginx**:

```bash
sudo nano /etc/nginx/sites-available/sicegroupclientes
```

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;
    root /var/www/sicegroupclientes;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/javascript;

    # Cache para archivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Logs
    access_log /var/log/nginx/sicegroupclientes_access.log;
    error_log /var/log/nginx/sicegroupclientes_error.log;
}
```

```bash
# Activar
sudo ln -s /etc/nginx/sites-available/sicegroupclientes /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Apache**:

```bash
sudo nano /etc/apache2/sites-available/sicegroupclientes.conf
```

```apache
<VirtualHost *:80>
    ServerName tudominio.com
    ServerAlias www.tudominio.com
    DocumentRoot /var/www/sicegroupclientes

    <Directory /var/www/sicegroupclientes>
        AllowOverride All
        Require all granted
        
        <IfModule mod_rewrite.c>
            RewriteEngine On
            RewriteBase /
            RewriteCond %{REQUEST_FILENAME} !-f
            RewriteCond %{REQUEST_FILENAME} !-d
            RewriteRule . /index.html [L]
        </IfModule>
    </Directory>

    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/css application/javascript
    </IfModule>

    ErrorLog ${APACHE_LOG_DIR}/sicegroupclientes_error.log
    CustomLog ${APACHE_LOG_DIR}/sicegroupclientes_access.log combined
</VirtualHost>
```

```bash
# Activar
sudo a2ensite sicegroupclientes
sudo a2enmod rewrite
sudo a2enmod deflate
sudo apache2ctl -t
sudo systemctl restart apache2
```

---

### Opción B: Deploy via FTP

#### Paso 1: Build localmente

```bash
npm run build:prod
```

#### Paso 2: Conectar via FTP

**Cliente gráfico** (FileZilla, Cyberduck):
```
Servidor: ftp.dominio.com o sftp.dominio.com
Usuario: tu_usuario_ftp
Contraseña: tu_contraseña
Puerto: 21 (FTP) o 22 (SFTP)
```

**Línea de comandos**:

```bash
# FTP
ftp ftp.dominio.com

# SFTP (más seguro)
sftp usuario@dominio.com
```

#### Paso 3: Subir archivos

```bash
# FTP
ftp> cd /public_html
ftp> binary
ftp> mput dist/siceweb/browser/*
ftp> quit

# SFTP
sftp> cd /public_html
sftp> put -r dist/siceweb/browser/*
sftp> exit
```

#### Paso 4: Crear .htaccess (Apache)

```bash
nano /public_html/.htaccess
```

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [QSA,L]
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "now"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
</IfModule>
```

---

## 📁 Estructura del Proyecto

```
sicegroupclientes/
├── src/
│   ├── app/
│   │   ├── core/           Lógica central
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── services/
│   │   │   └── models/
│   │   ├── features/       Módulos
│   │   │   ├── auth/
│   │   │   ├── admin/
│   │   │   └── client/
│   │   ├── layouts/
│   │   └── shared/
│   ├── environments/       Config por ambiente
│   ├── assets/
│   └── styles.scss
├── dist/                   Output build
├── angular.json
├── package.json
└── README.md
```

---

## 📝 Commits y Versioning

Sigue **Conventional Commits**:

```
<tipo>(<scope>): <descripción corta>

**What:**
- Qué cambios se realizaron

**Why:**
- Por qué se hicieron
```

### Tipos comunes

| Tipo | Descripción |
|------|-------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Documentación |
| `style` | Estilos/formato |
| `refactor` | Refactorización |
| `perf` | Mejora de rendimiento |
| `test` | Tests |
| `chore` | Mantenimiento |

### Scopes

```
auth, sidebar, header, layout, routes, dashboard, ordenes, 
clientes, contenedores, config, global, shared, core
```

---

## 🔒 Configuración por Ambiente

### Desarrollo

```typescript
// src/environments/environment.ts
export const environment = {
    production: false,
    apiBase: 'http://localhost:8000/api',
    appName: 'Sice Group Dashboard',
};
```

### Staging

```typescript
// src/environments/environment.staging.ts
export const environment = {
    production: false,
    apiBase: 'https://api.sicegroup.com.uy/api',
    appName: 'Sice Group Dashboard [STAGING]',
};
```

### Producción

```typescript
// src/environments/environment.prod.ts
export const environment = {
    production: true,
    apiBase: 'https://api.sicegroup.com/api',
    appName: 'Sice Group Dashboard',
};
```

---

## 🐛 Troubleshooting

### Port 4200 en uso

```bash
# Linux/Mac
lsof -i :4200
kill -9 <PID>

# Otro puerto
ng serve --port 4201
```

### Página en blanco después del deploy

1. Verificar que `index.html` exista en el servidor
2. Verificar permisos (755 o similar)
3. Revisar logs del servidor (Nginx/Apache)
4. Verificar console del navegador (F12)

### Build lento

```bash
NODE_OPTIONS=--max_old_space_size=4096 npm run build:prod
```

### Error de CORS

Contactar al backend para agregar el dominio a CORS whitelist.

---

## 🔗 Integración con Backend

Este frontend se comunica con **siceapi** (Laravel):

- 📍 Repositorio: `kreivadigital/siceapi`
- 🔐 Autenticación: JWT Token
- 🔄 Sincronizar enums: `npm run sync:enums`

---

## 📚 Recursos

- [Angular 20 Docs](https://angular.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Bootstrap 5 Docs](https://getbootstrap.com/docs/5.3/)
- [RxJS Documentation](https://rxjs.dev/)

---

**Última actualización**: 2026-06-22  
**Versión**: 1.0.0  
**Maintainers**: Equipo SICE Group
