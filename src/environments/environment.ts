export const environment = {
    production: false,
    apiBase: 'http://localhost:8000/api',
    apiUrl: 'http://localhost:8000/api',
    appName: 'Sice Group Dashboard',
    upload: {
        maxFileSizeMB: 250,
        chunkSizeMB: 1.5, // Reducido de 5MB a 1.5MB (compatible con límite PHP de 2MB)
        allowedExtensions: ['pdf', 'xlsx', 'xls']
    }
};
