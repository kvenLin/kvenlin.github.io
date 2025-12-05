import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Hash } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import type { FileSystemItem, Theme } from '../../types';
import type { ImageEntry } from './types';

interface MarkdownRendererProps {
  content?: string;
  activeFile: FileSystemItem;
  renderSlugger: (value: string) => string;
  handleAnchorNavigation: (event: React.MouseEvent, id: string) => void;
  resolveImageSrc: (src: string) => string;
  registerImage: (originalSrc: string, resolvedSrc: string, alt?: string) => ImageEntry;
  openImagePreview: (images: ImageEntry[], targetId: string) => void;
  imageEntriesRef: React.MutableRefObject<ImageEntry[]>;
  theme?: Theme;
}

const flattenText = (children: React.ReactNode): string => {
  if (typeof children === 'string' || typeof children === 'number') return `${children}`;
  if (Array.isArray(children)) return children.map(flattenText).join('');
  if (React.isValidElement(children)) {
    const elementProps = children.props as { children?: React.ReactNode };
    return flattenText(elementProps.children ?? '');
  }
  return '';
};

const MarkdownRendererComponent: React.FC<MarkdownRendererProps> = ({
  content,
  activeFile,
  renderSlugger,
  handleAnchorNavigation,
  resolveImageSrc,
  registerImage,
  openImagePreview,
  imageEntriesRef,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  return (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeRaw]}
    components={{
      h1: ({ children, className, ...props }: any) => {
        const text = flattenText(children);
        const id = renderSlugger(text || 'section');
        return (
          <div className="relative mb-14 group">
            <h1
              {...props}
              id={id}
              className={`relative inline-flex items-center gap-3 text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight ${isDark ? 'text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-500 drop-shadow-[0_12px_40px_rgba(34,211,238,0.35)]' : 'text-transparent bg-clip-text bg-gradient-to-r from-[#1f2e4c] via-[#2b3e63] to-[#0d4a60] drop-shadow-[0_12px_30px_rgba(13,74,96,0.25)]'} ${className ?? ''}`}
            >
              <span onClick={(e) => handleAnchorNavigation(e, id)} className="flex items-center gap-3 cursor-pointer">
                <span className="text-cyan-400/0 group-hover:text-cyan-300 transition-colors">
                  <Hash className="opacity-0 group-hover:opacity-100" size={18} />
                </span>
                <span>{children}</span>
              </span>
            </h1>
            <div className={`mt-6 h-[3px] w-28 rounded-full bg-gradient-to-r ${isDark ? 'from-cyan-400 via-blue-500 to-transparent shadow-[0_0_25px_rgba(14,165,233,0.45)]' : 'from-[#0f3a4b] via-[#1f6a84] to-transparent shadow-[0_0_25px_rgba(15,58,75,0.25)]'}`} />
          </div>
        );
      },
      h2: ({ children, className, ...props }: any) => {
        const text = flattenText(children);
        const id = renderSlugger(text || 'section');
        return (
          <h2
            {...props}
            id={id}
            className={`group flex items-center gap-3 text-2xl font-bold tracking-tight ${isDark ? 'text-cyan-50 border-b border-white/10' : 'text-[#1c2d4a] border-b border-slate-200/80'} pb-2 mt-12 ${className ?? ''}`}
          >
            <span onClick={(e) => handleAnchorNavigation(e, id)} className="flex items-center gap-3 cursor-pointer">
              <span className={`${isDark ? 'text-cyan-400/60 group-hover:text-cyan-300' : 'text-[#2b5675]/70 group-hover:text-[#0f4a60]'} transition-colors`}>
                <Hash size={16} />
              </span>
              <span>{children}</span>
            </span>
          </h2>
        );
      },
      h3: ({ children, className, ...props }: any) => {
        const text = flattenText(children);
        const id = renderSlugger(text || 'section');
        return (
          <h3
            {...props}
            id={id}
            className={`group flex items-center gap-2 text-xl font-semibold ${isDark ? 'text-cyan-100' : 'text-[#1f3d5c]'} mt-8 ${className ?? ''}`}
          >
            <span onClick={(e) => handleAnchorNavigation(e, id)} className="flex items-center gap-2 cursor-pointer">
              <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-cyan-500/70 group-hover:bg-cyan-300' : 'bg-[#0f4a60]/60 group-hover:bg-[#1c768f]' } transition-colors`} />
              <span>{children}</span>
            </span>
          </h3>
        );
      },
      code: (props) => <CodeBlock {...props} />,
      p: ({ node, ...props }) => <div className={`mb-4 leading-relaxed ${isDark ? 'text-slate-400' : 'text-[#3a4a64]'}`} {...props} />,
      img: ({ node, ...props }) => {
        const { src: originalSrc = '', alt, ...rest } = props as React.ImgHTMLAttributes<HTMLImageElement>;
        const resolvedSrc = resolveImageSrc(originalSrc);
        const entry = registerImage(originalSrc, resolvedSrc, alt);

        return (
          <figure className="my-8 flex flex-col items-center gap-3">
            <img
              {...rest}
              src={resolvedSrc}
              alt={alt}
              referrerPolicy="no-referrer"
              data-preview-id={entry.id}
              className={`rounded-lg shadow-lg max-w-full h-auto cursor-zoom-in transition-transform duration-300 hover:scale-[1.01] ${isDark ? 'border border-white/10' : 'border border-slate-200'}`}
              onClick={() => openImagePreview([...imageEntriesRef.current], entry.id)}
            />
            {alt && (
              <figcaption className={`text-sm font-mono tracking-wide ${isDark ? 'text-slate-400/80' : 'text-slate-500/80'}`}>
                {alt}
              </figcaption>
            )}
          </figure>
        );
      },
      blockquote: ({ node, ...props }) => (
        <blockquote
          className={`border-l-4 pl-6 italic py-4 pr-4 my-8 rounded-r-2xl transition-colors ${
            isDark
              ? 'border-cyan-500 text-gray-300 bg-cyan-900/10'
              : 'border-[#6a93a7] text-[#2e405a] bg-[#e6ecf5]/95 shadow-[0_20px_55px_rgba(15,23,42,0.15)]'
          }`}
          {...props}
        />
      ),
      ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-4 space-y-2 mb-6" {...props} />,
      li: ({ node, ...props }) => <li className={`pl-2 marker:text-cyan-500 ${isDark ? 'text-slate-300' : 'text-[#3a4a64]'}`} {...props} />,
      table: ({ node, ...props }) => (
        <div className={`my-10 overflow-x-auto rounded-2xl border shadow-xl ${isDark ? 'border-white/10 bg-[#050b16]' : 'border-slate-300/70 bg-[#e6ecf5]/95'}`}>
          <table className="min-w-full text-left text-sm" {...props} />
        </div>
      ),
      thead: ({ node, ...props }) => (
        <thead className={`uppercase tracking-[0.3em] text-xs ${isDark ? 'text-cyan-200 bg-white/5' : 'text-[#4a5d7a] bg-[#dde6f3]/90'}`} {...props} />
      ),
      tbody: ({ node, ...props }) => (
        <tbody className={`divide-y ${isDark ? 'divide-white/10' : 'divide-slate-200'}`} {...props} />
      ),
      tr: ({ node, ...props }) => (
        <tr className={`transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100/60'}`} {...props} />
      ),
      th: ({ node, ...props }) => (
        <th className={`px-4 py-3 font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-700'}`} {...props} />
      ),
      td: ({ node, ...props }) => (
        <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} {...props} />
      ),
    }}
  >
    {content || ''}
  </ReactMarkdown>
  );
};

export const MarkdownRenderer = React.memo(
  MarkdownRendererComponent,
  (prev, next) =>
    prev.content === next.content &&
    prev.activeFile?.id === next.activeFile?.id &&
    prev.theme === next.theme,
);
