/**
 * ========================================
 * ARCHIVO GENERADO AUTOMATICAMENTE
 * ========================================
 * No editar manualmente.
 * Ejecutar: php artisan enums:sync
 * Fecha: 2025-12-15 20:29:28
 * Fuente: Laravel Enums (app/Enums/)
 */

// ==========================================
// UserRole
// ==========================================
export enum UserRole {
  Administrator = 'administrator',
  Client = 'client',
}

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.Administrator]: 'Administrador',
  [UserRole.Client]: 'Cliente',
};

export const UserRoleColors: Record<UserRole, string> = {
  [UserRole.Administrator]: 'primary',
  [UserRole.Client]: 'primary',
};

export const UserRoleIcons: Record<UserRole, string> = {
  [UserRole.Administrator]: 'bi-shield-check',
  [UserRole.Client]: 'bi-person',
};


// ==========================================
// UserStatus
// ==========================================
export enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export const UserStatusLabels: Record<UserStatus, string> = {
  [UserStatus.Active]: 'Activo',
  [UserStatus.Inactive]: 'Inactivo',
};

export const UserStatusColors: Record<UserStatus, string> = {
  [UserStatus.Active]: 'success',
  [UserStatus.Inactive]: 'secondary',
};

export const UserStatusIcons: Record<UserStatus, string> = {
  [UserStatus.Active]: 'bi-check-circle',
  [UserStatus.Inactive]: 'bi-slash-circle',
};


// ==========================================
// OrderStatus
// ==========================================
export enum OrderStatus {
  Pending = 'pending',
  Processing = 'processing',
  Shipped = 'shipped',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
}

export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'Pendiente',
  [OrderStatus.Processing]: 'En Proceso',
  [OrderStatus.Shipped]: 'Enviado',
  [OrderStatus.Delivered]: 'Entregado',
  [OrderStatus.Cancelled]: 'Cancelado',
};

export const OrderStatusColors: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'warning',
  [OrderStatus.Processing]: 'primary',
  [OrderStatus.Shipped]: 'primary',
  [OrderStatus.Delivered]: 'success',
  [OrderStatus.Cancelled]: 'danger',
};

export const OrderStatusIcons: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'bi-clock',
  [OrderStatus.Processing]: 'bi-gear',
  [OrderStatus.Shipped]: 'bi-truck',
  [OrderStatus.Delivered]: 'bi-check-circle',
  [OrderStatus.Cancelled]: 'bi-x-circle',
};


// ==========================================
// ContainerStatus
// ==========================================
export enum ContainerStatus {
  NEW = 'NEW',
  INPROGRESS = 'INPROGRESS',
  BOOKED = 'BOOKED',
  LOADED = 'LOADED',
  SAILING = 'SAILING',
  ARRIVED = 'ARRIVED',
  DISCHARGED = 'DISCHARGED',
  UNTRACKED = 'UNTRACKED',
  CANCELLED = 'CANCELLED',
}

export const ContainerStatusLabels: Record<ContainerStatus, string> = {
  [ContainerStatus.NEW]: 'Nuevo',
  [ContainerStatus.INPROGRESS]: 'En Proceso',
  [ContainerStatus.BOOKED]: 'Reservado',
  [ContainerStatus.LOADED]: 'Cargado',
  [ContainerStatus.SAILING]: 'Navegando',
  [ContainerStatus.ARRIVED]: 'Arribado',
  [ContainerStatus.DISCHARGED]: 'Descargado',
  [ContainerStatus.UNTRACKED]: 'Sin Seguimiento',
  [ContainerStatus.CANCELLED]: 'Cancelado',
};

export const ContainerStatusColors: Record<ContainerStatus, string> = {
  [ContainerStatus.NEW]: 'secondary',
  [ContainerStatus.INPROGRESS]: 'primary',
  [ContainerStatus.BOOKED]: 'info',
  [ContainerStatus.LOADED]: 'info',
  [ContainerStatus.SAILING]: 'success',
  [ContainerStatus.ARRIVED]: 'warning',
  [ContainerStatus.DISCHARGED]: 'warning',
  [ContainerStatus.UNTRACKED]: 'danger',
  [ContainerStatus.CANCELLED]: 'secondary',
};

export const ContainerStatusIcons: Record<ContainerStatus, string> = {
  [ContainerStatus.NEW]: 'bi-plus-lg',
  [ContainerStatus.INPROGRESS]: 'bi-hourglass-split',
  [ContainerStatus.BOOKED]: 'bi-calendar-check',
  [ContainerStatus.LOADED]: 'bi-box-seam',
  [ContainerStatus.SAILING]: 'bi-water',
  [ContainerStatus.ARRIVED]: 'bi-geo-alt-fill',
  [ContainerStatus.DISCHARGED]: 'bi-check-circle-fill',
  [ContainerStatus.UNTRACKED]: 'bi-question-circle',
  [ContainerStatus.CANCELLED]: 'bi-slash-circle',
};


