export const environment = {
    production: false,
    apiBase: 'https://apipreprod.sicegroup.com.uy/api',
    apiUrl: 'https://apipreprod.sicegroup.com.uy/api',
    appName: 'Sice Group Dashboard [PREPROD]',
    upload: {
        maxFileSizeMB: 250,
        chunkSizeMB: 1.5, // Reducido de 5MB a 1.5MB (compatible con límite PHP de 2MB)
        allowedExtensions: ['pdf', 'xlsx', 'xls']
    }
};