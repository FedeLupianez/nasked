/**
 * Almacenamiento local de archivos adjuntos (demo).
 *
 * - El binario (Blob) vive en IndexedDB, para no depender de la cuota de localStorage.
 * - Los metadatos (nombre, mime, tamaño) viven dentro de la card, en localStorage.
 * - Las URLs de objeto se cachean en memoria para no recrearlas en cada render.
 */

import type { Attachment } from './types';
import { uid } from './utils';

const DB_NAME = 'dash_attachments_v1';
const DB_VERSION = 1;
const STORE = 'files';

export const MAX_ATTACHMENTS = 10;
export const MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024; // 25 MB por archivo

export function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, i);
  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`;
}

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDB(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
    req.onblocked = () => resolve(null);
  });
  return dbPromise;
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T | undefined> {
  return openDB().then(
    (db) =>
      new Promise<T | undefined>((resolve) => {
        if (!db) return resolve(undefined);
        try {
          const req = run(db.transaction(STORE, mode).objectStore(STORE));
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(undefined);
        } catch {
          resolve(undefined);
        }
      })
  );
}

/** Guarda el binario de un archivo ya elegido por el usuario. */
export async function saveAttachment(file: File): Promise<Attachment> {
  const storageKey = uid('att');
  await tx('readwrite', (s) => s.put(file, storageKey));
  return {
    id: storageKey,
    storageKey,
    name: file.name || 'archivo',
    mime: file.type || 'application/octet-stream',
    size: file.size,
    addedAt: new Date().toISOString()
  };
}

export async function deleteAttachment(a: Pick<Attachment, 'storageKey'>) {
  revokeUrl(a.storageKey);
  await tx('readwrite', (s) => s.delete(a.storageKey));
}

const urlCache = new Map<string, string>();

export function revokeUrl(storageKey: string) {
  const url = urlCache.get(storageKey);
  if (url) {
    URL.revokeObjectURL(url);
    urlCache.delete(storageKey);
  }
}

/** Devuelve una object URL para el adjunto (cacheada mientras la vista viva). */
export async function attachmentUrl(a: Attachment): Promise<string | null> {
  const cached = urlCache.get(a.storageKey);
  if (cached) return cached;
  const blob = await tx<Blob>('readonly', (s) => s.get(a.storageKey));
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  urlCache.set(a.storageKey, url);
  return url;
}



export async function clearAllAttachments() {
  urlCache.forEach((url) => URL.revokeObjectURL(url));
  urlCache.clear();
  const db = await openDB();
  if (!db) return;
  db.transaction(STORE, 'readwrite').objectStore(STORE).clear();
}