/** Configuración de modo de ejecución de la app. */
export type AppMode = 'dev_local' | 'dev_api';

/**
 * Obtiene el modo actual desde la variable de entorno.
 * Prioridad:
 * 1. import.meta.env.APP_MODE (definido en vite.config.ts via define)
 * 2. import.meta.env.VITE_APP_MODE (desde .env)
 * 3. import.meta.env.MODE (--mode flag de vite)
 * 4. Default: dev_local
 */
export function getAppMode(): AppMode {
  const defineMode = import.meta.env.APP_MODE as AppMode | undefined;
  const envMode = import.meta.env.VITE_APP_MODE as AppMode | undefined;
  const viteMode = import.meta.env.MODE as AppMode | undefined;

  if (defineMode === 'dev_local' || defineMode === 'dev_api') return defineMode;
  if (envMode === 'dev_local' || envMode === 'dev_api') return envMode;
  if (viteMode === 'dev_local' || viteMode === 'dev_api') return viteMode;

  // Default: local (sin API) para desarrollo seguro
  return 'dev_local';
}

export const isApiMode = (): boolean => getAppMode() === 'dev_api';
export const isLocalMode = (): boolean => getAppMode() === 'dev_local';

/** URL base de la API (configurable via VITE_API_URL) */
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
}
