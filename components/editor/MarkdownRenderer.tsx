import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Hash } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import type { FileSystemItem } from '../../types';
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

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  activeFile,
  renderSlugger,
  handleAnchorNavigation,
  resolveImageSrc,
  registerImage,
  openImagePreview,
  imageEntriesRef,
}) => (
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
              className={`relative inline-flex items-center gap-3 text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-500 drop-shadow-[0_12px_40px_rgba(34,211,238,0.35)] ${className ?? ''}`}
            >
              <span onClick={(e) => handleAnchorNavigation(e, id)} className="flex items-center gap-3 cursor-pointer">
                <span className="text-cyan-400/0 group-hover:text-cyan-300 transition-colors">
                  <Hash className="opacity-0 group-hover:opacity-100" size={18} />
                </span>
                <span>{children}</span>
              </span>
            </h1>
            <div className="mt-6 h-[3px] w-28 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-transparent shadow-[0_0_25px_rgba(14,165,233,0.45)]" />
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
            className={`group flex items-center gap-3 text-2xl font-bold tracking-tight text-cyan-50 border-b border-white/10 pb-2 mt-12 ${className ?? ''}`}
          >
            <span onClick={(e) => handleAnchorNavigation(e, id)} className="flex items-center gap-3 cursor-pointer">
              <span className="text-cyan-400/60 group-hover:text-cyan-300 transition-colors">
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
            className={`group flex items-center gap-2 text-xl font-semibold text-cyan-100 mt-8 ${className ?? ''}`}
          >
            <span onClick={(e) => handleAnchorNavigation(e, id)} className="flex items-center gap-2 cursor-pointer">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/70 group-hover:bg-cyan-300 transition-colors" />
              <span>{children}</span>
            </span>
          </h3>
        );
      },
      code: (props) => <CodeBlock {...props} />,
      p: ({ node, ...props }) => <div className="mb-4 leading-relaxed text-slate-400" {...props} />,
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
              className="rounded-lg shadow-lg border border-white/10 max-w-full h-auto cursor-zoom-in transition-transform duration-300 hover:scale-[1.01]"
              onClick={() => openImagePreview([...imageEntriesRef.current], entry.id)}
            />
            {alt && (
              <figcaption className="text-sm text-slate-400/80 font-mono tracking-wide">
                {alt}
              </figcaption>
            )}
          </figure>
        );
      },
      blockquote: ({ node, ...props }) => (
        <blockquote className="border-l-4 border-cyan-500 pl-6 italic text-gray-400 bg-cyan-900/10 py-4 pr-4 my-8 rounded-r-lg" {...props} />
      ),
      ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-4 space-y-2 mb-6" {...props} />,
      li: ({ node, ...props }) => <li className="text-slate-300 pl-2 marker:text-cyan-500" {...props} />,
      table: ({ node, ...props }) => (
        <div className="my-10 overflow-x-auto rounded-2xl border border-white/10 shadow-xl bg-[#050b16]">
          <table className="min-w-full text-left text-sm" {...props} />
        </div>
      ),
      thead: ({ node, ...props }) => (
        <thead className="uppercase tracking-[0.3em] text-xs text-cyan-200 bg-white/5" {...props} />
      ),
      tbody: ({ node, ...props }) => (
        <tbody className="divide-y divide-white/10" {...props} />
      ),
      tr: ({ node, ...props }) => (
        <tr className="hover:bg-white/5 transition-colors" {...props} />
      ),
      th: ({ node, ...props }) => (
        <th className="px-4 py-3 font-semibold text-sm" {...props} />
      ),
      td: ({ node, ...props }) => (
        <td className="px-4 py-3 text-slate-300" {...props} />
      ),
    }}
  >
    {content || ''}
  </ReactMarkdown>
);
