/** Store principal de la app - usa DataProvider para modo local/API. */
import type { Folder, User } from './types';
import { uid, makeFolderCode } from './utils';
import { deleteAttachment, clearAllAttachments } from './attachments';
import { getDataProvider } from './data-provider';
import { isApiMode } from './config';

const SESSION_KEY = 'dash_session_v1';
const THEME_KEY = 'dash_theme_v1';
const HOME_BANNER_KEY = 'dash_home_banner_v1';
const HOME_BANNER_POS_KEY = 'dash_home_banner_pos_v1';
const REVIEWS_KEY = 'dash_reviewed_notifs_v1';

class AppStore {
  // Estado reactivo
  users: User[] = $state([]);
  folders: Folder[] = $state([]);
  currentUserId: string | null = $state(null);
  theme: 'dark' | 'light' = $state('dark');
  homeBannerUrl: string = $state('');
  homeBannerPos: number = $state(50);
  view: string = $state('overview');
  selectedFolderId: string | null = $state(null);
  search: string = $state('');
  reviewedNotifIds: string[] = $state([]);
  highlightCardId: string | null = $state(null);

  // Computed
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

  // Inicialización
  async init() {
    const provider = getDataProvider();
    
    // Cargar datos iniciales
    if (isApiMode()) {
      // En modo API: cargar del servidor
      try {
        const [users, folders, session] = await Promise.all([
          provider.getUsers(),
          provider.getFolders(),
          provider.getSession()
        ]);
        this.users = users;
        this.folders = folders;
        this.currentUserId = session;
      } catch {
        // Fallback a demo si falla la API
        this.loadDemoData();
      }
    } else {
      // Modo local: cargar de localStorage
      this.loadLocalData();
    }

    // Cargar preferencias UI (siempre localStorage)
    this.theme = (localStorage.getItem(THEME_KEY) as 'dark' | 'light') ?? 'dark';
    this.homeBannerUrl = localStorage.getItem(HOME_BANNER_KEY) ?? '';
    this.homeBannerPos = Number(localStorage.getItem(HOME_BANNER_POS_KEY)) || 50;
    try {
      this.reviewedNotifIds = JSON.parse(localStorage.getItem(REVIEWS_KEY) ?? '[]');
    } catch {
      this.reviewedNotifIds = [];
    }
  }

