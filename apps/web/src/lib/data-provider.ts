/** Proveedor de datos abstracto para soportar modo local y API. */
import type { User, Folder, CardItem, Role } from './types';
import { uid, makeFolderCode } from './utils';
import { isApiMode } from './config';
import * as api from './api';

export interface DataProvider {
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | null>;
  createUser(data: { name: string; email: string; password: string; role: Role }): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  login(email: string, password: string): Promise<User>;
  register(data: { name: string; email: string; password: string; role: Role }): Promise<User>;

  // Folders
  getFolders(): Promise<Folder[]>;
  getFolder(id: string): Promise<Folder | null>;
  createFolder(data: { name: string; description: string; color: string; memberIds?: string[] }): Promise<Folder>;
  updateFolder(id: string, data: Partial<Folder>): Promise<Folder>;
  deleteFolder(id: string): Promise<void>;
  joinFolder(code: string): Promise<Folder>;
  leaveFolder(id: string): Promise<void>;

  // Cards
  createCard(folderId: string, data: { title: string; description: string; dueDate: string; fields: CardItem['fields'] }): Promise<CardItem>;
  updateCard(folderId: string, cardId: string, data: Partial<CardItem>): Promise<CardItem>;
  deleteCard(folderId: string, cardId: string): Promise<void>;

  // Session / misc
  getSession(): Promise<string | null>;
  setSession(userId: string | null): Promise<void>;
}

/** Proveedor local (localStorage) - implementación actual. */
class LocalDataProvider implements DataProvider {
  private USERS_KEY = 'dash_users_v2';
  private FOLDERS_KEY = 'dash_folders_v1';
  private SESSION_KEY = 'dash_session_v1';

  private seedUsers(): User[] {
    return [
      {
        id: 'u_admin',
        name: 'Ada Admin',
        email: 'admin@demo.io',
        password: 'admin123',
        role: 'ADMIN',
        avatarColor: '#262626',
        joinedFolderIds: []
      },
      {
        id: 'u_user',
        name: 'Bruno Usuario',
        email: 'bruno@demo.io',
        password: 'bruno123',
        role: 'USER',
        avatarColor: '#525252',
        joinedFolderIds: ['f_matematicas']
      }
    ];
  }

  private seedFolders(): Folder[] {
    const now = Date.now();
    const inHours = (h: number) => new Date(now + h * 3600 * 1000).toISOString();
    return [
      {
        id: 'f_matematicas',
        name: 'Matemáticas 2026',
        description: 'Actividades y entregas del curso. Únete con el código.',
        color: '#d4d4d4',
        code: 'MATE-2026',
        memberIds: ['u_user'],
        createdAt: new Date(now - 10 * 86400000).toISOString(),
        cards: [
          {
            id: 'c_1',
            title: 'Examen parcial — Álgebra',
            description: 'Llevar calculadora y repasar matrices.',
            dueDate: inHours(26),
            createdAt: new Date(now - 2 * 86400000).toISOString(),
            fields: [
              { id: uid('f'), label: 'Aula', type: 'TEXT', value: 'B-204' },
              { id: uid('f'), label: 'Puntaje máximo', type: 'NUMBER', value: '100' },
              { id: uid('f'), label: 'Fecha repaso', type: 'DATE', value: '2026-09-11' },
              { id: uid('f'), label: 'Hora inicio', type: 'TIME', value: '09:00' }
            ]
          },
          {
            id: 'c_2',
            title: 'Entrega TP integrador',
            description: 'Subir PDF + código fuente.',
            dueDate: inHours(5),
            createdAt: new Date(now - 86400000).toISOString(),
            fields: [
              { id: uid('f'), label: 'Formato', type: 'TEXT', value: 'PDF + ZIP' },
              { id: uid('f'), label: 'Páginas mínimas', type: 'NUMBER', value: '12' }
            ]
          },
          {
            id: 'c_3',
            title: 'Recuperatorio',
            description: 'Solo para ausentes con certificado.',
            dueDate: inHours(-30),
            createdAt: new Date(now - 5 * 86400000).toISOString(),
            fields: [{ id: uid('f'), label: 'Requisito', type: 'TEXT', value: 'Certificado médico' }]
          }
        ]
      },
      {
        id: 'f_laboratorio',
        name: 'Laboratorio / Proyectos',
        description: 'Tablero de ejemplo creado por ADMIN.',
        color: '#737373',
        code: 'LABO-X7K2',
        memberIds: [],
        createdAt: new Date(now - 4 * 86400000).toISOString(),
        cards: [
          {
            id: 'c_4',
            title: 'Demo de ciencias',
            description: 'Preparar maqueta y slides.',
            dueDate: inHours(90),
            createdAt: new Date(now - 86400000).toISOString(),
            fields: [
              { id: uid('f'), label: 'Integrantes', type: 'NUMBER', value: '4' },
              { id: uid('f'), label: 'Día de exposición', type: 'DATE', value: '2026-09-14' }
            ]
          }
        ]
      }
    ];
  }

