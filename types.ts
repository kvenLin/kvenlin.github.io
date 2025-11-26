export enum FileType {
  FILE = 'FILE',
  FOLDER = 'FOLDER'
}

export interface FileSystemItem {
  id: string;
  name: string;
  type: FileType;
  parentId: string | null;
  content?: string; // Markdown content for files
  children?: string[]; // IDs of children for folders
  isOpen?: boolean; // For folder expansion state
  date?: string;
  tags?: string[];
}

export interface FileSystem {
  [key: string]: FileSystemItem;
}

export interface Tab {
  id: string;
  title: string;
}

export type Theme = 'dark' | 'light'; // Prepared for future expansion
