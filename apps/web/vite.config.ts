import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'
  
  // These options were migrated by @nx/vite:convert-to-inferred from the project.json file.
  const configValues = {"default":{}};
  
  // Determine the correct configValue to use based on the configuration
  const nxConfiguration = process.env.NX_TASK_TARGET_CONFIGURATION ?? 'default';
  
  const options = {
    ...configValues.default,
    ...(configValues[nxConfiguration] ?? {})
  }
  

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
})
