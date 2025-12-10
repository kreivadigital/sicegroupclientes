/**
 * ENUMS SINCRONIZADOS CON LARAVEL BACKEND
 * Estos enums reflejan exactamente los valores definidos en el backend
 * Ubicación Laravel: C:\projects\kd\siceapi\app\Enums\
 */

// ==========================================
// USER ROLES (Roles de Usuario)
// ==========================================
export enum UserRole {
  Administrator = 'administrator',
  Client = 'client'
}

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.Administrator]: 'Administrador',
  [UserRole.Client]: 'Cliente'
};

export const UserRoleColors: Record<UserRole, string> = {
  [UserRole.Administrator]: 'danger',
  [UserRole.Client]: 'primary'
};

// ==========================================
// USER STATUS (Estados de Usuario)
// ==========================================
export enum UserStatus {
  Active = 'active',
  Inactive = 'inactive'
}

export const UserStatusLabels: Record<UserStatus, string> = {
  [UserStatus.Active]: 'Activo',
  [UserStatus.Inactive]: 'Inactivo'
};

export const UserStatusColors: Record<UserStatus, string> = {
  [UserStatus.Active]: 'success',
  [UserStatus.Inactive]: 'secondary'
};

// ==========================================
// ORDER STATUS (Estados de Orden)
// ==========================================
export enum OrderStatus {
  Pending = 'pending',
  Processing = 'processing',
  Shipped = 'shipped',
  Delivered = 'delivered',
  Cancelled = 'cancelled'
}

export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'Pendiente',
  [OrderStatus.Processing]: 'En Proceso',
  [OrderStatus.Shipped]: 'Enviado',
  [OrderStatus.Delivered]: 'Entregado',
  [OrderStatus.Cancelled]: 'Cancelado'
};

export const OrderStatusColors: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'warning',
  [OrderStatus.Processing]: 'info',
  [OrderStatus.Shipped]: 'primary',
  [OrderStatus.Delivered]: 'success',
  [OrderStatus.Cancelled]: 'danger'
};

export const OrderStatusIcons: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'bi-clock',
  [OrderStatus.Processing]: 'bi-gear',
  [OrderStatus.Shipped]: 'bi-truck',
  [OrderStatus.Delivered]: 'bi-check-circle',
  [OrderStatus.Cancelled]: 'bi-x-circle'
};

// Estados finales (no pueden cambiar)
export const FinalOrderStatuses: OrderStatus[] = [
  OrderStatus.Delivered,
  OrderStatus.Cancelled
];

// Estados activos (pueden seguir cambiando)
export const ActiveOrderStatuses: OrderStatus[] = [
  OrderStatus.Pending,
  OrderStatus.Processing,
  OrderStatus.Shipped
];

// ==========================================
// CONTAINER STATUS (Estados de Contenedor)
// ==========================================
export enum ContainerStatus {
  New = 'NEW',
  InProgress = 'INPROGRESS',
  Booked = 'BOOKED',
  Loaded = 'LOADED',
  Sailing = 'SAILING',
  Arrived = 'ARRIVED',
  Discharged = 'DISCHARGED',
  Untracked = 'UNTRACKED'
}

export const ContainerStatusLabels: Record<ContainerStatus, string> = {
  [ContainerStatus.New]: 'Nuevo',
  [ContainerStatus.InProgress]: 'En Progreso',
  [ContainerStatus.Booked]: 'Reservado',
  [ContainerStatus.Loaded]: 'Cargado',
  [ContainerStatus.Sailing]: 'Navegando',
  [ContainerStatus.Arrived]: 'Arribado',
  [ContainerStatus.Discharged]: 'Descargado',
  [ContainerStatus.Untracked]: 'Sin Rastreo'
};

export const ContainerStatusColors: Record<ContainerStatus, string> = {
  [ContainerStatus.New]: 'secondary',
  [ContainerStatus.InProgress]: 'info',
  [ContainerStatus.Booked]: 'primary',
  [ContainerStatus.Loaded]: 'warning',
  [ContainerStatus.Sailing]: 'primary',
  [ContainerStatus.Arrived]: 'success',
  [ContainerStatus.Discharged]: 'success',
  [ContainerStatus.Untracked]: 'danger'
};

export const ContainerStatusIcons: Record<ContainerStatus, string> = {
  [ContainerStatus.New]: 'bi-plus-lg',
  [ContainerStatus.InProgress]: 'bi-hourglass-split',
  [ContainerStatus.Booked]: 'bi-calendar-check',
  [ContainerStatus.Loaded]: 'bi-box-seam',
  [ContainerStatus.Sailing]: 'bi-water',
  [ContainerStatus.Arrived]: 'bi-geo-alt-fill',
  [ContainerStatus.Discharged]: 'bi-check-circle-fill',
  [ContainerStatus.Untracked]: 'bi-question-circle'
};

// ==========================================
// NOTIFICATION TYPE (Tipos de Notificación)
// ==========================================
export enum NotificationType {
  OrderCreated = 'order_created',
  OrderUpdated = 'order_updated',
  OrderStatusChanged = 'order_status_changed',
  ContainerArrived = 'container_arrived',
  ContainerDeparted = 'container_departed',
  SystemNotification = 'system',
  Test = 'test'
}

