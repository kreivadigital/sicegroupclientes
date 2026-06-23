import { environment } from './environment';

const { apiBase } = environment;

export const ApiEndpoints = {
    // ==========================================
    // 🔐 AUTHENTICATION
    // ==========================================
    auth: {
        // POST → Inicia sesión
        login: `${apiBase}/auth/login`,

        // POST → Cierra sesión
        logout: `${apiBase}/auth/logout`,

        password: {
            // POST → Solicita un email con enlace de restablecimiento
            resetRequest: `${apiBase}/auth/password/reset-request`,

            // POST → Restablece la contraseña mediante token
            reset: `${apiBase}/auth/password/reset`,

            // POST → Cambia la contraseña actual (requiere autenticación)
            change: `${apiBase}/auth/password/change`,
        },
    },

    // ==========================================
    // 👤 ADMINS
    // ==========================================
    admins: {
        // GET → Lista todos los administradores
        base: `${apiBase}/admins`,

        // POST → Crea un nuevo administrador
        create: `${apiBase}/admins`,
    },

    // ==========================================
    // 🧾 CLIENTS
    // ==========================================
    clients: {
        // GET → Lista todos los clientes
        base: `${apiBase}/clients`,

        // GET → Lista clientes eliminados (soft delete)
        trashed: `${apiBase}/clients/trashed`,

        // GET → Obtiene un cliente por ID
        byId: (id: number) => `${apiBase}/clients/${id}`,

        // POST → Crea un nuevo cliente
        create: `${apiBase}/clients`,

        // PUT → Actualiza un cliente existente
        update: (id: number) => `${apiBase}/clients/${id}`,

        // DELETE → Elimina (soft delete) un cliente
        delete: (id: number) => `${apiBase}/clients/${id}`,

        // POST → Restaura un cliente eliminado
        restore: (id: number) => `${apiBase}/clients/${id}/restore`,
    },

    // ==========================================
    // 📦 ORDERS
    // ==========================================
    orders: {
        // GET → Lista todas las órdenes (admin)
        base: `${apiBase}/orders`,

        // GET → Lista las órdenes del usuario autenticado
        my: `${apiBase}/orders/my`,

        // GET → Obtiene una orden específica
        byId: (id: number) => `${apiBase}/orders/${id}`,

        // POST → Crea una nueva orden
        create: `${apiBase}/orders`,

        // PUT → Actualiza una orden existente
        update: (id: number) => `${apiBase}/orders/${id}`,

        // DELETE → Elimina (soft delete) una orden
        delete: (id: number) => `${apiBase}/orders/${id}`,

        // POST → Asocia un contenedor a la orden
        attachContainer: (id: number) => `${apiBase}/orders/${id}/attach-container`,

        // DELETE → Desasocia un contenedor de la orden
        detachContainer: (id: number, containerId: number) =>
            `${apiBase}/orders/${id}/detach-container/${containerId}`,
    },

    // ==========================================
    // 🚢 CONTAINERS
    // ==========================================
    containers: {
        // GET → Lista todos los contenedores
        base: `${apiBase}/containers`,

        // GET → Obtiene un contenedor por ID
        byId: (id: number) => `${apiBase}/containers/${id}`,

        // POST → Crea un nuevo contenedor
        create: `${apiBase}/containers`,

        // PUT → Actualiza un contenedor existente
        update: (id: number) => `${apiBase}/containers/${id}`,

        // DELETE → Elimina (soft delete) un contenedor
        delete: (id: number) => `${apiBase}/containers/${id}`,

        // GET → Fuerza actualización con la API de ShipsGo
        refresh: (id: number) => `${apiBase}/containers/${id}/refresh`,

        // POST → Sincroniza masivo los contenedores activos (no DISCHARGED/CANCELLED)
        sync: `${apiBase}/containers/sync`,

        // GET → Devuelve los movimientos del contenedor
        movements: (id: number) => `${apiBase}/containers/${id}/movements`,

        // GET → Estado en vivo del contenedor
        liveStatus: (id: number) => `${apiBase}/containers/${id}/live-status`,
    },

    // ==========================================
    // 🔔 NOTIFICATIONS
    // ==========================================
    notifications: {
        // GET → Lista las notificaciones del usuario autenticado
        base: `${apiBase}/notifications`,

        // POST → Envía una notificación de prueba (admin)
        test: `${apiBase}/notifications/test`,

        // POST → Envía una notificación personalizada (admin)
        send: `${apiBase}/notifications/send`,

        // POST → Marca todas las notificaciones como leídas
        markAllRead: `${apiBase}/notifications/mark-all-read`,

        // PUT → Marca una notificación específica como leída
        markRead: (id: number) => `${apiBase}/notifications/${id}/mark-read`,

        // PUT → Marca una notificación como no leída
        markUnread: (id: number) => `${apiBase}/notifications/${id}/mark-unread`,

        // DELETE → Elimina una notificación
        byId: (id: number) => `${apiBase}/notifications/${id}`,
    },

    // ==========================================
    // 🧠 ACTIVITY LOGS
    // ==========================================
    activityLogs: {
        // GET → Lista todos los logs (admin)
        base: `${apiBase}/activity-logs`,

        // GET → Devuelve estadísticas de logs
        stats: `${apiBase}/activity-logs/stats`,

        // GET → Devuelve la actividad del usuario autenticado
        my: `${apiBase}/activity-logs/my`,

        // GET → Devuelve un log específico
        byId: (id: number) => `${apiBase}/activity-logs/${id}`,

        // POST → Crea un log manualmente
        create: `${apiBase}/activity-logs`,

        // DELETE → Elimina un log permanentemente
        delete: (id: number) => `${apiBase}/activity-logs/${id}`,
    },

    // ==========================================
    // 👤 USER INFO
    // ==========================================
    user: {
        // GET → Devuelve la información del usuario autenticado
        current: `${apiBase}/user`,
    },

    // ==========================================
    // 🌐 WEBHOOKS
    // ==========================================
    webhooks: {
        // POST → Webhook público (ShipsGo)
        shipsgo: `${apiBase}/webhooks/shipsgo`,
    },

    // ==========================================
    // 🧪 TEST ROUTES (Development only)
    // ==========================================
    test: {
        // GET → Ruta de prueba general
        base: `${apiBase}/test`,

        // GET → Ruta de prueba de clientes
        clients: `${apiBase}/clients-test`,

        // POST → Ruta de prueba protegida
        clientsPost: `${apiBase}/clients-test-post`,
    },
};
