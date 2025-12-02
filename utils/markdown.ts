export type TocItem = {
  id: string;
  text: string;
  level: number;
};

export const slugify = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'section';

export const createSlugger = () => {
  const counts = new Map<string, number>();
  return (value: string) => {
    const base = slugify(value);
    const count = counts.get(base) || 0;
    const id = count === 0 ? base : `${base}-${count}`;
    counts.set(base, count + 1);
    return id;
  };
};

export const stripMarkdown = (text: string): string =>
  text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/~~(.*?)~~/g, '$1');

export const buildToc = (markdown?: string): TocItem[] => {
  if (!markdown) return [];
  const cleanMarkdown = markdown.replace(/```[\s\S]*?```/g, '');
  const regex = /^(#{1,3})\s+(.+)$/gm;
  const slugger = createSlugger();
  const toc: TocItem[] = [];
  let match;
  while ((match = regex.exec(cleanMarkdown)) !== null) {
    const level = match[1].length;
    if (level > 3) continue;
    const rawText = match[2].trim();
    const text = stripMarkdown(rawText);
    const id = slugger(text);
    toc.push({ id, text, level });
  }
  return toc;
};
