export type Role = 'USER' | 'ADMIN';
export type FieldType = 'TEXT' | 'NUMBER' | 'DATE' | 'TIME';

export interface CustomField {
  id: string;
  label: string;
  type: FieldType;
  value: string;
}

export interface Attachment {
  id: string;
  /** nombre original del archivo */
  name: string;
  /** mime type, ej: application/pdf */
  mime: string;
  /** tamaño en bytes */
  size: number;
  /** clave del binario en IndexedDB */
  storageKey: string;
  /** ISO datetime de cuando se adjuntó */
  addedAt: string;
}

export interface CardItem {
  id: string;
  title: string;
  description: string;
  /** ISO datetime */
  dueDate: string;
  fields: CustomField[];
  createdAt: string;
  /** archivos adjuntos (el binario vive en IndexedDB) */
  attachments?: Attachment[];
}

export interface Folder {
  id: string;
  name: string;
  description: string;
  color: string;
  /** código para unirse, ej: MATH-4X2K */
  code: string;
  memberIds: string[];
  cards: CardItem[];
  createdAt: string;
  /** url de la portada del espacio */
  bannerUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  avatarColor: string;
  joinedFolderIds: string[];
}

export type View =
  | 'overview'
  | 'folders'
  | 'folder-detail'
  | 'join'
  | 'account'
  | 'users';
