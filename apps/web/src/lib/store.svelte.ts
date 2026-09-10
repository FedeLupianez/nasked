import type { Folder, User } from './types';
import { uid, makeFolderCode } from './utils';

const USERS_KEY = 'dash_users_v2';
const FOLDERS_KEY = 'dash_folders_v1';
const SESSION_KEY = 'dash_session_v1';

function seedUsers(): User[] {
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

function seedFolders(): Folder[] {
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

function load<T>(key: string, fallback: () => T): T {
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

function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---- Estado global con runas de Svelte 5 ----
class AppStore {
  users: User[] = $state(load<User[]>(USERS_KEY, seedUsers));
  folders: Folder[] = $state(load<Folder[]>(FOLDERS_KEY, seedFolders));
  currentUserId: string | null = $state(localStorage.getItem(SESSION_KEY));
  view: string = $state('overview');
  selectedFolderId: string | null = $state(null);
  search: string = $state('');

  get currentUser(): User | null {
    return this.users.find((u) => u.id === this.currentUserId) ?? null;
  }
  get isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }
  get visibleFolders(): Folder[] {
    if (!this.currentUser) return [];
    if (this.isAdmin) return this.folders;
    return this.folders.filter(
      (f) =>
        f.memberIds.includes(this.currentUser!.id) ||
        this.currentUser!.joinedFolderIds.includes(f.id)
    );
  }
  get selectedFolder(): Folder | null {
    return this.folders.find((f) => f.id === this.selectedFolderId) ?? null;
  }

  persist() {
    save(USERS_KEY, this.users);
    save(FOLDERS_KEY, this.folders);
    if (this.currentUserId) localStorage.setItem(SESSION_KEY, this.currentUserId);
    else localStorage.removeItem(SESSION_KEY);
  }

  login(email: string, password: string): string | null {
    const cleanEmail = email.toLowerCase().trim();
    const u = this.users.find((x) => x.email.toLowerCase() === cleanEmail);
    if (!u) return 'No existe una cuenta con ese email.';
    // compat: usuarios viejos sin contraseña
    const stored = (u as User).password ?? '';
    if (stored && password !== stored) return 'Contraseña incorrecta.';
    if (!stored && password) {
      // migrar: asignar la ingresada como nueva contraseña
      u.password = password;
    } else if (!stored && !password) {
      return 'Esta cuenta no tiene contraseña. Regístrate de nuevo o ingresa una para migrarla.';
    }
    this.currentUserId = u.id;
    this.view = 'overview';
    this.persist();
    return null;
  }

  register(name: string, email: string, password: string, role: 'USER' | 'ADMIN') {
    if (!name.trim()) return 'El nombre es requerido';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    if (this.users.some((u) => u.email.toLowerCase() === email.toLowerCase().trim()))
      return 'Ese email ya está registrado';
    const colors = ['#171717', '#262626', '#404040', '#525252', '#737373'];
    const user: User = {
      id: uid('u'),
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      avatarColor: colors[this.users.length % colors.length],
      joinedFolderIds: []
    };
    this.users.push(user);
    this.currentUserId = user.id;
    this.view = 'overview';
    this.persist();
    return null;
  }

  quickLogin(role: 'USER' | 'ADMIN') {
    const u = this.users.find((x) => x.role === role) ?? this.users[0];
    this.currentUserId = u.id;
    this.view = 'overview';
    this.persist();
  }

  logout() {
    this.currentUserId = null;
    this.view = 'overview';
    this.selectedFolderId = null;
    this.persist();
  }

  updateAccount(name: string, email: string, newPassword = '') {
    const u = this.currentUser;
    if (!u) return 'Sin sesión';
    if (!name.trim()) return 'El nombre es requerido';
    if (this.users.some((x) => x.id !== u.id && x.email.toLowerCase() === email.toLowerCase().trim()))
      return 'Ese email ya lo usa otra cuenta';
    u.name = name.trim();
    u.email = email.trim();
    if (newPassword) {
      if (newPassword.length < 6) return 'La nueva contraseña debe tener al menos 6 caracteres';
      u.password = newPassword;
    }
    this.persist();
    return null;
  }

  createFolder(name: string, description: string, color: string) {
    if (!name.trim()) return 'El nombre es requerido';
    const folder: Folder = {
      id: uid('f'),
      name: name.trim(),
      description: description.trim(),
      color,
      code: makeFolderCode(name),
      memberIds: [],
      cards: [],
      createdAt: new Date().toISOString()
    };
    this.folders.unshift(folder);
    this.selectedFolderId = folder.id;
    this.view = 'folder-detail';
    this.persist();
    return null;
  }

  deleteFolder(id: string) {
    this.folders = this.folders.filter((f) => f.id !== id);
    for (const u of this.users) u.joinedFolderIds = u.joinedFolderIds.filter((x) => x !== id);
    if (this.selectedFolderId === id) {
      this.selectedFolderId = null;
      this.view = 'folders';
    }
    this.persist();
  }

  joinByCode(code: string): string | null {
    const u = this.currentUser;
    if (!u) return 'Sin sesión';
    const folder = this.folders.find((f) => f.code.toLowerCase() === code.trim().toLowerCase());
    if (!folder) return 'Código inválido. Pide el código al ADMIN.';
    if (!folder.memberIds.includes(u.id)) folder.memberIds.push(u.id);
    if (!u.joinedFolderIds.includes(folder.id)) u.joinedFolderIds.push(folder.id);
    this.selectedFolderId = folder.id;
    this.view = 'folder-detail';
    this.persist();
    return null;
  }

  leaveFolder(id: string) {
    const u = this.currentUser;
    if (!u) return;
    const f = this.folders.find((x) => x.id === id);
    if (f) f.memberIds = f.memberIds.filter((m) => m !== u.id);
    u.joinedFolderIds = u.joinedFolderIds.filter((x) => x !== id);
    if (this.selectedFolderId === id) {
      this.selectedFolderId = null;
      this.view = 'folders';
    }
    this.persist();
  }

  resetDemo() {
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(FOLDERS_KEY);
    this.users = seedUsers();
    this.folders = seedFolders();
    this.view = 'overview';
    this.selectedFolderId = null;
    this.persist();
  }
}

export const store = new AppStore();