// ==========================================
// NotificationType
// ==========================================
export enum NotificationType {
  OrderCreated = 'order_created',
  OrderUpdated = 'order_updated',
  OrderStatusChanged = 'order_status_changed',
  ContainerArrived = 'container_arrived',
  ContainerDeparted = 'container_departed',
  SystemNotification = 'system',
  Test = 'test',
  Note = 'note',
}

export const NotificationTypeLabels: Record<NotificationType, string> = {
  [NotificationType.OrderCreated]: 'Orden Creada',
  [NotificationType.OrderUpdated]: 'Orden Actualizada',
  [NotificationType.OrderStatusChanged]: 'Estado de Orden Cambiado',
  [NotificationType.ContainerArrived]: 'Contenedor Llegó',
  [NotificationType.ContainerDeparted]: 'Contenedor Partió',
  [NotificationType.SystemNotification]: 'Notificación del Sistema',
  [NotificationType.Test]: 'Prueba',
  [NotificationType.Note]: 'Nota',
};

export const NotificationTypeColors: Record<NotificationType, string> = {
  [NotificationType.OrderCreated]: 'primary',
  [NotificationType.OrderUpdated]: 'warning',
  [NotificationType.OrderStatusChanged]: 'primary',
  [NotificationType.ContainerArrived]: 'success',
  [NotificationType.ContainerDeparted]: 'warning',
  [NotificationType.SystemNotification]: 'secondary',
  [NotificationType.Test]: 'danger',
  [NotificationType.Note]: 'info',
};

export const NotificationTypeIcons: Record<NotificationType, string> = {
  [NotificationType.OrderCreated]: 'bi-plus-lg',
  [NotificationType.OrderUpdated]: 'bi-pencil-square',
  [NotificationType.OrderStatusChanged]: 'bi-arrow-repeat',
  [NotificationType.ContainerArrived]: 'bi-water',
  [NotificationType.ContainerDeparted]: 'bi-geo-alt',
  [NotificationType.SystemNotification]: 'bi-info-circle',
  [NotificationType.Test]: 'bi-bug',
  [NotificationType.Note]: 'bi-sticky',
};

export const NotificationTypePriority: Record<NotificationType, number> = {
  [NotificationType.OrderCreated]: 2,
  [NotificationType.OrderUpdated]: 2,
  [NotificationType.OrderStatusChanged]: 3,
  [NotificationType.ContainerArrived]: 3,
  [NotificationType.ContainerDeparted]: 2,
  [NotificationType.SystemNotification]: 1,
  [NotificationType.Test]: 1,
  [NotificationType.Note]: 1,
};


// ==========================================
// NotificationStatus
// ==========================================
export enum NotificationStatus {
  SEND = 'send',
  FAILED = 'failed',
}

export const NotificationStatusLabels: Record<NotificationStatus, string> = {
  [NotificationStatus.SEND]: 'Send',
  [NotificationStatus.FAILED]: 'Failed',
};


// ==========================================
// MovementStatus
// ==========================================
export enum MovementStatus {
  EST = 'EST',
  ACT = 'ACT',
}

export const MovementStatusLabels: Record<MovementStatus, string> = {
  [MovementStatus.EST]: 'Estimado',
  [MovementStatus.ACT]: 'Confirmado',
};

export const MovementStatusColors: Record<MovementStatus, string> = {
  [MovementStatus.EST]: 'warning',
  [MovementStatus.ACT]: 'success',
};

export const MovementStatusIcons: Record<MovementStatus, string> = {
  [MovementStatus.EST]: 'bi-clock',
  [MovementStatus.ACT]: 'bi-check-circle',
};


// ==========================================
// MovementEvent
// ==========================================
export enum MovementEvent {
  EMSH = 'EMSH',
  GTIN = 'GTIN',
  LOAD = 'LOAD',
  DEPA = 'DEPA',
  ARRV = 'ARRV',
  DISC = 'DISC',
  GTOT = 'GTOT',
  EMRT = 'EMRT',
  NOTI = 'NOTI',
}

export const MovementEventLabels: Record<MovementEvent, string> = {
  [MovementEvent.EMSH]: 'Vacío a Exportador',
  [MovementEvent.GTIN]: 'Ingreso al Puerto',
  [MovementEvent.LOAD]: 'Cargado',
  [MovementEvent.DEPA]: 'Zarpó',
  [MovementEvent.ARRV]: 'Arribó',
  [MovementEvent.DISC]: 'Descargado',
  [MovementEvent.GTOT]: 'Salida del Puerto',
  [MovementEvent.EMRT]: 'Vacío Devuelto',
  [MovementEvent.NOTI]: 'Actividad',
};

