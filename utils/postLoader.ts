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

  yamlBlock.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      // Handle arrays (simple [a, b] format)
      if (value.startsWith('[') && value.endsWith(']')) {
        const arrayValues = value
            .slice(1, -1)
            .split(',')
            .map(v => v.trim());
        (metadata as any)[key] = arrayValues;
      } else {
        (metadata as any)[key] = value;
      }
    }
  });

  return { metadata, content, filename: '' };
};

export const loadPosts = async (): Promise<FileSystemItem[]> => {
  // Vite's import.meta.glob to get raw content
  const modules = import.meta.glob('/posts/*.md', { query: '?raw', import: 'default' });
  
  const posts: FileSystemItem[] = [];

  for (const path in modules) {
    const loadContent = modules[path] as () => Promise<string>;
    const rawContent = await loadContent();
    const filename = path.split('/').pop() || '';
    
    const { metadata, content } = parseFrontMatter(rawContent);
    
    // Extract ID from filename (e.g. 2023-11-15-mastering-hooks.md -> post-mastering-hooks)
    // Or just use the full filename as ID
    const id = `post-${filename.replace('.md', '').replace(/^\d{4}-\d{2}-\d{2}-/, '')}`;

    posts.push({
      id,
      name: filename, 
      type: FileType.FILE,
      parentId: 'folder-posts',
      date: metadata.date,
      tags: [...(metadata.tags || [])], // Keep tags pure
      categories: metadata.categories || [], // Store categories separately
      content: content.trim()
    });
  }

  // Sort by date descending
  return posts.sort((a, b) => {
      return new Date(b.date || '').getTime() - new Date(a.date || '').getTime();
  });
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
