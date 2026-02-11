export const environment = {
    production: true,
    apiBase: 'https://api.sicegroup.com/api', // TODO: Actualizar con la URL real de producción
    apiUrl: 'https://api.sicegroup.com/api',
    appName: 'Sice Group Dashboard',
    upload: {
        maxFileSizeMB: 250,
        chunkSizeMB: 1.5, // Reducido de 5MB a 1.5MB (compatible con límite PHP de 2MB)
        allowedExtensions: ['pdf', 'xlsx', 'xls']
    }
};
