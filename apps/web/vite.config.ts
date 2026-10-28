import { svelte } from '@sveltejs/vite-plugin-svelte'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

  // These options were migrated by @nx/vite:convert-to-inferred from the project.json file.
  const configValues = {"default":{}};
  
  // Determine the correct configValue to use based on the configuration
  const nxConfiguration = process.env.NX_TASK_TARGET_CONFIGURATION ?? 'default';
  
  const options = {
    ...configValues.default,
    ...(configValues[nxConfiguration] ?? {})
  }

// El modo viene de Nx configuration (--configuration=local|api) o fallback a env
const appMode = options.mode ?? process.env.NODE_ENV ?? process.env.VITE_APP_MODE ?? 'dev_local';

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  // El .env vive en la raiz del workspace, no en apps/web.
  envDir: fileURLToPath(new URL('../../', import.meta.url)),
  // Exponemos VITE_* y NODE_ENV al bundle
  envPrefix: ['VITE_', 'NODE_ENV'],
  // Modo de Vite (dev_local | dev_api) - controla import.meta.env.MODE
  mode: appMode,
  // Exponer el modo a la app
  define: {
    'import.meta.env.APP_MODE': JSON.stringify(appMode)
  }
})