  private loadLocalData() {
    const provider = getDataProvider() as any; // LocalDataProvider
    // Acceso directo a localStorage para seeds
    const USERS_KEY = 'dash_users_v2';
    const FOLDERS_KEY = 'dash_folders_v1';
    
    function seedUsers(): User[] {
      return [
        { id: 'u_admin', name: 'Ada Admin', email: 'admin@demo.io', password: 'admin123', role: 'ADMIN', avatarColor: '#262626', joinedFolderIds: [] },
        { id: 'u_user', name: 'Bruno Usuario', email: 'bruno@demo.io', password: 'bruno123', role: 'USER', avatarColor: '#525252', joinedFolderIds: ['f_matematicas'] }
      ];
    }

    function seedFolders(): Folder[] {
      const now = Date.now();
      const inHours = (h: number) => new Date(now + h * 3600 * 1000).toISOString();
      return [
        {
          id: 'f_matematicas', name: 'Matemáticas 2026', description: 'Actividades y entregas del curso. Únete con el código.',
          color: '#d4d4d4', code: 'MATE-2026', memberIds: ['u_user'], createdAt: new Date(now - 10 * 86400000).toISOString(),
          cards: [
            { id: 'c_1', title: 'Examen parcial — Álgebra', description: 'Llevar calculadora y repasar matrices.', dueDate: inHours(26), createdAt: new Date(now - 2 * 86400000).toISOString(), fields: [{ id: uid('f'), label: 'Aula', type: 'TEXT', value: 'B-204' }, { id: uid('f'), label: 'Puntaje máximo', type: 'NUMBER', value: '100' }, { id: uid('f'), label: 'Fecha repaso', type: 'DATE', value: '2026-09-11' }, { id: uid('f'), label: 'Hora inicio', type: 'TIME', value: '09:00' }] },
            { id: 'c_2', title: 'Entrega TP integrador', description: 'Subir PDF + código fuente.', dueDate: inHours(5), createdAt: new Date(now - 86400000).toISOString(), fields: [{ id: uid('f'), label: 'Formato', type: 'TEXT', value: 'PDF + ZIP' }, { id: uid('f'), label: 'Páginas mínimas', type: 'NUMBER', value: '12' }] },
            { id: 'c_3', title: 'Recuperatorio', description: 'Solo para ausentes con certificado.', dueDate: inHours(-30), createdAt: new Date(now - 5 * 86400000).toISOString(), fields: [{ id: uid('f'), label: 'Requisito', type: 'TEXT', value: 'Certificado médico' }] }
          ]
        },
        {
          id: 'f_laboratorio', name: 'Laboratorio / Proyectos', description: 'Tablero de ejemplo creado por ADMIN.',
          color: '#737373', code: 'LABO-X7K2', memberIds: [], createdAt: new Date(now - 4 * 86400000).toISOString(),
          cards: [{ id: 'c_4', title: 'Demo de ciencias', description: 'Preparar maqueta y slides.', dueDate: inHours(90), createdAt: new Date(now - 86400000).toISOString(), fields: [{ id: uid('f'), label: 'Integrantes', type: 'NUMBER', value: '4' }, { id: uid('f'), label: 'Día de exposición', type: 'DATE', value: '2026-09-14' }] }]
        }
      ];
    }

    function load<T>(key: string, fallback: () => T): T {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) { const v = fallback(); localStorage.setItem(key, JSON.stringify(v)); return v; }
        return JSON.parse(raw) as T;
      } catch { return fallback(); }
    }

    function save(key: string, value: unknown) { localStorage.setItem(key, JSON.stringify(value)); }

    function ensureSeeds(users: User[], folders: Folder[]): { users: User[]; folders: Folder[] } {
      const hasDemoUsers = Array.isArray(users) && users.some((u) => u.email === 'admin@demo.io');
      if (!hasDemoUsers || !Array.isArray(users) || users.length === 0) users = seedUsers();
      if (!Array.isArray(folders) || folders.length === 0) folders = seedFolders();
      return { users, folders };
    }

    const u = load<User[]>(USERS_KEY, seedUsers);
    const f = load<Folder[]>(FOLDERS_KEY, seedFolders);
    const fixed = ensureSeeds(u, f);
    save(USERS_KEY, fixed.users);
    save(FOLDERS_KEY, fixed.folders);
    
    this.users = fixed.users;
    this.folders = fixed.folders;
    this.currentUserId = localStorage.getItem(SESSION_KEY);
  }

  private loadDemoData() {
    // Datos de demo para fallback en modo API
    this.users = [
      { id: 'u_admin', name: 'Ada Admin', email: 'admin@demo.io', password: 'admin123', role: 'ADMIN', avatarColor: '#262626', joinedFolderIds: [] },
      { id: 'u_user', name: 'Bruno Usuario', email: 'bruno@demo.io', password: 'bruno123', role: 'USER', avatarColor: '#525252', joinedFolderIds: ['f_matematicas'] }
    ];
    const now = Date.now();
    const inHours = (h: number) => new Date(now + h * 3600 * 1000).toISOString();
    this.folders = [
      {
        id: 'f_matematicas', name: 'Matemáticas 2026', description: 'Actividades y entregas del curso. Únete con el código.',
        color: '#d4d4d4', code: 'MATE-2026', memberIds: ['u_user'], createdAt: new Date(now - 10 * 86400000).toISOString(),
        cards: [
          { id: 'c_1', title: 'Examen parcial — Álgebra', description: 'Llevar calculadora y repasar matrices.', dueDate: inHours(26), createdAt: new Date(now - 2 * 86400000).toISOString(), fields: [{ id: uid('f'), label: 'Aula', type: 'TEXT', value: 'B-204' }, { id: uid('f'), label: 'Puntaje máximo', type: 'NUMBER', value: '100' }, { id: uid('f'), label: 'Fecha repaso', type: 'DATE', value: '2026-09-11' }, { id: uid('f'), label: 'Hora inicio', type: 'TIME', value: '09:00' }] },
          { id: 'c_2', title: 'Entrega TP integrador', description: 'Subir PDF + código fuente.', dueDate: inHours(5), createdAt: new Date(now - 86400000).toISOString(), fields: [{ id: uid('f'), label: 'Formato', type: 'TEXT', value: 'PDF + ZIP' }, { id: uid('f'), label: 'Páginas mínimas', type: 'NUMBER', value: '12' }] },
          { id: 'c_3', title: 'Recuperatorio', description: 'Solo para ausentes con certificado.', dueDate: inHours(-30), createdAt: new Date(now - 5 * 86400000).toISOString(), fields: [{ id: uid('f'), label: 'Requisito', type: 'TEXT', value: 'Certificado médico' }] }
        ]
      }
    ];
  }

  // Persistencia de preferencias UI (siempre localStorage)
  persistUI() {
    localStorage.setItem(THEME_KEY, this.theme);
    if (this.homeBannerUrl) localStorage.setItem(HOME_BANNER_KEY, this.homeBannerUrl);
    else localStorage.removeItem(HOME_BANNER_KEY);
    localStorage.setItem(HOME_BANNER_POS_KEY, String(this.homeBannerPos));
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(this.reviewedNotifIds));
  }

  // En modo local, persistir datos también
  persistLocalData() {
    if (!isApiMode()) {
      localStorage.setItem('dash_users_v2', JSON.stringify(this.users));
      localStorage.setItem('dash_folders_v1', JSON.stringify(this.folders));
      if (this.currentUserId) localStorage.setItem(SESSION_KEY, this.currentUserId);
      else localStorage.removeItem(SESSION_KEY);
    }
  }

  // ---- UI Actions ----
  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.persistUI();
  }

  setHomeBanner(url: string) {
    this.homeBannerUrl = url.trim();
    this.persistUI();
  }

  setHomeBannerPos(pos: number) {
    this.homeBannerPos = Math.min(100, Math.max(0, Math.round(pos)));
    this.persistUI();
  }

  setFolderBanner(id: string, url: string) {
    const f = this.folders.find((x) => x.id === id);
    if (!f) return;
    f.bannerUrl = url.trim() || undefined;
    this.persistLocalData();
  }

  // ---- Auth Actions ----
  async login(email: string, password: string): Promise<string | null> {
    try {
      const provider = getDataProvider();
      const user = await provider.login(email, password);
      this.currentUserId = user.id;
      await provider.setSession(user.id);
      this.view = 'overview';
      this.persistLocalData();
      return null;
    } catch (e: any) {
      return e.message;
    }
  }

  async register(name: string, email: string, password: string, role: 'USER' | 'ADMIN'): Promise<string | null> {
    if (!name.trim()) return 'El nombre es requerido';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    if (this.users.some((u) => u.email.toLowerCase() === email.toLowerCase().trim()))
      return 'Ese email ya está registrado';
    try {
      const provider = getDataProvider();
      const user = await provider.register({ name, email, password, role });
      this.users.push(user);
      this.currentUserId = user.id;
      await provider.setSession(user.id);
      this.view = 'overview';
      this.persistLocalData();
      return null;
    } catch (e: any) {
      return e.message;
    }
  }

  quickLogin(role: 'USER' | 'ADMIN') {
    const u = this.users.find((x) => x.role === role) ?? this.users[0];
    this.currentUserId = u.id;
    this.view = 'overview';
    this.persistLocalData();
  }

  async logout() {
    const provider = getDataProvider();
    try {
      await provider.setSession(null);
      if (isApiMode()) await (provider as any).logout?.();
    } catch {}
    this.currentUserId = null;
    this.view = 'overview';
    this.selectedFolderId = null;
    this.persistLocalData();
  }

  async updateAccount(name: string, email: string, newPassword = ''): Promise<string | null> {
    const u = this.currentUser;
    if (!u) return 'Sin sesión';
    if (!name.trim()) return 'El nombre es requerido';
    if (this.users.some((x) => x.id !== u.id && x.email.toLowerCase() === email.toLowerCase().trim()))
      return 'Ese email ya lo usa otra cuenta';
    try {
      const provider = getDataProvider();
      const updated = await provider.updateUser(u.id, { name: name.trim(), email: email.trim(), ...(newPassword ? { password: newPassword } : {}) });
      Object.assign(u, updated);
      this.persistLocalData();
      return null;
    } catch (e: any) {
      return e.message;
    }
  }

  // ---- Folder Actions ----
  async createFolder(name: string, description: string, color: string, memberIds: string[] = []): Promise<string | null> {
    if (!name.trim()) return 'El nombre es requerido';
    try {
      const provider = getDataProvider();
      const folder = await provider.createFolder({ name, description, color, memberIds });
      this.folders.unshift(folder);
      // update joinedFolderIds for members
      for (const uid of memberIds) {
        const u = this.users.find((x) => x.id === uid);
        if (u && !u.joinedFolderIds.includes(folder.id)) u.joinedFolderIds.push(folder.id);
      }
      this.selectedFolderId = folder.id;
      this.view = 'folder-detail';
      this.persistLocalData();
      return null;
    } catch (e: any) {
      return e.message;
    }
  }

  async deleteFolder(id: string): Promise<void> {
    const folder = this.folders.find((f) => f.id === id);
    if (folder) {
      for (const card of folder.cards) {
        for (const a of card.attachments ?? []) void deleteAttachment(a);
      }
    }
    try {
      const provider = getDataProvider();
      await provider.deleteFolder(id);
    } catch {}
    this.folders = this.folders.filter((f) => f.id !== id);
    for (const u of this.users) u.joinedFolderIds = u.joinedFolderIds.filter((x) => x !== id);
    if (this.selectedFolderId === id) {
      this.selectedFolderId = null;
      this.view = 'folders';
    }
    this.persistLocalData();
  }

  async joinByCode(code: string): Promise<string | null> {
    const u = this.currentUser;
    if (!u) return 'Sin sesión';
    try {
      const provider = getDataProvider();
      const folder = await provider.joinFolder(code);
      // Update local state
      const existingIdx = this.folders.findIndex(f => f.id === folder.id);
      if (existingIdx >= 0) this.folders[existingIdx] = folder;
      else this.folders.push(folder);
      
      if (!folder.memberIds.includes(u.id)) folder.memberIds.push(u.id);
      if (!u.joinedFolderIds.includes(folder.id)) u.joinedFolderIds.push(folder.id);
      this.selectedFolderId = folder.id;
      this.view = 'folder-detail';
      this.persistLocalData();
      return null;
    } catch (e: any) {
      return e.message || 'Código inválido. Pide el código al ADMIN.';
    }
  }

  async leaveFolder(id: string): Promise<void> {
    const u = this.currentUser;
    if (!u) return;
    try {
      const provider = getDataProvider();
      await provider.leaveFolder(id);
    } catch {}
    const f = this.folders.find((x) => x.id === id);
    if (f) f.memberIds = f.memberIds.filter((m) => m !== u.id);
    u.joinedFolderIds = u.joinedFolderIds.filter((x) => x !== id);
    if (this.selectedFolderId === id) {
      this.selectedFolderId = null;
      this.view = 'folders';
    }
    this.persistLocalData();
  }

  // ---- Card Actions ----
  async createCard(folderId: string, data: { title: string; description: string; dueDate: string; fields: any[] }): Promise<string | null> {
    try {
      const provider = getDataProvider();
      const card = await provider.createCard(folderId, data);
      const folder = this.folders.find(f => f.id === folderId);
      if (folder) folder.cards.unshift(card);
      this.persistLocalData();
      return null;
    } catch (e: any) {
      return e.message;
    }
  }

  async updateCard(folderId: string, cardId: string, data: any): Promise<string | null> {
    try {
      const provider = getDataProvider();
      const card = await provider.updateCard(folderId, cardId, data);
      const folder = this.folders.find(f => f.id === folderId);
      if (folder) {
        const idx = folder.cards.findIndex(c => c.id === cardId);
        if (idx >= 0) folder.cards[idx] = card;
      }
      this.persistLocalData();
      return null;
    } catch (e: any) {
      return e.message;
    }
  }

  async deleteCard(folderId: string, cardId: string): Promise<void> {
    try {
      const provider = getDataProvider();
      await provider.deleteCard(folderId, cardId);
    } catch {}
    const folder = this.folders.find(f => f.id === folderId);
    if (folder) folder.cards = folder.cards.filter(c => c.id !== cardId);
    this.persistLocalData();
  }

  // ---- Notifications ----
  markNotifReviewed(cardId: string) {
    if (!this.reviewedNotifIds.includes(cardId)) {
      this.reviewedNotifIds = [...this.reviewedNotifIds, cardId];
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(this.reviewedNotifIds));
    }
  }

  markAllNotifsReviewed(cardIds: string[]) {
    const set = new Set(this.reviewedNotifIds);
    for (const id of cardIds) set.add(id);
    this.reviewedNotifIds = [...set];
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(this.reviewedNotifIds));
  }

  openNotification(folderId: string, cardId: string) {
    this.markNotifReviewed(cardId);
    this.selectedFolderId = folderId;
    this.highlightCardId = cardId;
    this.view = 'folder-detail';
  }

  // ---- Admin ----
  async getAllUsers(): Promise<User[]> {
    const provider = getDataProvider();
    return provider.getUsers();
  }

  async adminUpdateUser(id: string, data: { name?: string; email?: string; password?: string; role?: 'USER' | 'ADMIN' }): Promise<string | null> {
    try {
      const provider = getDataProvider();
      const updated = await provider.updateUser(id, data);
      const idx = this.users.findIndex(u => u.id === id);
      if (idx >= 0) this.users[idx] = updated;
      this.persistLocalData();
      return null;
    } catch (e: any) {
      return e.message;
    }
  }

  async adminDeleteUser(id: string): Promise<void> {
    try {
      const provider = getDataProvider();
      await provider.deleteUser(id);
    } catch {}
    this.users = this.users.filter(u => u.id !== id);
    this.persistLocalData();
  }

  // ---- Reset ----
  resetDemo() {
    if (!isApiMode()) {
      localStorage.removeItem('dash_users_v2');
      localStorage.removeItem('dash_folders_v1');
      void clearAllAttachments();
    }
    this.loadDemoData();
    this.view = 'overview';
    this.selectedFolderId = null;
    this.persistLocalData();
  }
}

export const store = new AppStore();