import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { config as loadEnvFile } from 'dotenv';

const WORKSPACE_MARKERS = ['nx.json', 'package.json'];

function findWorkspaceRoot(startDir: string): string | undefined {
  let current = resolve(startDir);

  while (true) {
    if (WORKSPACE_MARKERS.some((marker) => existsSync(join(current, marker)))) {
      return current;
    }

    const parent = dirname(current);
    if (parent === current) {
      return undefined;
    }

    current = parent;
  }
}

/**
 * El .env vive en la raiz del workspace, no junto al codigo. Sin esto, tanto
 * Nest como el typeorm CLI dependerian del cwd desde el que se lanzo el proceso.
 */
export const workspaceRoot = findWorkspaceRoot(__dirname) ?? process.cwd();

export const rootEnvPath = join(workspaceRoot, '.env');

/**
 * Carga el .env de la raiz sin sobreescribir variables ya presentes en el
 * entorno, para que en Docker/CI manden las variables reales del proceso.
 * No falla si el archivo no existe: ahi se depende enteramente de process.env.
 */
export function loadRootEnv(): void {
  if (!existsSync(rootEnvPath)) {
    return;
  }

  loadEnvFile({ path: rootEnvPath });
}