export const MovementEventColors: Record<MovementEvent, string> = {
  [MovementEvent.EMSH]: 'secondary',
  [MovementEvent.GTIN]: 'primary',
  [MovementEvent.LOAD]: 'info',
  [MovementEvent.DEPA]: 'info',
  [MovementEvent.ARRV]: 'warning',
  [MovementEvent.DISC]: 'success',
  [MovementEvent.GTOT]: 'warning',
  [MovementEvent.EMRT]: 'secondary',
  [MovementEvent.NOTI]: 'primary',
};

export const MovementEventIcons: Record<MovementEvent, string> = {
  [MovementEvent.EMSH]: 'bi-box-seam',
  [MovementEvent.GTIN]: 'bi-box-arrow-in-right',
  [MovementEvent.LOAD]: 'bi-truck',
  [MovementEvent.DEPA]: 'bi-water',
  [MovementEvent.ARRV]: 'bi-geo-alt',
  [MovementEvent.DISC]: 'bi-check-circle-fill',
  [MovementEvent.GTOT]: 'bi-box-arrow-right',
  [MovementEvent.EMRT]: 'bi-building',
  [MovementEvent.NOTI]: 'bi-pencil',
};


// ==========================================
// ActivityLogsAction
// ==========================================
export enum ActivityLogsAction {
  CREATE_USER = 'create_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  CRETE_ORDER = 'create_order',
  UPDATE_ORDER = 'update_order',
  DELETE_ORDER = 'delete_order',
  ASSIGN_ORDER = 'assign_order',
  CREATE_CONTAINER = 'create_container',
  UPDATE_CONTAINER = 'update_container',
  DELETE_CONTAINER = 'delete_container',
  SEND_NOTIFICATION = 'send_notification',
}


// ==========================================
// CONSTANTES ESPECIALES
// ==========================================

// Estados finales de orden (no pueden cambiar)
export const FinalOrderStatuses: OrderStatus[] = [
  OrderStatus.Delivered,
  OrderStatus.Cancelled,
];

// Estados activos de orden (pueden seguir cambiando)
export const ActiveOrderStatuses: OrderStatus[] = [
  OrderStatus.Pending,
  OrderStatus.Processing,
  OrderStatus.Shipped,
];

// Estados de contenedor que bloquean edicion manual del estado de orden
export const LockedContainerStatuses: ContainerStatus[] = [
  ContainerStatus.LOADED,
  ContainerStatus.SAILING,
  ContainerStatus.ARRIVED,
];

// Mapeo de estado contenedor -> estado automatico de orden
export const ContainerToOrderStatusMap: Partial<Record<ContainerStatus, OrderStatus>> = {
  [ContainerStatus.LOADED]: OrderStatus.Processing,
  [ContainerStatus.SAILING]: OrderStatus.Shipped,
  [ContainerStatus.ARRIVED]: OrderStatus.Shipped,
};

// ==========================================
// FUNCIONES HELPER
// ==========================================

/**
 * Verifica si el estado del contenedor bloquea la edicion manual del estado de orden
 */
export function isOrderStatusLocked(containerStatus: ContainerStatus | string | null | undefined): boolean {
  if (!containerStatus) return false;
  return LockedContainerStatuses.includes(containerStatus as ContainerStatus);
}

/**
 * Obtiene el estado automatico de orden segun el estado del contenedor
 */
export function getAutoOrderStatus(containerStatus: ContainerStatus | string | null | undefined): OrderStatus | null {
  if (!containerStatus) return null;
  return ContainerToOrderStatusMap[containerStatus as ContainerStatus] || null;
}

/**
 * Obtiene el label de un enum
 */
export function getEnumLabel<T extends string>(
  value: T,
  labels: Record<T, string>
): string {
  return labels[value] || value;
}

/**
 * Obtiene el color de un enum
 */
export function getEnumColor<T extends string>(
  value: T,
  colors: Record<T, string>
): string {
  return colors[value] || 'secondary';
}

/**
 * Obtiene el icono de un enum
 */
export function getEnumIcon<T extends string>(
  value: T,
  icons: Record<T, string>
): string {
  return icons[value] || 'bi-circle';
}

/**
 * Convierte un enum en array con labels para selects
 */
export function enumToArrayWithLabels<T extends string>(
  enumObj: Record<string, T>,
  labels: Record<T, string>
): Array<{value: T, label: string}> {
  return Object.values(enumObj).map(value => ({
    value,
    label: labels[value] || value
  }));
}
