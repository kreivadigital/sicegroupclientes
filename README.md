# Siceweb

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.7.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Git Commit Guidelines

Este proyecto sigue la especificación [Conventional Commits](https://www.conventionalcommits.org/) para mensajes de commit claros y consistentes.

### Formato de Commit

```
<tipo>(<scope>): <descripción corta>

**What:**
- Qué cambios se realizaron

**Why:**
- Por qué se hicieron estos cambios

**Solution:**
- Cómo se implementó la solución
```

### Tipos de Commits

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `feat` | Nueva funcionalidad | `feat(auth): agregar sistema de login con JWT` |
| `fix` | Corrección de bug | `fix(sidebar): corregir error de navegación` |
| `docs` | Documentación | `docs(readme): actualizar guía de instalación` |
| `style` | Formato/estilo (no afecta código) | `style(header): ajustar espaciado y colores` |
| `refactor` | Refactorización de código | `refactor(auth): simplificar validación de tokens` |
| `perf` | Mejoras de rendimiento | `perf(dashboard): optimizar carga de datos` |
| `test` | Agregar o corregir tests | `test(auth): agregar tests unitarios de login` |
| `chore` | Mantenimiento/tareas | `chore(deps): actualizar Angular a v20` |
| `ci` | Cambios en CI/CD | `ci(github): agregar workflow de deploy` |
| `build` | Cambios en build | `build(webpack): optimizar configuración` |

### Scopes Comunes del Proyecto

| Scope | Descripción |
|-------|-------------|
| `auth` | Sistema de autenticación |
| `sidebar` | Componente sidebar |
| `header` | Componente header |
| `layout` | Componentes de layout (MainLayout, AuthLayout) |
| `routes` | Configuración de rutas |
| `dashboard` | Página dashboard |
| `ordenes` | Módulo de órdenes |
| `clientes` | Módulo de clientes |
| `contenedores` | Módulo de contenedores |
| `config` | Archivos de configuración |
| `global` | Estilos o funcionalidad global |

### Ejemplos de Buenos Commits

#### Ejemplo 1: Nueva Funcionalidad
```
feat(header): implementar header dinámico con signals reactivos

**What:**
- Componente Header que cambia automáticamente según rol y ruta actual
- Estilos diferentes para Admin (gradiente verde) y Cliente (fondo blanco)

**Why:**
- Mejorar UX mostrando información contextual relevante
- Distinguir visualmente entre roles de usuario

**Solution:**
- toSignal() convierte router.events en signal reactivo
- computed() recalcula headerData cuando cambia ruta o usuario
- Gradiente verde (#02661E → #01300E) para admin
```

#### Ejemplo 2: Corrección de Bug
```
fix(auth): corregir validación de token expirado

**What:**
- El sistema no detectaba tokens JWT expirados correctamente

**Why:**
- Usuarios podían acceder con tokens vencidos
- Problema de seguridad crítico

**Solution:**
- Implementar validación de exp claim en jwtDecode
- Agregar computed signal isAuthenticated que verifica expiración
- Redirigir a login si token está expirado
```

#### Ejemplo 3: Refactorización
```
refactor(layout): eliminar layouts específicos obsoletos

**What:**
- Eliminados AdminLayout y ClientLayout

**Why:**
- Duplicación de código: ambos layouts eran casi idénticos
- Violaba principio DRY (Don't Repeat Yourself)

**Solution:**
- MainLayout unificado que sirve ambos roles
- Diferenciación por signals en lugar de componentes separados
```

### Reglas Importantes

1. **Primera línea**: Máximo 72 caracteres
2. **Tipo y scope**: Siempre en minúsculas
3. **Descripción**: Comienza con verbo en infinitivo
4. **Body**: Opcional pero recomendado para cambios importantes
5. **Breaking changes**: Usar `BREAKING CHANGE:` en el footer

### Herramientas

Para commits interactivos, puedes usar:
```bash
git add <archivo>
git commit
# Se abre el editor para escribir el mensaje completo
```

### Referencias

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Semantic Versioning](https://semver.org/)

---

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
