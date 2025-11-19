# ShipsGo API v2 - Ocean Shipments
## Análisis Completo e Implementación en SICE App

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Descripción General de la API](#descripción-general-de-la-api)
3. [Autenticación](#autenticación)
4. [Endpoints Disponibles](#endpoints-disponibles)
5. [Estructura de Datos](#estructura-de-datos)
6. [Flujo de Implementación](#flujo-de-implementación)
7. [Diagramas de Integración](#diagramas-de-integración)
8. [Casos de Uso](#casos-de-uso)
9. [Consideraciones Técnicas](#consideraciones-técnicas)
10. [Recomendaciones](#recomendaciones)

---

## 🎯 Resumen Ejecutivo

ShipsGo API v2 (experimental) proporciona un sistema completo para rastrear envíos marítimos (ocean shipments) en tiempo real. La API permite:

- ✅ **Crear y gestionar envíos** con información de contenedores y bookings
- ✅ **Rastreo automático** periódico del estado de los envíos
- ✅ **Notificaciones en tiempo real** mediante webhooks
- ✅ **Sistema de seguidores** para notificar a múltiples stakeholders
- ✅ **Etiquetado y clasificación** de envíos
- ✅ **Filtrado avanzado** con múltiples operadores

**Modelo de negocio**: Sistema basado en créditos. Cada envío creado consume créditos de la cuenta.

---

## 📖 Descripción General de la API

### ¿Cómo Funciona?

```
1. CREAR ENVÍO
   ↓
2. SHIPSGO RASTREA AUTOMÁTICAMENTE
   ↓
3. ACTUALIZACIONES PERIÓDICAS
   ↓
4. NOTIFICACIONES (Email/Webhooks)
   ↓
5. CONSULTA DE DETALLES EN CUALQUIER MOMENTO
```

### Características Principales

| Característica | Descripción |
|----------------|-------------|
| **Rastreo Automático** | Una vez creado el envío, ShipsGo lo rastrea periódicamente sin intervención manual |
| **Prevención de Duplicados** | Sistema inteligente que previene crear envíos duplicados basado en `reference`, `booking_number` o `container_number` |
| **Manejo de Concurrencia** | Procesamiento secuencial de requests para prevenir race conditions |
| **Sistema de Créditos** | Modelo de pago por uso - cada envío nuevo consume créditos |
| **Notificaciones Multi-canal** | Email y webhooks para actualizaciones en tiempo real |

---

## 🔐 Autenticación

### Método de Autenticación

**Tipo**: API Token (Bearer Token)

**Header requerido**:
```
X-Shipsgo-User-Token: YOUR_SECRET_TOKEN
```

### Ejemplo de Request Autenticado

```bash
curl https://api.shipsgo.com/v2/ocean/shipments \
  --header 'X-Shipsgo-User-Token: YOUR_SECRET_TOKEN'
```

### ⚠️ Importante

- El token debe mantenerse **secreto** y **seguro**
- Nunca exponer el token en el frontend
- Todas las requests deben hacerse desde el **backend**
- Considerar almacenar el token en variables de entorno

---

## 🛠 Endpoints Disponibles

### 1️⃣ Crear un Envío

**Endpoint**: `POST /ocean/shipments`

**Descripción**: Crea un nuevo envío para rastreo automático.

#### Request Body

```json
{
  "reference": "INTERNAL_UNIQUE_IDENTIFIER",      // Tu referencia interna (5-128 chars)
  "container_number": "MSCU1234567",              // Formato: AAAU7777777
  "booking_number": "MEDUQY000000",               // Formato: alfanumérico con / y -
  "carrier": "MSCU",                              // SCAC code (4 chars)
  "followers": [                                  // Max 10 emails
    "customer-1@example.com",
    "customer-2@example.com"
  ],
  "tags": [                                       // Max 10 tags
    "IMPORT",
    "CUSTOMER_ABC"
  ]
}
```

#### Validaciones

| Campo | Requerido | Formato | Notas |
|-------|-----------|---------|-------|
| `reference` | ❌ | String (5-128) | Recomendado para evitar duplicados |
| `container_number` | ⚠️ | `^[A-Z]{4}[0-9]{7}$` | Requerido si no hay `booking_number` |
| `booking_number` | ⚠️ | `^[a-zA-Z0-9/-]+$` | Requerido si no hay `container_number` |
| `carrier` | ❌ | `^(SG_)?[A-Z0-9]{4}$` | SCAC code del carrier |
| `followers` | ❌ | Array[String] | Emails para notificaciones |
| `tags` | ❌ | Array[String] | Etiquetas para clasificación |

#### Respuestas

**✅ 200 - Success**
```json
{
  "message": "SUCCESS",
  "shipment": {
    "id": 123456,
    "reference": "INTERNAL_UNIQUE_IDENTIFIER",
    "container_number": "MSCU1234567",
    "booking_number": "MEDUQY000000"
  }
}
```

**💳 402 - Insufficient Credits**
```json
{
  "message": "Company does not have enough credits"
}
```

**⚠️ 409 - Already Exists**
```json
{
  "message": "Shipment has already been created",
  "shipment": {
    "id": 123456,
    "reference": "INTERNAL_UNIQUE_IDENTIFIER",
    "container_number": "MSCU1234567",
    "booking_number": "MEDUQY000000"
  }
}
```

#### Lógica de Duplicados

```
┌─────────────────────────────────────────────────────────┐
│ ¿Se proporcionó "reference"?                            │
└─────────────────┬───────────────────────────────────────┘
                  │ SÍ
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Verificar si existe shipment con mismo reference        │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ├─→ [EXISTE] → 409 Already Exists
                  │
                  └─→ [NO EXISTE]
                      ↓
┌─────────────────────────────────────────────────────────┐
│ ¿Se proporcionó "booking_number"?                       │
└─────────────────┬───────────────────────────────────────┘
                  │ SÍ
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Verificar duplicate con booking_number                  │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ├─→ [EXISTE] → 409 Already Exists
                  │
                  └─→ [NO EXISTE] → Crear Shipment


┌─────────────────────────────────────────────────────────┐
│ Si solo hay "container_number", verificar con ese       │
└─────────────────────────────────────────────────────────┘
```

---

### 2️⃣ Listar Envíos

**Endpoint**: `GET /ocean/shipments`

**Descripción**: Obtiene una lista de envíos con filtrado avanzado y paginación.

#### Query Parameters

##### Paginación

```
?skip=0&take=25
```

| Parámetro | Tipo | Default | Min | Max | Descripción |
|-----------|------|---------|-----|-----|-------------|
| `skip` | integer | 0 | 0 | - | Cantidad de registros a saltar |
| `take` | integer | 25 | 1 | 100 | Cantidad de registros a retornar |

##### Ordenamiento

```
?order_by=date_of_discharge,asc
```

**Campos disponibles**: `id`, `status`, `date_of_loading`, `date_of_discharge`, `created_at`, `updated_at`, `checked_at`

**Direcciones**: `asc`, `desc`

##### Filtros

**Estructura**: `filters[field]=operator:value(s)`

**Operadores Disponibles**:

| Operador | Descripción | Ejemplo |
|----------|-------------|---------|
| `eq` | Igual a | `filters[status]=eq:SAILING` |
| `not_eq` | Diferente de | `filters[status]=not_eq:DISCHARGED` |
| `in` | En lista | `filters[carrier]=in:MSCU,OOLU` |
| `not_in` | No en lista | `filters[carrier]=not_in:CMDU` |
| `contains` | Contiene texto | `filters[reference]=contains:ABC` |
| `not_contains` | No contiene | `filters[reference]=not_contains:TEST` |
| `gt` | Mayor que | `filters[date_of_loading]=gt:2024-09-01` |
| `gte` | Mayor o igual | `filters[date_of_loading]=gte:2024-09-01` |
| `lt` | Menor que | `filters[date_of_loading]=lt:2024-10-01` |
| `lte` | Menor o igual | `filters[date_of_loading]=lte:2024-10-01` |
| `between` | Entre valores | `filters[date_of_loading]=between:2024-09-01...2024-10-01` |
| `with` | Contiene elemento | `filters[tags]=with:IMPORT` |
| `without` | No contiene | `filters[tags]=without:EXPORT` |

**Campos Filtrables**:

| Campo | Operadores | Descripción |
|-------|------------|-------------|
| `id` | `eq` | ID único del envío |
| `status` | `eq`, `not_eq`, `in`, `not_in` | Estado del envío |
| `carrier` | `eq`, `not_eq`, `in`, `not_in` | SCAC code del carrier |
| `container_number` | `eq` | Número de contenedor |
| `booking_number` | `eq` | Número de booking |
| `reference` | `eq`, `contains`, `not_contains` | Referencia personalizada |
| `port_of_loading` | `eq`, `not_eq`, `in`, `not_in` | Puerto de carga |
| `date_of_loading` | `eq`, `gt`, `gte`, `lt`, `lte`, `between` | Fecha de carga |
| `port_of_loading_country` | `eq`, `not_eq`, `in`, `not_in` | País de carga (código 2 letras) |
| `port_of_discharge` | `eq`, `not_eq`, `in`, `not_in` | Puerto de descarga |
| `date_of_discharge` | `eq`, `gt`, `gte`, `lt`, `lte`, `between` | Fecha de descarga |
| `port_of_discharge_country` | `eq`, `not_eq`, `in`, `not_in` | País de descarga |
| `followers` | `with`, `without` | Emails de seguidores |
| `tags` | `with`, `without` | Etiquetas |
| `creator` | `eq`, `not_eq`, `in`, `not_in` | Email del creador |
| `created_at` | `eq`, `gt`, `gte`, `lt`, `lte`, `between` | Fecha de creación |
| `updated_at` | `eq`, `gt`, `gte`, `lt`, `lte`, `between` | Fecha de actualización |
| `checked_at` | `eq`, `gt`, `gte`, `lt`, `lte`, `between` | Última verificación |
| `discarded_at` | `eq`, `gt`, `gte`, `lt`, `lte`, `between` | Fecha de descarte |

#### Estados de Envío

```
NEW → INPROGRESS → BOOKED → LOADED → SAILING → ARRIVED → DISCHARGED
                                                              ↓
                                                         UNTRACKED
```

| Estado | Descripción |
|--------|-------------|
| `NEW` | Envío recién creado |
| `INPROGRESS` | En proceso de verificación |
| `BOOKED` | Booking confirmado |
| `LOADED` | Cargado en el barco |
| `SAILING` | En tránsito marítimo |
| `ARRIVED` | Llegado al puerto destino |
| `DISCHARGED` | Descargado del barco |
| `UNTRACKED` | No se puede rastrear |

#### Ejemplos de Queries

**Ejemplo 1**: Envíos en tránsito de MSC u OOCL
```
/ocean/shipments?filters[status]=eq:SAILING&filters[carrier]=in:MSCU,OOLU&order_by=date_of_discharge,asc
```

**Ejemplo 2**: Envíos desde India en septiembre 2024
```
/ocean/shipments?filters[port_of_loading_country]=eq:IN&filters[date_of_loading]=between:2024-09-01...2024-10-01&order_by=date_of_loading,asc
```

**Ejemplo 3**: Envíos etiquetados como COMPANY_ABC
```
/ocean/shipments?filters[tags]=with:COMPANY_ABC
```

#### Respuesta

```json
{
  "message": "SUCCESS",
  "shipments": [
    {
      "id": 1001,
      "reference": null,
      "booking_number": "NBI7777777VC",
      "container_number": "APZU7777777",
      "container_count": 9,
      "carrier": {
        "scac": "CMDU",
        "name": "CMA CGM"
      },
      "status": "ARRIVED",
      "route": {
        "port_of_loading": {
          "location": {
            "code": "CNSHA",
            "name": "SHANGHAI",
            "timezone": "Asia/Shanghai",
            "country": {
              "code": "CN",
              "name": "China"
            }
          },
          "date_of_loading": "2025-03-15T12:00:00+08:00",
          "date_of_loading_initial": "2025-03-15T12:00:00+08:00"
        },
        "ts_count": 2,
        "port_of_discharge": {
          "location": {
            "code": "MACAS",
            "name": "CASABLANCA",
            "timezone": "Africa/Casablanca",
            "country": {
              "code": "MA",
              "name": "Morocco"
            }
          },
          "date_of_discharge": "2025-05-24T12:00:00+01:00",
          "date_of_discharge_initial": "2025-05-24T12:00:00+01:00"
        },
        "transit_time": 70,
        "transit_percentage": 99,
        "co2_emission": null
      },
      "creator": {
        "name": "John Doe",
        "email": "john-doe@example.com"
      },
      "tags": [],
      "created_at": "2025-04-14 11:34:03",
      "updated_at": "2025-04-14 11:34:03",
      "checked_at": "2025-04-14 11:34:03",
      "discarded_at": null
    }
  ],
  "meta": {
    "more": false,
    "total": 3
  }
}
```

---

### 3️⃣ Obtener Detalles de un Envío

**Endpoint**: `GET /ocean/shipments/{shipment_id}`

**Descripción**: Obtiene información completa y detallada de un envío específico.

#### Path Parameters

- `shipment_id` (integer, required): ID único del envío

#### Respuesta Completa

```json
{
  "message": "SUCCESS",
  "shipment": {
    "id": 1001,
    "reference": "INTERNAL_UNIQUE_IDENTIFIER",
    "booking_number": null,
    "container_number": "MSDU7777777",
    "container_count": 1,
    "carrier": {
      "scac": "MSCU",
      "name": "MSC"
    },
    "status": "INPROGRESS",
    "route": null,
    "containers": [],
    "tokens": {
      "map": "00000000-0000-0000-0000-000000000000"
    },
    "followers": [],
    "tags": [],
    "creator": {
      "name": "John Doe",
      "email": "john-doe@example.com"
    },
    "created_at": "2025-04-14 10:31:02",
    "updated_at": "2025-04-14 10:31:02",
    "checked_at": "2025-04-14 10:31:02",
    "discarded_at": null
  }
}
```

**Diferencia con List**: Este endpoint retorna información completa incluyendo `containers`, `followers`, `tokens`, mientras que el list retorna solo información básica.

---

### 4️⃣ Actualizar un Envío

**Endpoint**: `PATCH /ocean/shipments/{shipment_id}`

**Descripción**: Actualiza el campo `reference` de un envío existente.

#### Request Body

```json
{
  "reference": "NEW_REFERENCE_VALUE"
}
```

#### Respuestas

**✅ 200 - Success**
```json
{
  "message": "SUCCESS",
  "shipment": {
    "id": 123456,
    "reference": "NEW_REFERENCE_VALUE",
    "container_number": "MSCU1234567",
    "booking_number": "MEDUQY000000"
  }
}
```

**🚫 403 - Forbidden**
```json
{
  "message": "User does not have permission for this action"
}
```

---

### 5️⃣ Eliminar un Envío

**Endpoint**: `DELETE /ocean/shipments/{shipment_id}`

**Descripción**: Elimina un envío del sistema.

**⚠️ Nota**: Una vez eliminado, el envío dejará de ser rastreado.

---

### 6️⃣ Agregar Seguidor

**Endpoint**: `POST /ocean/shipments/{shipment_id}/followers`

**Descripción**: Agrega un email para recibir notificaciones del envío.

#### Request Body

```json
{
  "follower": "customer-1@example.com"
}
```

#### Respuestas

**✅ 200 - Success**
```json
{
  "message": "SUCCESS",
  "follower": {
    "id": 1001,
    "email": "customer-1@example.com"
  }
}
```

**⚠️ 409 - Already Exists**
```json
{
  "message": "Follower has already been added"
}
```

---

### 7️⃣ Eliminar Seguidor

**Endpoint**: `DELETE /ocean/shipments/{shipment_id}/followers/{follower_id}`

---

### 8️⃣ Agregar Etiqueta

**Endpoint**: `POST /ocean/shipments/{shipment_id}/tags`

**Descripción**: Agrega una etiqueta para clasificar el envío.

#### Request Body

```json
{
  "tag": "IMPORT"
}
```

**Límite**: 64 caracteres por tag

---

### 9️⃣ Eliminar Etiqueta

**Endpoint**: `DELETE /ocean/shipments/{shipment_id}/tags/{tag_id}`

---

## 📊 Estructura de Datos

### Shipment (Objeto Completo)

```typescript
interface Shipment {
  id: number;                           // ID único del envío
  reference: string | null;             // Referencia interna
  booking_number: string | null;        // Número de booking
  container_number: string | null;      // Número de contenedor
  container_count: number;              // Cantidad de contenedores
  carrier: {
    scac: string;                       // SCAC code (ej: "MSCU")
    name: string;                       // Nombre del carrier (ej: "MSC")
  };
  status: ShipmentStatus;               // Estado actual
  route: ShipmentRoute | null;          // Información de ruta
  containers: Container[];              // Detalles de contenedores
  tokens: {
    map: string;                        // Token para visualización de mapa
  };
  followers: Follower[];                // Lista de seguidores
  tags: Tag[];                          // Etiquetas asignadas
  creator: {
    name: string;
    email: string;
  };
  created_at: string;                   // ISO 8601
  updated_at: string;                   // ISO 8601
  checked_at: string;                   // ISO 8601
  discarded_at: string | null;          // ISO 8601
}
```

### ShipmentRoute

```typescript
interface ShipmentRoute {
  port_of_loading: {
    location: {
      code: string;                     // Código UN/LOCODE (ej: "CNSHA")
      name: string;                     // Nombre del puerto
      timezone: string;                 // Zona horaria IANA
      country: {
        code: string;                   // ISO 3166-1 alpha-2
        name: string;
      };
    };
    date_of_loading: string;            // Fecha actual de carga (puede cambiar)
    date_of_loading_initial: string;    // Fecha original de carga
  };
  ts_count: number;                     // Número de transbordos
  port_of_discharge: {
    location: { /* igual que port_of_loading */ };
    date_of_discharge: string;
    date_of_discharge_initial: string;
  };
  transit_time: number;                 // Días de tránsito
  transit_percentage: number;           // 0-100 (porcentaje completado)
  co2_emission: number | null;          // Emisiones de CO2
}
```

### Meta (Paginación)

```typescript
interface Meta {
  more: boolean;                        // ¿Hay más páginas?
  total: number;                        // Total de registros
}
```

---

## 🔄 Flujo de Implementación

### Fase 1: Preparación del Backend

```
┌─────────────────────────────────────────────────────────┐
│ 1. Configuración Inicial                                │
├─────────────────────────────────────────────────────────┤
│ • Obtener API Token de ShipsGo                          │
│ • Almacenar en .env (SHIPSGO_API_TOKEN)                 │
│ • Verificar créditos disponibles                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Crear Servicio HTTP en Laravel                       │
├─────────────────────────────────────────────────────────┤
│ • app/Services/ShipsGoService.php                       │
│ • Métodos para cada endpoint                            │
│ • Manejo de errores y reintentos                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Actualizar Modelo Container                          │
├─────────────────────────────────────────────────────────┤
│ • Agregar campo: shipsgo_shipment_id (nullable)         │
│ • Agregar campo: shipsgo_data (JSON)                    │
│ • Agregar timestamps de sincronización                  │
└─────────────────────────────────────────────────────────┘
```

### Fase 2: Integración en Flujo de Órdenes

```
┌─────────────────────────────────────────────────────────┐
│ ADMIN crea/actualiza Contenedor                         │
└─────────────────┬───────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────┐
│ ¿Tiene container_number o booking_number?               │
└─────────────────┬───────────────────────────────────────┘
                  │ SÍ
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Llamar a ShipsGo: POST /ocean/shipments                 │
├─────────────────────────────────────────────────────────┤
│ Request:                                                 │
│ {                                                        │
│   "reference": "ORDER-{order_id}-CONT-{container_id}",  │
│   "container_number": "MSCU1234567",                    │
│   "booking_number": "BOOKING123",                       │
│   "carrier": "MSCU",                                    │
│   "followers": [client.email],                          │
│   "tags": ["ORDER_{order_id}"]                          │
│ }                                                        │
└─────────────────┬───────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Respuesta 200 o 409                                     │
└─────────────────┬───────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Guardar shipment_id en BD                               │
├─────────────────────────────────────────────────────────┤
│ container.shipsgo_shipment_id = response.shipment.id    │
│ container.save()                                         │
└─────────────────────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────┐
│ ShipsGo comienza rastreo automático                     │
└─────────────────────────────────────────────────────────┘
```

### Fase 3: Sincronización Periódica

```
┌─────────────────────────────────────────────────────────┐
│ Laravel Scheduled Job (cada 4 horas)                    │
└─────────────────┬───────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Obtener containers activos con shipment_id              │
├─────────────────────────────────────────────────────────┤
│ WHERE shipsgo_shipment_id IS NOT NULL                   │
│ AND status NOT IN ('DISCHARGED', 'DELIVERED')           │
└─────────────────┬───────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Para cada container:                                     │
│   GET /ocean/shipments/{shipment_id}                    │
└─────────────────┬───────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Actualizar datos en BD                                  │
├─────────────────────────────────────────────────────────┤
│ • status                                                 │
│ • port_of_loading                                       │
│ • port_of_discharge                                     │
│ • date_of_loading                                       │
│ • date_of_discharge                                     │
│ • transit_percentage                                    │
│ • shipsgo_data (JSON completo)                          │
└─────────────────┬───────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────┐
│ ¿Cambió el status?                                      │
└─────────────────┬───────────────────────────────────────┘
                  │ SÍ
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Crear notificación para el cliente                      │
└─────────────────────────────────────────────────────────┘
```

### Fase 4: Consulta Manual (Opcional)

```
┌─────────────────────────────────────────────────────────┐
│ ADMIN hace clic en "Actualizar desde ShipsGo"           │
└─────────────────┬───────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────┐
│ POST /api/containers/{id}/refresh-from-shipsgo          │
└─────────────────┬───────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────┐
│ GET /ocean/shipments/{shipment_id}                      │
└─────────────────┬───────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Actualizar BD inmediatamente                            │
└─────────────────────────────────────────────────────────┘
```

---

## 📈 Diagramas de Integración

### Diagrama de Arquitectura

```
┌──────────────────────────────────────────────────────────────┐
│                      FRONTEND (Angular)                       │
├──────────────────────────────────────────────────────────────┤
│  • Dashboard Cliente                                          │
│  • Lista de Órdenes                                           │
│  • Modal de Rastreo                                           │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTP Requests
                         ↓
┌──────────────────────────────────────────────────────────────┐
│                    BACKEND (Laravel API)                      │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Controllers                                          │    │
│  │  • OrderController                                   │    │
│  │  • ContainerController                               │    │
│  └─────────────────┬───────────────────────────────────┘    │
│                    ↓                                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Services                                             │    │
│  │  • ShipsGoService ← ¡NUEVO!                         │    │
│  └─────────────────┬───────────────────────────────────┘    │
│                    ↓                                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Models                                               │    │
│  │  • Order                                             │    │
│  │  • Container (+shipsgo_shipment_id)                 │    │
│  └─────────────────┬───────────────────────────────────┘    │
│                    ↓                                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Jobs (Scheduled)                                     │    │
│  │  • SyncShipmentsFromShipsGo ← ¡NUEVO!              │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└────────────────────────┬─────────────────────────────────────┘
                         │ API Calls
                         ↓
┌──────────────────────────────────────────────────────────────┐
│                   ShipsGo API v2                              │
├──────────────────────────────────────────────────────────────┤
│  • POST /ocean/shipments (crear)                             │
│  • GET /ocean/shipments (listar)                             │
│  • GET /ocean/shipments/{id} (detalles)                      │
│  • PATCH /ocean/shipments/{id} (actualizar)                  │
│  • DELETE /ocean/shipments/{id} (eliminar)                   │
└──────────────────────────────────────────────────────────────┘
```

### Flujo de Creación de Orden Completo

```
ADMIN                    BACKEND                    SHIPSGO
  │                         │                          │
  │ 1. Crear Orden          │                          │
  ├────────────────────────>│                          │
  │                         │                          │
  │                         │ 2. Guardar en BD         │
  │                         │    (Order)               │
  │                         │                          │
  │ 3. Asignar Container    │                          │
  ├────────────────────────>│                          │
  │                         │                          │
  │                         │ 4. Guardar Container     │
  │                         │    en BD                 │
  │                         │                          │
  │                         │ 5. POST /ocean/shipments │
  │                         ├─────────────────────────>│
  │                         │                          │
  │                         │ 6. Response: shipment_id │
  │                         │<─────────────────────────┤
  │                         │                          │
  │                         │ 7. Update Container      │
  │                         │    shipsgo_shipment_id   │
  │                         │                          │
  │<────────────────────────┤                          │
  │  Response: Success      │                          │
  │                         │                          │
  │                         │                          │
  │ === RASTREO AUTOMÁTICO === ShipsGo rastrea cada X horas
  │                         │                          │
  │                         │<─────────────────────────┤
  │                         │  Webhook: Status Update  │
  │                         │  (opcional)              │
  │                         │                          │
  │                         │                          │
  │ === SINCRONIZACIÓN PERIÓDICA ===                   │
  │                         │                          │
  │     [Scheduled Job]     │                          │
  │                         │ GET /ocean/shipments/{id}│
  │                         ├─────────────────────────>│
  │                         │                          │
  │                         │ Response: Full Details   │
  │                         │<─────────────────────────┤
  │                         │                          │
  │                         │ Update Database          │
  │                         │                          │
  │                         │ Create Notification      │
  │                         │ (if status changed)      │
  │                         │                          │
```

### Ciclo de Vida del Shipment

```
┌──────────────┐
│   CREATE     │  Admin crea container con datos de tracking
└──────┬───────┘
       │
       ↓
┌──────────────────────────────────────────────────────────┐
│  ShipsGo API Call                                         │
│  POST /ocean/shipments                                    │
│  {                                                        │
│    "container_number": "MSCU1234567",                    │
│    "booking_number": "BOOK123",                          │
│    "carrier": "MSCU",                                    │
│    "reference": "ORDER-15-CONT-42",                      │
│    "followers": ["client@example.com"],                  │
│    "tags": ["IMPORT", "URGENT"]                          │
│  }                                                        │
└──────┬───────────────────────────────────────────────────┘
       │
       ↓
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│     NEW      │────>│  INPROGRESS  │────>│   BOOKED     │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                                  ↓
                                          ┌──────────────┐
                                          │   LOADED     │
                                          └──────┬───────┘
                                                  │
                                                  ↓
┌──────────────┐                          ┌──────────────┐
│  UNTRACKED   │                          │   SAILING    │
│ (no rastreo) │                          │ (en tránsito)│
└──────────────┘                          └──────┬───────┘
                                                  │
                                                  ↓
                                          ┌──────────────┐
                                          │   ARRIVED    │
                                          └──────┬───────┘
                                                  │
                                                  ↓
                                          ┌──────────────┐
                                          │  DISCHARGED  │
                                          │  (completado)│
                                          └──────────────┘
```

---

## 💼 Casos de Uso

### Caso de Uso 1: Crear Orden con Rastreo Automático

**Actor**: Administrador

**Flujo**:
1. Admin crea una nueva orden para un cliente
2. Admin ingresa datos del contenedor:
   - Container Number: `MSCU1234567`
   - Booking Number: `BOOK123456`
   - Carrier: `MSC (MSCU)`
3. Sistema automáticamente:
   - Llama a ShipsGo API para crear shipment
   - Guarda el `shipment_id` en el container
   - El cliente recibe email de notificación inicial
4. ShipsGo comienza rastreo automático
5. Cliente puede ver progreso en tiempo real en su dashboard

**Beneficio**: Sin intervención manual, el cliente recibe actualizaciones automáticas.

---

### Caso de Uso 2: Dashboard del Cliente con Estado en Tiempo Real

**Actor**: Cliente

**Flujo**:
1. Cliente inicia sesión
2. Ve dashboard con tarjetas:
   - "En tránsito" (status: SAILING)
   - "Por arribar" (status: SAILING, próximos 7 días)
   - "Completados" (status: DISCHARGED)
3. Click en "Ver detalles" de una orden
4. Ve modal con:
   - Progreso visual (0-100%)
   - Puerto origen → Puerto destino
   - Fecha estimada de llegada
   - Mapa interactivo (usando token de ShipsGo)
   - Timeline de eventos

**Beneficio**: Transparencia total sin necesidad de contactar al admin.

---

### Caso de Uso 3: Notificaciones Automáticas

**Actor**: Sistema (Job Scheduler)

**Flujo**:
1. Job se ejecuta cada 4 horas
2. Consulta todos los containers activos
3. Para cada uno, obtiene detalles de ShipsGo
4. Detecta cambios:
   - Status cambió de SAILING → ARRIVED
   - Fecha de descarga se retrasó 2 días
5. Crea notificaciones en BD
6. Envía emails a:
   - Cliente (follower)
   - Admin (opcional)

**Beneficio**: Proactividad - cliente informado sin tener que preguntar.

---

### Caso de Uso 4: Filtrado Avanzado para Admin

**Actor**: Administrador

**Flujo**:
1. Admin necesita ver "envíos urgentes retrasados"
2. Aplica filtros:
   ```
   tags: "URGENT"
   status: "SAILING"
   date_of_discharge < HOY
   ```
3. Sistema muestra solo envíos que cumplen criterios
4. Admin puede tomar acciones correctivas

**Beneficio**: Gestión proactiva de excepciones.

---

## ⚙️ Consideraciones Técnicas

### 1. Manejo de Créditos

**Problema**: Cada shipment creado consume créditos.

**Solución**:
```php
// Antes de crear shipment
if (!$this->hasEnoughCredits()) {
    throw new InsufficientCreditsException();
}

// Capturar 409 (ya existe) para no gastar créditos
try {
    $response = $this->shipsGoService->createShipment($data);
} catch (ShipmentAlreadyExistsException $e) {
    // No se cobraron créditos, usar shipment existente
    $shipmentId = $e->getExistingShipmentId();
}
```

### 2. Rate Limiting & Concurrencia

**Problema**: Enviar muchos requests simultáneos puede resultar en `429 TOO_MANY_CONCURRENT_REQUESTS`.

**Solución**:
```php
// Usar Queue con delay
dispatch(new CreateShipmentJob($containerId))
    ->delay(now()->addSeconds(rand(1, 10)));

// O procesar en lotes
foreach (array_chunk($containers, 10) as $batch) {
    foreach ($batch as $container) {
        $this->createShipment($container);
        sleep(1); // 1 segundo entre requests
    }
}
```

### 3. Manejo de Duplicados

**Estrategia**:
```php
// Usar reference único basado en IDs internos
$reference = sprintf(
    'ORD-%d-CONT-%d-%s',
    $order->id,
    $container->id,
    Str::random(8)
);

// Si ShipsGo retorna 409, no crear otro
if ($response->status === 409) {
    $container->update([
        'shipsgo_shipment_id' => $response->shipment->id
    ]);
}
```

### 4. Sincronización de Datos

**Estrategia**:
```php
// Guardar respuesta completa en JSON
$container->update([
    'shipsgo_shipment_id' => $shipment->id,
    'shipsgo_data' => $shipment, // JSON completo
    'shipsgo_last_sync' => now(),

    // Campos específicos para queries rápidas
    'status' => $shipment->status,
    'port_of_loading' => $shipment->route->port_of_loading->location->code,
    'port_of_discharge' => $shipment->route->port_of_discharge->location->code,
    'date_of_discharge' => $shipment->route->port_of_discharge->date_of_discharge,
    'transit_percentage' => $shipment->route->transit_percentage,
]);
```

### 5. Webhooks (Futuro)

**Recomendación**: Implementar endpoint para recibir webhooks de ShipsGo:

```php
Route::post('/webhooks/shipsgo/shipment-updated', [WebhookController::class, 'shipmentUpdated']);
```

**Beneficio**: Actualizaciones en tiempo real sin polling.

---

## 🎯 Recomendaciones

### Prioridad Alta (Fase 1)

1. ✅ **Crear ShipsGoService**
   - Todos los endpoints básicos
   - Manejo de errores robusto
   - Logging de requests/responses

2. ✅ **Migración de BD**
   ```sql
   ALTER TABLE containers
   ADD COLUMN shipsgo_shipment_id BIGINT NULL,
   ADD COLUMN shipsgo_data JSON NULL,
   ADD COLUMN shipsgo_last_sync TIMESTAMP NULL;
   ```

3. ✅ **Integrar en flujo de Container**
   - Al crear/actualizar container, crear shipment
   - Guardar shipment_id
   - Manejar 409 (duplicados)

### Prioridad Media (Fase 2)

4. ✅ **Job de Sincronización**
   ```php
   // app/Console/Kernel.php
   $schedule->job(new SyncShipmentsFromShipsGo)
            ->everyFourHours();
   ```

5. ✅ **Actualización del Modal de Rastreo**
   - Usar datos de ShipsGo
   - Mostrar `transit_percentage`
   - Integrar mapa con token

6. ✅ **Sistema de Notificaciones**
   - Detectar cambios de status
   - Enviar emails automáticos
   - Dashboard de notificaciones

### Prioridad Baja (Fase 3)

7. ⏳ **Implementar Webhooks**
   - Endpoint público seguro
   - Validación de firma
   - Actualización inmediata en BD

8. ⏳ **Panel de Analytics**
   - Tiempo promedio de tránsito
   - Carriers más confiables
   - Puertos más utilizados

9. ⏳ **Gestión de Followers/Tags**
   - UI para agregar/quitar followers
   - Sistema de tags predefinidos
   - Filtros avanzados en frontend

---

## 📝 Estructura de Archivos Propuesta

```
backend/
├── app/
│   ├── Services/
│   │   └── ShipsGoService.php              ← NUEVO
│   ├── Jobs/
│   │   └── SyncShipmentsFromShipsGo.php    ← NUEVO
│   ├── Http/
│   │   └── Controllers/
│   │       └── ContainerController.php      ← ACTUALIZAR
│   ├── Models/
│   │   └── Container.php                    ← ACTUALIZAR
│   └── Exceptions/
│       ├── InsufficientCreditsException.php ← NUEVO
│       └── ShipmentAlreadyExistsException.php ← NUEVO
│
├── database/
│   └── migrations/
│       └── xxxx_add_shipsgo_fields_to_containers.php ← NUEVO
│
└── config/
    └── shipsgo.php                          ← NUEVO

frontend/
└── src/
    └── app/
        ├── shared/
        │   └── components/
        │       └── order-tracking-modal/
        │           ├── order-tracking-modal.ts   ← ACTUALIZAR
        │           ├── order-tracking-modal.html ← ACTUALIZAR
        │           └── order-tracking-modal.scss
        │
        └── core/
            └── services/
                └── shipsgo.service.ts       ← NUEVO (opcional)
```

---

## 🔒 Seguridad

### 1. API Token

```env
# .env
SHIPSGO_API_TOKEN=your_secret_token_here
```

```php
// config/shipsgo.php
return [
    'api_token' => env('SHIPSGO_API_TOKEN'),
    'api_url' => 'https://api.shipsgo.com/v2',
];
```

### 2. Rate Limiting

```php
// Implementar en Service
private $maxRequestsPerMinute = 60;

public function createShipment($data) {
    if ($this->isRateLimited()) {
        throw new RateLimitExceededException();
    }

    // ... rest of code
}
```

### 3. Validación de Webhooks

```php
// Validar firma HMAC
public function validateWebhook(Request $request) {
    $signature = $request->header('X-Shipsgo-Signature');
    $payload = $request->getContent();

    $expectedSignature = hash_hmac(
        'sha256',
        $payload,
        config('shipsgo.webhook_secret')
    );

    return hash_equals($expectedSignature, $signature);
}
```

---

## 📊 Métricas & Monitoreo

### KPIs a Rastrear

1. **Uso de API**
   - Requests por día
   - Créditos consumidos
   - Rate limit hits

2. **Calidad de Datos**
   - % de shipments con rastreo exitoso
   - % de status UNTRACKED
   - Tiempo promedio de sincronización

3. **User Engagement**
   - Clicks en modal de rastreo
   - Tiempo promedio en página de rastreo
   - Notificaciones abiertas

### Logging

```php
// Loggear todas las interacciones
Log::channel('shipsgo')->info('Shipment created', [
    'container_id' => $container->id,
    'shipment_id' => $response->shipment->id,
    'status' => $response->shipment->status,
    'credits_used' => 1,
]);
```

---

## 🚀 Plan de Implementación (Timeline)

### Semana 1: Backend Foundation
- [ ] Crear ShipsGoService
- [ ] Migración de BD
- [ ] Tests unitarios del service

### Semana 2: Integración Básica
- [ ] Integrar en ContainerController
- [ ] Manejo de duplicados
- [ ] Manejo de errores 402/409

### Semana 3: Sincronización
- [ ] Job de sincronización periódica
- [ ] Sistema de notificaciones
- [ ] Tests de integración

### Semana 4: Frontend
- [ ] Actualizar modal de rastreo
- [ ] Integrar transit_percentage
- [ ] Mostrar datos de puertos

### Semana 5: Refinamiento
- [ ] Webhooks (opcional)
- [ ] Analytics dashboard
- [ ] Documentación

---

## 📚 Recursos Adicionales

- [ShipsGo API Docs](https://api.shipsgo.com/docs/v2-experimental/)
- [UN/LOCODE Database](https://unece.org/trade/cefact/unlocode-code-list-country-and-territory)
- [SCAC Codes List](https://www.cbp.gov/document/guidance/standard-carrier-alpha-code-scac-list)

---

## ✅ Checklist de Implementación

### Backend
- [ ] Crear ShipsGoService.php
- [ ] Agregar campos a tabla containers
- [ ] Actualizar ContainerController
- [ ] Crear Job de sincronización
- [ ] Implementar manejo de errores
- [ ] Agregar tests

### Frontend
- [ ] Actualizar order-tracking-modal
- [ ] Mostrar transit_percentage
- [ ] Integrar datos de puertos
- [ ] Agregar indicador de última actualización

### DevOps
- [ ] Configurar .env con API token
- [ ] Configurar scheduled job en servidor
- [ ] Configurar logging
- [ ] Configurar alertas de créditos bajos

---

## 🎓 Conclusión

La integración con ShipsGo API v2 Ocean Shipments proporcionará a SICE App:

✅ **Rastreo automático** sin intervención manual
✅ **Transparencia total** para clientes
✅ **Notificaciones proactivas** de cambios de estado
✅ **Datos precisos** directamente de carriers
✅ **Escalabilidad** para cientos de envíos simultáneos

**Próximo Paso**: Comenzar con Fase 1 - Crear ShipsGoService y migración de BD.

---

**Documento creado**: 2025-01-18
**Autor**: Claude (Anthropic)
**Versión**: 1.0
**Proyecto**: SICE App - Integración ShipsGo API
