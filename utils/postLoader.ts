import { FileSystemItem, FileType } from '../types';

interface PostMetadata {
  title: string;
  date: string;
  categories?: string[];
  tags?: string[];
  [key: string]: any;
}

interface ParsedPost {
  metadata: PostMetadata;
  content: string;
  filename: string;
}

interface LoadPostsResult {
  items: FileSystemItem[];
  rootChildren: string[];
}

// Simple Front Matter Parser (Regex based)
const parseFrontMatter = (fileContent: string): ParsedPost => {
  const frontMatterRegex = /^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/;
  const match = frontMatterRegex.exec(fileContent);

  if (!match) {
    return {
      metadata: { title: 'Untitled', date: new Date().toISOString() },
      content: fileContent,
      filename: ''
    };
  }

  const yamlBlock = match[1];
  const content = match[2];
  const metadata: PostMetadata = { title: '', date: '' };

  let currentKey: string | null = null;
  let pendingArray: string[] | null = null;

  const flushArray = () => {
    if (currentKey && pendingArray) {
      (metadata as any)[currentKey] = pendingArray;
      pendingArray = null;
    }
  };

  yamlBlock.split('\n').forEach(rawLine => {
    const line = rawLine.replace(/\r$/, '');
    const trimmed = line.trim();
    if (!trimmed) return;

    const arrayItemMatch = trimmed.match(/^-(.+)$/);
    if (arrayItemMatch && currentKey) {
      if (!pendingArray) pendingArray = [];
      pendingArray.push(arrayItemMatch[1].trim());
      return;
    }

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex !== -1) {
      flushArray();
      const key = trimmed.slice(0, colonIndex).trim();
      let value = trimmed.slice(colonIndex + 1).trim();
      currentKey = key;

      if (!value) {
        pendingArray = [];
        return;
      }

      // Handle arrays (simple [a, b] format)
      if (value.startsWith('[') && value.endsWith(']')) {
        const arrayValues = value
          .slice(1, -1)
          .split(',')
          .map(v => v.trim())
          .filter(Boolean);
        (metadata as any)[key] = arrayValues;
        return;
      }

      // Strip wrapping quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\''))) {
        value = value.slice(1, -1);
      }

      (metadata as any)[key] = value;
      currentKey = null;
    }
  });

  flushArray();

  return { metadata, content, filename: '' };
};

export const loadPosts = async (): Promise<LoadPostsResult> => {
  const modules = import.meta.glob('/posts/**/*.md', { query: '?raw', import: 'default' });

  const folderMap: Record<string, FileSystemItem> = {};
  const fileItems: FileSystemItem[] = [];
  const rootChildren = new Set<string>();

  const pushChild = (parentId: string, childId: string) => {
    if (parentId === 'folder-posts') {
      rootChildren.add(childId);
      return;
    }
    const parent = folderMap[parentId];
    if (!parent) return;
    parent.children = parent.children || [];
    if (!parent.children.includes(childId)) {
      parent.children.push(childId);
    }
  };

  const normalizeIdSegment = (segment: string) =>
    segment
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-_,\u4e00-\u9fa5]/g, '');

  const getFolderId = (segments: string[]) =>
    segments.length
      ? `folder-posts-${segments.map(normalizeIdSegment).join('-')}`
      : 'folder-posts';

  const ensureFolder = (segments: string[]): string => {
    if (!segments.length) return 'folder-posts';
    const folderId = getFolderId(segments);
    if (!folderMap[folderId]) {
      const parentSegments = segments.slice(0, -1);
      const parentId = ensureFolder(parentSegments);
      folderMap[folderId] = {
        id: folderId,
        name: segments[segments.length - 1],
        type: FileType.FOLDER,
        parentId,
        children: [],
        isOpen: true
      };
      pushChild(parentId, folderId);
    }
    return folderId;
  };

  for (const fullPath in modules) {
    const loadContent = modules[fullPath] as () => Promise<string>;
    const rawContent = await loadContent();
    const relativePath = fullPath.replace(/^\/posts\//, '');
    const segments = relativePath.split('/');
    const filename = segments.pop() || '';
    const folderSegments = segments.filter(Boolean);

    const { metadata, content } = parseFrontMatter(rawContent);
    const parentId = ensureFolder(folderSegments);
    const id = `post-${relativePath
      .replace(/\.md$/, '')
      .replace(/[^a-zA-Z0-9\/_\-\u4e00-\u9fa5]/g, '-')
      .replace(/[\/]+/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase()}`;

    const fileItem: FileSystemItem = {
      id,
      name: filename,
      type: FileType.FILE,
      parentId,
      date: metadata.date,
      tags: [...(metadata.tags || [])],
      categories: metadata.categories || folderSegments,
      content: content.trim()
    };

    fileItems.push(fileItem);
    pushChild(parentId, fileItem.id);
  }

  const sortedFiles = fileItems.sort((a, b) => {
    return new Date(b.date || '').getTime() - new Date(a.date || '').getTime();
  });

  return {
    items: [...Object.values(folderMap), ...sortedFiles],
    rootChildren: Array.from(rootChildren)
  };
};

export const loadSingleFile = async (path: string, overrides: Partial<FileSystemItem> = {}): Promise<FileSystemItem | null> => {
    try {
        // We need to explicitly list possible imports for Vite to bundle them, 
        // or use a glob that includes them. 
        // Since we can't pass dynamic paths to import() easily in Vite without glob.
        
        // Let's use a known map or glob for root MD files
        const modules = import.meta.glob('/*.md', { query: '?raw', import: 'default' });
        const srcModules = import.meta.glob('/src/*.md', { query: '?raw', import: 'default' });
        
        const allModules = { ...modules, ...srcModules };
        
        // Normalize path
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        const match = Object.keys(allModules).find(k => k.endsWith(normalizedPath));

        if (match) {
            const load = allModules[match] as () => Promise<string>;
            const raw = await load();
            const { content, metadata } = parseFrontMatter(raw);
            
            return {
                id: overrides.id || path,
                name: overrides.name || path.split('/').pop() || '',
                type: FileType.FILE,
                parentId: overrides.parentId || 'root',
                content: content.trim(),
                tags: overrides.tags || metadata.tags,
                date: overrides.date || metadata.date,
                ...overrides
            };
        }
        return null;
    } catch (e) {
        console.error(`Failed to load file ${path}`, e);
        return null;
    }
};