export const NotificationTypeLabels: Record<NotificationType, string> = {
  [NotificationType.OrderCreated]: 'Orden Creada',
  [NotificationType.OrderUpdated]: 'Orden Actualizada',
  [NotificationType.OrderStatusChanged]: 'Estado de Orden Cambiado',
  [NotificationType.ContainerArrived]: 'Contenedor Arribó',
  [NotificationType.ContainerDeparted]: 'Contenedor Partió',
  [NotificationType.SystemNotification]: 'Notificación del Sistema',
  [NotificationType.Test]: 'Prueba'
};

export const NotificationTypeColors: Record<NotificationType, string> = {
  [NotificationType.OrderCreated]: 'success',
  [NotificationType.OrderUpdated]: 'info',
  [NotificationType.OrderStatusChanged]: 'primary',
  [NotificationType.ContainerArrived]: 'success',
  [NotificationType.ContainerDeparted]: 'warning',
  [NotificationType.SystemNotification]: 'secondary',
  [NotificationType.Test]: 'light'
};

export const NotificationTypeIcons: Record<NotificationType, string> = {
  [NotificationType.OrderCreated]: 'bi-plus-lg',
  [NotificationType.OrderUpdated]: 'bi-pencil-square',
  [NotificationType.OrderStatusChanged]: 'bi-arrow-repeat',
  [NotificationType.ContainerArrived]: 'bi-geo-alt',
  [NotificationType.ContainerDeparted]: 'bi-send',
  [NotificationType.SystemNotification]: 'bi-info-circle',
  [NotificationType.Test]: 'bi-bug'
};

// Prioridades (1=baja, 3=alta)
export const NotificationTypePriority: Record<NotificationType, number> = {
  [NotificationType.OrderCreated]: 2,
  [NotificationType.OrderUpdated]: 1,
  [NotificationType.OrderStatusChanged]: 2,
  [NotificationType.ContainerArrived]: 3,
  [NotificationType.ContainerDeparted]: 2,
  [NotificationType.SystemNotification]: 1,
  [NotificationType.Test]: 1
};

// ==========================================
// NOTIFICATION STATUS (Estado de Notificación)
// ==========================================
export enum NotificationStatus {
  Send = 'send',
  Failed = 'failed'
}

export const NotificationStatusLabels: Record<NotificationStatus, string> = {
  [NotificationStatus.Send]: 'Enviada',
  [NotificationStatus.Failed]: 'Fallida'
};

// ==========================================
// ACTIVITY LOG ACTIONS (Acciones de Auditoría)
// ==========================================
export enum ActivityLogsAction {
  // User actions
  CreateUser = 'create_user',
  UpdateUser = 'update_user',
  DeleteUser = 'delete_user',

  // Order actions
  CreateOrder = 'create_order',
  UpdateOrder = 'update_order',
  DeleteOrder = 'delete_order',
  AssignOrder = 'assign_order',

  // Container actions
  CreateContainer = 'create_container',
  UpdateContainer = 'update_container',
  DeleteContainer = 'delete_container',

  // Notification actions
  SendNotification = 'send_notification'
}

export const ActivityLogsActionLabels: Record<ActivityLogsAction, string> = {
  [ActivityLogsAction.CreateUser]: 'Crear Usuario',
  [ActivityLogsAction.UpdateUser]: 'Actualizar Usuario',
  [ActivityLogsAction.DeleteUser]: 'Eliminar Usuario',
  [ActivityLogsAction.CreateOrder]: 'Crear Orden',
  [ActivityLogsAction.UpdateOrder]: 'Actualizar Orden',
  [ActivityLogsAction.DeleteOrder]: 'Eliminar Orden',
  [ActivityLogsAction.AssignOrder]: 'Asignar Orden',
  [ActivityLogsAction.CreateContainer]: 'Crear Contenedor',
  [ActivityLogsAction.UpdateContainer]: 'Actualizar Contenedor',
  [ActivityLogsAction.DeleteContainer]: 'Eliminar Contenedor',
  [ActivityLogsAction.SendNotification]: 'Enviar Notificación'
};

export const ActivityLogsActionIcons: Record<ActivityLogsAction, string> = {
  [ActivityLogsAction.CreateUser]: 'bi-person-plus',
  [ActivityLogsAction.UpdateUser]: 'bi-person-gear',
  [ActivityLogsAction.DeleteUser]: 'bi-person-x',
  [ActivityLogsAction.CreateOrder]: 'bi-plus-square',
  [ActivityLogsAction.UpdateOrder]: 'bi-pencil-square',
  [ActivityLogsAction.DeleteOrder]: 'bi-trash',
  [ActivityLogsAction.AssignOrder]: 'bi-link-45deg',
  [ActivityLogsAction.CreateContainer]: 'bi-box-seam',
  [ActivityLogsAction.UpdateContainer]: 'bi-box-seam',
  [ActivityLogsAction.DeleteContainer]: 'bi-box',
  [ActivityLogsAction.SendNotification]: 'bi-bell'
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

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
 * Convierte un enum en array para selects
 */
export function enumToArray<T extends string>(enumObj: Record<string, T>): Array<{value: T, label: string}> {
  return Object.values(enumObj).map(value => ({
    value,
    label: value
  }));
}

/**
 * Convierte un enum en array con labels
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
