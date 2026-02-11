export const environment = {
    production: false,
    apiBase: 'https://api.sicegroup.com.uy/api', // TODO: Actualizar con la URL real de staging
    apiUrl: 'https://api.sicegroup.com.uy/api',
    appName: 'Sice Group Dashboard [STAGING]',
    upload: {
        maxFileSizeMB: 250,
        chunkSizeMB: 1.5, // Reducido de 5MB a 1.5MB (compatible con límite PHP de 2MB)
        allowedExtensions: ['pdf', 'xlsx', 'xls']
    }
};