  private load<T>(key: string, fallback: () => T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        const v = fallback();
        localStorage.setItem(key, JSON.stringify(v));
        return v;
      }
      return JSON.parse(raw) as T;
    } catch {
      return fallback();
    }
  }

  private save(key: string, value: unknown) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  private getUsersStorage(): User[] {
    return this.load<User[]>(this.USERS_KEY, this.seedUsers);
  }

  private getFoldersStorage(): Folder[] {
    return this.load<Folder[]>(this.FOLDERS_KEY, this.seedFolders);
  }

  private saveUsers(users: User[]) {
    this.save(this.USERS_KEY, users);
  }

  private saveFolders(folders: Folder[]) {
    this.save(this.FOLDERS_KEY, folders);
  }

  async getUsers(): Promise<User[]> {
    return this.getUsersStorage();
  }

  async getUser(id: string): Promise<User | null> {
    const users = this.getUsersStorage();
    return users.find(u => u.id === id) ?? null;
  }

  async createUser(data: { name: string; email: string; password: string; role: Role }): Promise<User> {
    const users = this.getUsersStorage();
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase().trim())) {
      throw new Error('Ese email ya está registrado');
    }
    const colors = ['#171717', '#262626', '#404040', '#525252', '#737373'];
    const user: User = {
      id: uid('u'),
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password,
      role: data.role,
      avatarColor: colors[users.length % colors.length],
      joinedFolderIds: []
    };
    users.push(user);
    this.saveUsers(users);
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const users = this.getUsersStorage();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('Usuario no encontrado');
    users[idx] = { ...users[idx], ...data };
    this.saveUsers(users);
    return users[idx];
  }

  async deleteUser(id: string): Promise<void> {
    const users = this.getUsersStorage().filter(u => u.id !== id);
    this.saveUsers(users);
  }

  async login(email: string, password: string): Promise<User> {
    const users = this.getUsersStorage();
    const cleanEmail = email.toLowerCase().trim();
    const u = users.find(x => x.email.toLowerCase() === cleanEmail);
    if (!u) throw new Error('No existe una cuenta con ese email.');
    const stored = u.password ?? '';
    if (stored && password !== stored) throw new Error('Contraseña incorrecta.');
    if (!stored && password) {
      u.password = password;
      this.saveUsers(users);
    } else if (!stored && !password) {
      throw new Error('Esta cuenta no tiene contraseña. Regístrate de nuevo o ingresa una para migrarla.');
    }
    return u;
  }

  async register(data: { name: string; email: string; password: string; role: Role }): Promise<User> {
    return this.createUser(data);
  }

  async getFolders(): Promise<Folder[]> {
    return this.getFoldersStorage();
  }

  async getFolder(id: string): Promise<Folder | null> {
    const folders = this.getFoldersStorage();
    return folders.find(f => f.id === id) ?? null;
  }

  async createFolder(data: { name: string; description: string; color: string; memberIds?: string[] }): Promise<Folder> {
    const folders = this.getFoldersStorage();
    const users = this.getUsersStorage();
    const folder: Folder = {
      id: uid('f'),
      name: data.name.trim(),
      description: data.description.trim(),
      color: data.color,
      code: makeFolderCode(data.name),
      memberIds: data.memberIds ?? [],
      cards: [],
      createdAt: new Date().toISOString()
    };
    folders.unshift(folder);
    for (const uid of data.memberIds ?? []) {
      const u = users.find(x => x.id === uid);
      if (u && !u.joinedFolderIds.includes(folder.id)) u.joinedFolderIds.push(folder.id);
    }
    this.saveFolders(folders);
    this.saveUsers(users);
    return folder;
  }

  async updateFolder(id: string, data: Partial<Folder>): Promise<Folder> {
    const folders = this.getFoldersStorage();
    const idx = folders.findIndex(f => f.id === id);
    if (idx === -1) throw new Error('Carpeta no encontrada');
    folders[idx] = { ...folders[idx], ...data };
    this.saveFolders(folders);
    return folders[idx];
  }

  async deleteFolder(id: string): Promise<void> {
    const folders = this.getFoldersStorage().filter(f => f.id !== id);
    const users = this.getUsersStorage().map(u => ({
      ...u,
      joinedFolderIds: u.joinedFolderIds.filter(x => x !== id)
    }));
    this.saveFolders(folders);
    this.saveUsers(users);
  }

  async joinFolder(code: string): Promise<Folder> {
    const folders = this.getFoldersStorage();
    const users = this.getUsersStorage();
    // Note: currentUser would need to be passed or we use a different approach
    // This is a limitation - the provider doesn't know current user
    // We'll handle this in the store instead
    throw new Error('joinFolder not implemented in LocalDataProvider - use store.joinByCode');
  }

  async leaveFolder(id: string): Promise<void> {
    throw new Error('leaveFolder not implemented in LocalDataProvider - use store.leaveFolder');
  }

  async createCard(folderId: string, data: { title: string; description: string; dueDate: string; fields: CardItem['fields'] }): Promise<CardItem> {
    const folders = this.getFoldersStorage();
    const folder = folders.find(f => f.id === folderId);
    if (!folder) throw new Error('Carpeta no encontrada');
    const card: CardItem = {
      id: uid('c'),
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      fields: data.fields,
      createdAt: new Date().toISOString()
    };
    folder.cards.unshift(card);
    this.saveFolders(folders);
    return card;
  }

  async updateCard(folderId: string, cardId: string, data: Partial<CardItem>): Promise<CardItem> {
    const folders = this.getFoldersStorage();
    const folder = folders.find(f => f.id === folderId);
    if (!folder) throw new Error('Carpeta no encontrada');
    const idx = folder.cards.findIndex(c => c.id === cardId);
    if (idx === -1) throw new Error('Tarjeta no encontrada');
    folder.cards[idx] = { ...folder.cards[idx], ...data };
    this.saveFolders(folders);
    return folder.cards[idx];
  }

  async deleteCard(folderId: string, cardId: string): Promise<void> {
    const folders = this.getFoldersStorage();
    const folder = folders.find(f => f.id === folderId);
    if (!folder) throw new Error('Carpeta no encontrada');
    folder.cards = folder.cards.filter(c => c.id !== cardId);
    this.saveFolders(folders);
  }

  async getSession(): Promise<string | null> {
    return localStorage.getItem(this.SESSION_KEY);
  }

  async setSession(userId: string | null): Promise<void> {
    if (userId) localStorage.setItem(this.SESSION_KEY, userId);
    else localStorage.removeItem(this.SESSION_KEY);
  }
}

