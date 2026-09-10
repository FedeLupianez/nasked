export type Role = 'USER' | 'ADMIN';
export type FieldType = 'TEXT' | 'NUMBER' | 'DATE' | 'TIME';

export interface CustomField {
  id: string;
  label: string;
  type: FieldType;
  value: string;
}

export interface CardItem {
  id: string;
  title: string;
  description: string;
  /** ISO datetime */
  dueDate: string;
  fields: CustomField[];
  createdAt: string;
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
