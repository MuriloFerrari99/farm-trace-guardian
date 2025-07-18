
// Environment configuration for the application
export const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  
  // MinIO Configuration  
  minioUrl: import.meta.env.VITE_MINIO_URL || 'http://localhost:9000',
  
  // Development flags
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // App Configuration
  appName: 'AgroExport Manager',
  version: '1.0.0',
};

// Type definitions for environment variables
declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_MINIO_URL: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
