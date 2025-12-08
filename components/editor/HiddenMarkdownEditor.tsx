import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Save,
  Tag,
  Layers,
  Calendar,
  Type,
  AlignLeft,
  Sparkles,
  Command,
} from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { FileSystem, FileSystemItem, FileType, Theme } from '../../types';
import { createSlugger, slugify } from '../../utils/markdown';
import type { ImageEntry } from './types';

export interface NewPostPayload {
  title: string;
  summary: string;
  tags: string[];
  categories: string[];
  slug: string;
  date: string;
  markdownBody: string;
  fileContent: string; // with frontmatter
  relativePath: string;
}

interface HiddenMarkdownEditorProps {
  open: boolean;
  onClose: () => void;
  fileSystem: FileSystem;
  theme: Theme;
  onSave: (payload: NewPostPayload) => Promise<void> | void;
  onExport: (payload: NewPostPayload) => Promise<void> | void;
}

const normalizeHeadingLevels = (value: string) =>
  value
    .split('\n')
    .map(line => {
      const trimmed = line.trimStart();
      if (!trimmed.startsWith('#') || trimmed.startsWith('##')) return line;
      const leadingSpaces = line.slice(0, line.length - trimmed.length);
      const withoutMarker = trimmed.replace(/^#\s*/, '');
      return `${leadingSpaces}## ${withoutMarker}`;
    })
    .join('\n');

const stripLeadingH1 = (value: string) =>
  value.replace(/^\s*#\s+[^\n]*(\n|$)/, '').trimStart();

const buildFrontmatter = (payload: {
  title: string;
  date: string;
  summary: string;
  tags: string[];
  categories: string[];
}) => {
  const sections: string[] = [];
  sections.push(`title: "${payload.title.replace(/"/g, '\\"')}"`);
  sections.push(`date: ${payload.date}`);
  if (payload.summary) {
    sections.push(`summary: "${payload.summary.replace(/"/g, '\\"')}"`);
  }
  sections.push('tags:');
  (payload.tags.length ? payload.tags : ['draft']).forEach(tag => {
    sections.push(`  - ${tag}`);
  });
  sections.push('categories:');
  (payload.categories.length ? payload.categories : ['General']).forEach(cat => {
    sections.push(`  - ${cat}`);
  });
  return `---\n${sections.join('\n')}\n---\n`;
};

const focusableSelector = 'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])';

export const HiddenMarkdownEditor: React.FC<HiddenMarkdownEditorProps> = ({
  open,
  onClose,
  fileSystem,
  theme,
  onSave,
  onExport,
}) => {
  const isDark = theme === 'dark';
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    Object.values(fileSystem).forEach(item => {
      if (item.tags) {
        item.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [fileSystem]);

  const allCategoryPaths = useMemo(() => {
    const catSet = new Set<string>();
    Object.values(fileSystem).forEach(item => {
      if (item.type === FileType.FILE && item.categories?.length) {
        catSet.add(item.categories.join('/'));
      }
    });
    return Array.from(catSet).sort();
  }, [fileSystem]);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [slug, setSlug] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString());
  const [markdownBody, setMarkdownBody] = useState('');
  const [debouncedBody, setDebouncedBody] = useState('');
  const [tagQuery, setTagQuery] = useState('');
  const [categoryQuery, setCategoryQuery] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const markdownRef = useRef<HTMLTextAreaElement>(null);
  const imageEntriesRef = useRef<ImageEntry[]>([]);

  useEffect(() => {
    if (!open) {
      setExporting(false);
      return undefined;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const trap = () => {
      if (!containerRef.current) return;
      const focusable = containerRef.current.querySelectorAll<HTMLElement>(focusableSelector);
      focusable[0]?.focus();
    };
    const timer = setTimeout(trap, 50);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus();
      setExporting(false);
    };
  }, [open]);

  useEffect(() => {
    if (!slugEdited) {
      setSlug(slugify(title || 'untitled'));
    }
  }, [title, slugEdited]);

  const normalizedBody = useMemo(() => normalizeHeadingLevels(markdownBody), [markdownBody]);

  const previewDocument = useMemo(() => {
    const safeTitle = (title || 'untitled').trim();
    const body = stripLeadingH1(normalizedBody);
    const head = safeTitle ? `# ${safeTitle}` : '';
    return [head, body].filter(Boolean).join('\n\n').trim();
  }, [normalizedBody, title]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setDebouncedBody(previewDocument));
    return () => cancelAnimationFrame(raf);
  }, [previewDocument]);

  useEffect(() => {
    if (!open) {
      setTitle('');
      setSummary('');
      setTags([]);
      setCategories([]);
      setSlug('');
      setSlugEdited(false);
      setMarkdownBody('');
      setDebouncedBody('');
      setTagQuery('');
      setCategoryQuery('');
      setDate(new Date().toISOString());
      setError(null);
    }
  }, [open]);

  const addTag = useCallback(
    (value: string) => {
      const next = value.trim();
      if (!next) return;
      setTags(prev => (prev.includes(next) ? prev : [...prev, next]));
      setTagQuery('');
    },
    [],
  );

  const removeTag = useCallback((value: string) => {
    setTags(prev => prev.filter(tag => tag !== value));
  }, []);

  const handleCategorySelect = useCallback(
    (value: string) => {
      const parts = value
        .split('/')
        .map(part => part.trim())
        .filter(Boolean);
      setCategories(parts);
      setCategoryQuery('');
    },
    [],
  );

  const renderSlugger = useMemo(() => createSlugger(), [debouncedBody]);

  const registerImage = useCallback((originalSrc: string, resolvedSrc: string, alt?: string): ImageEntry => {
    const entry: ImageEntry = {
      id: `hidden-preview-${Date.now()}-${Math.random()}`,
      originalSrc,
      resolvedSrc,
      alt,
    };
    imageEntriesRef.current.push(entry);
    return entry;
  }, []);

  const previewFile: FileSystemItem = useMemo(
    () => ({
      id: 'hidden-preview',
      name: `${slug || 'untitled'}.md`,
      type: FileType.FILE,
      parentId: 'folder-posts',
      content: debouncedBody,
      tags,
      categories,
      summary,
      date,
    }),
    [slug, debouncedBody, tags, categories, summary, date],
  );

  const filteredTags = useMemo(() => {
    if (!tagQuery.trim()) {
      return allTags.filter(tag => !tags.includes(tag)).slice(0, 6);
    }
    const query = tagQuery.toLowerCase();
    return allTags
      .filter(tag => tag.toLowerCase().includes(query) && !tags.includes(tag))
      .slice(0, 6);
  }, [tagQuery, allTags, tags]);

  const filteredCategories = useMemo(() => {
    if (!categoryQuery.trim()) return allCategoryPaths.slice(0, 8);
    const query = categoryQuery.toLowerCase();
    return allCategoryPaths.filter(path => path.toLowerCase().includes(query)).slice(0, 8);
  }, [categoryQuery, allCategoryPaths]);

  const buildPayload = useCallback(
    () => {
      const safeTitle = title.trim();
      const safeSlug = slug.trim();
      const frontmatter = buildFrontmatter({
        title: safeTitle,
        date,
        summary: summary.trim(),
        tags,
        categories,
      });
      const relativePath = `${categories.join('/')}${categories.length ? '/' : ''}${safeSlug}.md`.replace(/^\//, '');
      const bodyWithoutH1 = stripLeadingH1(normalizedBody);
      const documentBody = [safeTitle ? `# ${safeTitle}` : '', bodyWithoutH1]
        .filter(Boolean)
        .join('\n\n')
        .trim();
      return {
        title: safeTitle,
        summary: summary.trim(),
        tags,
        categories,
        slug: safeSlug,
        date,
        markdownBody: normalizedBody,
        fileContent: `${frontmatter}\n${documentBody}`.trim(),
        relativePath: relativePath || `${safeSlug}.md`,
      } satisfies NewPostPayload;
    },
    [categories, date, normalizedBody, summary, title, slug, tags],
  );

  const handleSave = async () => {
    if (!title.trim()) {
      setError('标题不能为空');
      return;
    }
    if (!slug.trim()) {
      setError('Slug 不能为空');
      return;
    }
    setSaving(true);
    setError(null);
    const payload = buildPayload();
    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      console.error(err);
      setError('保存失败，请检查控制台日志。');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    if (exporting || saving) return;
    setExporting(true);
    setError(null);

    try {
      const payload = buildPayload();
      await onExport(payload);
    } catch (err) {
      console.error(err);
      setError('导出失败，请检查控制台日志。');
    } finally {
      // 短暂延迟提供视觉反馈，避免闪烁
      await new Promise(resolve => setTimeout(resolve, 500));
      setExporting(false);
    }
  };

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const text = event.clipboardData.getData('text/plain');
      if (!text) return;
      event.preventDefault();
      const target = event.currentTarget;
      const { selectionStart, selectionEnd } = target;
      const normalizedText = normalizeHeadingLevels(text);
      const nextValue =
        markdownBody.slice(0, selectionStart) + normalizedText + markdownBody.slice(selectionEnd);
      setMarkdownBody(nextValue);
      requestAnimationFrame(() => {
        const textarea = markdownRef.current;
        if (textarea) {
          const pos = selectionStart + normalizedText.length;
          textarea.selectionStart = textarea.selectionEnd = pos;
        }
      });
    },
    [markdownBody],
  );

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className={`fixed inset-0 z-[120] flex flex-col ${
          isDark
            ? 'bg-gradient-to-br from-[#030712] via-[#050c1d] to-[#0c1229] text-gray-100'
            : 'bg-gradient-to-br from-[#e6ecf5] via-[#d9e3f2] to-[#c7d3eb] text-[#0f1f3a]'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-label="隐藏式 Markdown 编辑器"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24 }}
          className={`flex-1 flex flex-col w-full h-full px-4 md:px-8 py-4 overflow-hidden custom-scrollbar ${
            isDark
              ? 'bg-[#030712]/95 text-gray-100'
              : 'bg-gradient-to-br from-[#eef2fb] via-[#e0e9f9] to-[#d0ddf1] text-[#0f1f3a]'
          }`}
        >
          <div
            className={`flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4 ${
              isDark ? 'border-white/10' : 'border-slate-200/80'
            }`}
          >
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-400/80 flex items-center gap-2">
                <Command size={14} /> Ctrl / Cmd + ,
              </p>
              <h2 className="text-2xl font-semibold mt-1 flex items-center gap-2">
                隐藏式 Markdown 编辑器
                <Sparkles size={18} className="text-cyan-400" />
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                快捷创建带 Frontmatter 的文章，实时预览右侧渲染效果。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {error && (
                <span className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1 rounded-full">
                  {error}
                </span>
              )}
              <button
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors ${
                  isDark
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-[#0f172a] text-white hover:bg-[#1f2d4f]'
                }`}
                onClick={handleSave}
                disabled={saving}
              >
                <Save size={16} />
                {saving ? '保存中…' : '保存草稿'}
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors ${
                  isDark
                    ? 'bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20 border border-cyan-400/40'
                    : 'bg-white text-cyan-600 border border-cyan-200 hover:bg-cyan-50'
                } ${exporting ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={handleExport}
                disabled={saving || exporting}
              >
                {exporting ? '导出中…' : '导出 Markdown'}
              </button>
              <button
                onClick={onClose}
                className={`p-2 rounded-full border ${isDark ? 'border-white/20 hover:bg-white/10' : 'border-slate-200 hover:bg-white'}`}
                aria-label="关闭编辑器"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[360px,1fr] gap-0 overflow-hidden flex-1 min-h-0">
            <div
              className={`border-r px-6 py-5 space-y-5 overflow-y-auto custom-scrollbar ${
                isDark ? 'border-white/10 bg-white/5' : 'border-slate-200/70 bg-white/50'
              }`}
            >
              <div className="space-y-2">
                <label className="text-xs font-semibold flex items-center gap-2 uppercase tracking-[0.3em]">
                  <Type size={14} /> 标题
                </label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="例如：在浏览器里构建隐藏式编辑器"
                  className="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold flex items-center gap-2 uppercase tracking-[0.3em]">
                  <Calendar size={14} /> Slug / 日期
                </label>
                <div className="flex gap-3">
                  <input
                    value={slug}
                    onChange={e => {
                      setSlug(e.target.value);
                      setSlugEdited(true);
                    }}
                    placeholder="autogen-based-on-title"
                    className="flex-1 rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                  <input
                    type="datetime-local"
                    value={date.slice(0, 16)}
                    onChange={e => setDate(new Date(e.target.value).toISOString())}
                    className="w-40 rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold flex items-center gap-2 uppercase tracking-[0.3em]">
                  <AlignLeft size={14} /> 摘要
                </label>
                <textarea
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  rows={3}
                  placeholder="用于 Frontmatter summary 字段的简介"
                  className="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold flex items-center gap-2 uppercase tracking-[0.3em]">
                  <Tag size={14} /> 标签（多选）
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs border border-cyan-400/40 bg-cyan-500/10 flex items-center gap-2"
                    >
                      #{tag}
                      <button onClick={() => removeTag(tag)} aria-label={`移除标签 ${tag}`}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  value={tagQuery}
                  onChange={e => setTagQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(tagQuery);
                    }
                  }}
                  placeholder="键入以搜索历史标签，Enter 新增"
                  className="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                {filteredTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {filteredTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => addTag(tag)}
                        className="px-2 py-1 text-xs rounded-full border border-white/10 hover:border-cyan-400/60"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold flex items-center gap-2 uppercase tracking-[0.3em]">
                  <Layers size={14} /> 分类路径（单选 / 多级）
                </label>
                <input
                  value={categoryQuery}
                  onChange={e => setCategoryQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && categoryQuery.trim()) {
                      handleCategorySelect(categoryQuery.trim());
                    }
                  }}
                  placeholder="例如：教程/GitHub"
                  className="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                {filteredCategories.length > 0 && (
                  <div className="max-h-32 overflow-y-auto space-y-1 pr-1 text-sm">
                    {filteredCategories.map(path => (
                      <button
                        key={path}
                        onClick={() => handleCategorySelect(path)}
                        className={`w-full text-left px-3 py-1 rounded-lg border transition-colors ${
                          categories.join('/') === path
                            ? 'border-cyan-400 bg-cyan-500/10 text-cyan-200'
                            : 'border-white/10 hover:border-cyan-300/50'
                        }`}
                      >
                        {path || '根目录'}
                      </button>
                    ))}
                  </div>
                )}
                {categories.length > 0 && (
                  <p className="text-xs text-cyan-400">
                    当前：{categories.join(' / ')}
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              <div
                className={`grid gap-4 ${
                  isDark ? 'text-white' : 'text-[#0f1f3a]'
                } lg:grid-cols-2`}
              >
                <div className="flex flex-col">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] mb-2">
                    Markdown 输入
                  </label>
                  <textarea
                    ref={markdownRef}
                    value={markdownBody}
                    onChange={e => setMarkdownBody(e.target.value)}
                    onPaste={handlePaste}
                    className={`flex-1 rounded-2xl border px-4 py-4 font-mono text-sm resize-none min-h-[420px] max-h-[60vh] ${
                      isDark
                        ? 'bg-black/40 border-white/10 focus:ring-2 focus:ring-cyan-400'
                        : 'bg-white border-slate-200 focus:ring-2 focus:ring-cyan-500/50'
                    }`}
                    placeholder="# Hello World\n支持基本 Markdown 快捷键，如 **bold** / `code` / > quote"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] mb-2">
                    实时预览
                  </label>
                  <div
                    className={`flex-1 rounded-2xl border px-5 py-5 min-h-[420px] max-h-[60vh] overflow-y-auto custom-scrollbar ${
                      isDark ? 'bg-[#020617]/80 border-white/10' : 'bg-white border-slate-200 shadow-inner'
                    }`}
                  >
                    <MarkdownRenderer
                      content={debouncedBody}
                      activeFile={previewFile}
                      renderSlugger={renderSlugger}
                      handleAnchorNavigation={event => event.preventDefault()}
                      resolveImageSrc={src => src}
                      registerImage={registerImage}
                      openImagePreview={() => {}}
                      imageEntriesRef={imageEntriesRef}
                      theme={theme}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
};