/** Proveedor API - llama al backend. */
class ApiDataProvider implements DataProvider {
  async getUsers(): Promise<User[]> {
    return api.apiGetUsers();
  }

  async getUser(id: string): Promise<User | null> {
    // API might not have single user endpoint, fetch all and filter
    const users = await this.getUsers();
    return users.find(u => u.id === id) ?? null;
  }

  async createUser(data: { name: string; email: string; password: string; role: Role }): Promise<User> {
    return api.apiRegister(data.name, data.email, data.password, data.role);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return api.apiUpdateUser(id, data);
  }

  async deleteUser(id: string): Promise<void> {
    return api.apiDeleteUser(id);
  }

  async login(email: string, password: string): Promise<User> {
    return api.apiLogin(email, password);
  }

  async register(data: { name: string; email: string; password: string; role: Role }): Promise<User> {
    return api.apiRegister(data.name, data.email, data.password, data.role);
  }

  async getFolders(): Promise<Folder[]> {
    return api.apiGetFolders();
  }

  async getFolder(id: string): Promise<Folder | null> {
    try {
      return await api.apiGetFolder(id);
    } catch {
      return null;
    }
  }

  async createFolder(data: { name: string; description: string; color: string; memberIds?: string[] }): Promise<Folder> {
    return api.apiCreateFolder(data);
  }

  async updateFolder(id: string, data: Partial<Folder>): Promise<Folder> {
    // API might not have update folder, fallback
    const folder = await this.getFolder(id);
    if (!folder) throw new Error('Carpeta no encontrada');
    return { ...folder, ...data };
  }

  async deleteFolder(id: string): Promise<void> {
    return api.apiDeleteFolder(id);
  }

  async joinFolder(code: string): Promise<Folder> {
    return api.apiJoinFolder(code);
  }

  async leaveFolder(id: string): Promise<void> {
    return api.apiLeaveFolder(id);
  }

  async createCard(folderId: string, data: { title: string; description: string; dueDate: string; fields: CardItem['fields'] }): Promise<CardItem> {
    return api.apiCreateCard(folderId, data);
  }

  async updateCard(folderId: string, cardId: string, data: Partial<CardItem>): Promise<CardItem> {
    return api.apiUpdateCard(folderId, cardId, data);
  }

  async deleteCard(folderId: string, cardId: string): Promise<void> {
    return api.apiDeleteCard(folderId, cardId);
  }

  async getSession(): Promise<string | null> {
    // Session handled by cookies in API mode
    return null;
  }

  async setSession(userId: string | null): Promise<void> {
    // Session handled by cookies in API mode
  }
}

/** Instancia singleton del proveedor activo. */
let providerInstance: DataProvider | null = null;

export function getDataProvider(): DataProvider {
  if (!providerInstance) {
    providerInstance = isApiMode() ? new ApiDataProvider() : new LocalDataProvider();
  }
  return providerInstance;
}

// Para testing o cambio dinámico (no recomendado en producción)
export function setDataProvider(provider: DataProvider) {
  providerInstance = provider;
}