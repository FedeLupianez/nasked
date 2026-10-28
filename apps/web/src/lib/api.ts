/** Cliente API simple para modo dev_api. */
import { getApiBaseUrl } from './config';
import type { User, Folder, CardItem, Role } from './types';

const API_BASE = getApiBaseUrl();

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    credentials: 'include',
    ...options
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---- Auth ----
export async function apiLogin(email: string, password: string): Promise<User> {
  return request<User>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function apiRegister(
  name: string,
  email: string,
  password: string,
  role: Role
): Promise<User> {
  return request<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role })
  });
}

export async function apiMe(): Promise<User> {
  return request<User>('/auth/me');
}

export async function apiLogout(): Promise<void> {
  return request<void>('/auth/logout', { method: 'POST' });
}

// ---- Folders ----
export async function apiGetFolders(): Promise<Folder[]> {
  return request<Folder[]>('/folders');
}

export async function apiGetFolder(id: string): Promise<Folder> {
  return request<Folder>(`/folders/${id}`);
}

export async function apiCreateFolder(data: {
  name: string;
  description: string;
  color: string;
  memberIds?: string[];
}): Promise<Folder> {
  return request<Folder>('/folders', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function apiDeleteFolder(id: string): Promise<void> {
  return request<void>(`/folders/${id}`, { method: 'DELETE' });
}

export async function apiJoinFolder(code: string): Promise<Folder> {
  return request<Folder>('/folders/join', {
    method: 'POST',
    body: JSON.stringify({ code })
  });
}

export async function apiLeaveFolder(id: string): Promise<void> {
  return request<void>(`/folders/${id}/leave`, { method: 'POST' });
}

// ---- Cards ----
export async function apiCreateCard(
  folderId: string,
  data: {
    title: string;
    description: string;
    dueDate: string;
    fields: CardItem['fields'];
  }
): Promise<CardItem> {
  return request<CardItem>(`/folders/${folderId}/cards`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function apiUpdateCard(
  folderId: string,
  cardId: string,
  data: Partial<CardItem>
): Promise<CardItem> {
  return request<CardItem>(`/folders/${folderId}/cards/${cardId}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

export async function apiDeleteCard(folderId: string, cardId: string): Promise<void> {
  return request<void>(`/folders/${folderId}/cards/${cardId}`, { method: 'DELETE' });
}

// ---- Users (Admin) ----
export async function apiGetUsers(): Promise<User[]> {
  return request<User[]>('/users');
}

export async function apiUpdateUser(
  id: string,
  data: { name?: string; email?: string; password?: string; role?: Role }
): Promise<User> {
  return request<User>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

export async function apiDeleteUser(id: string): Promise<void> {
  return request<void>(`/users/${id}`, { method: 'DELETE' });
}