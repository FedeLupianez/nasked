export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function makeFolderCode(name: string): string {
  const base = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 4)
    .toUpperCase()
    .padEnd(4, 'X');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}-${rand}`;
}

export type DueStatus = 'overdue' | 'urgent' | 'soon' | 'ok';

export interface DueInfo {
  label: string;
  short: string;
  status: DueStatus;
  diffMs: number;
}

export function getDueInfo(dueISO: string, nowMs = Date.now()): DueInfo {
  const due = new Date(dueISO).getTime();
  const diffMs = due - nowMs;
  const abs = Math.abs(diffMs);

  const mins = Math.floor(abs / 60000);
  const hours = Math.floor(abs / 3600000);
  const days = Math.floor(abs / 86400000);
  const remH = Math.floor((abs % 86400000) / 3600000);
  const remM = Math.floor((abs % 3600000) / 60000);
  const remS = Math.floor((abs % 60000) / 1000);

  let short = '';
  if (days > 0) short = `${days}d ${remH}h`;
  else if (hours > 0) short = `${hours}h ${remM}m`;
  else if (mins > 0) short = `${mins}m ${remS}s`;
  else short = `${remS}s`;

  if (diffMs < 0) {
    let ago = short;
    return {
      label: `Vencida hace ${ago}`,
      short: `-${ago}`,
      status: 'overdue',
      diffMs
    };
  }

  let status: DueStatus = 'ok';
  if (diffMs < 24 * 3600 * 1000) status = 'urgent';
  else if (diffMs < 72 * 3600 * 1000) status = 'soon';

  let label = `Quedan ${days > 0 ? `${days}d ` : ''}${remH}h ${remM}m ${remS}s`;
  if (days > 7) {
    const d = new Date(dueISO);
    label = `Vence el ${d.toLocaleDateString()} (${days} días)`;
  }

  return { label, short, status, diffMs };
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export const FIELD_TYPE_LABEL: Record<string, string> = {
  TEXT: 'Texto',
  NUMBER: 'Número',
  DATE: 'Fecha',
  TIME: 'Hora'
};

export const FOLDER_COLORS = [
  '#f5f5f5',
  '#d4d4d4',
  '#a3a3a3',
  '#737373',
  '#525252',
  '#404040',
  '#ffffff',
  '#171717'
];
