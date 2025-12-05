import { FileSystemItem } from '../../types';

export interface CategoryNode {
  name: string;
  fullPath: string;
  count: number;
  totalCount: number; // Total posts including all sub-categories
  children: Record<string, CategoryNode>;
  hasChildren: boolean;
  depth: number; // Max depth of children
}

export type FileMap = Record<string, FileSystemItem>;
