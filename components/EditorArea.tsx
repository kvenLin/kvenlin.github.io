import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { X, Hash, List, PanelRightClose } from 'lucide-react';
import { FileSystemItem, Theme } from '../types';
import { IconHelper } from './IconHelper';
import { Language } from '../translations';
import { siteConfig } from '../src/config/site';
import { Comments } from './Comments';
import { Dashboard } from './editor/Dashboard';
import { MarkdownRenderer } from './editor/MarkdownRenderer';
import { ImagePreviewOverlay } from './editor/ImagePreviewOverlay';
import {
  clamp,
  ImageEntry,
  PreviewState,
  PREVIEW_DEFAULT_ZOOM,
  PREVIEW_MIN_ZOOM,
  PREVIEW_MAX_ZOOM,
  PREVIEW_ZOOM_STEP,
} from './editor/types';
import { buildToc, createSlugger } from '../utils/markdown';

interface EditorAreaProps {
  openFiles: string[];
  activeFileId: string | null;
  files: Record<string, FileSystemItem>;
  onTabClick: (id: string) => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
  language: Language;
  onOpenFile: (id: string) => void;
  onTagClick: (tag: string | null) => void;
  isBooting?: boolean;
  activeTag?: string | null;
  onCloseFile?: () => void;
  theme?: Theme;
  onNavigateHome?: () => void;
}

export const EditorArea: React.FC<EditorAreaProps> = React.memo(({
  openFiles,
  activeFileId,
  files,
  onTabClick,
  onCloseTab,
  language,
  onOpenFile,
  onTagClick,
  isBooting,
  activeTag,
  onCloseFile,
  onNavigateHome,
  theme,
}) => {
  const activeFile = activeFileId ? files[activeFileId] : null;
  const contentRef = useRef<HTMLDivElement>(null);
  const imageEntriesRef = useRef<ImageEntry[]>([]);
  const imageIdCounterRef = useRef(0);
  const panStateRef = useRef<{ pointerId: number; startX: number; startY: number; offsetX: number; offsetY: number } | null>(null);

  const renderSlugger = useMemo(() => createSlugger(), [activeFile?.content, activeFileId]);
  const tocItems = useMemo(() => buildToc(activeFile?.content), [activeFile?.content]);

  useEffect(() => {
    imageEntriesRef.current = [];
    imageIdCounterRef.current = 0;
  }, [activeFileId]);

  const resolveImageSrc = useCallback(
    (src: string) => {
      let resolved = src || '';
      const isExternal = resolved.startsWith('http') || resolved.startsWith('//');
      if (!isExternal && resolved && !resolved.startsWith('/')) {
        resolved = activeFile?.parentId === 'folder-posts' ? `/posts/${resolved}` : `/${resolved}`;
      }
      return resolved;
    },
    [activeFile?.parentId],
  );

  const registerImage = useCallback((originalSrc: string, resolvedSrc: string, alt?: string) => {
    const id = `preview-image-${imageIdCounterRef.current++}`;
    const entry: ImageEntry = { id, originalSrc, resolvedSrc, alt };
    imageEntriesRef.current.push(entry);
    return entry;
  }, []);

  const scrollToHeading = useCallback((id: string) => {
    const container = contentRef.current;
    if (!container) return;
    const target = document.getElementById(id) ?? document.getElementById(`${id}-1`);
    if (!target) return;
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const offset = targetRect.top - containerRect.top + container.scrollTop - 24;
    container.scrollTo({ top: Math.max(offset, 0), behavior: 'smooth' });
  }, []);

  const handleAnchorNavigation = useCallback(
    (event: React.MouseEvent, id: string) => {
      event.preventDefault();
      scrollToHeading(id);
    },
    [scrollToHeading],
  );

  const [isTocOpen, setIsTocOpen] = useState(true);
  const [previewState, setPreviewState] = useState<PreviewState | null>(null);

  const openImagePreview = useCallback((images: ImageEntry[], targetId: string) => {
    if (!images.length) return;
    const index = images.findIndex(img => img.id === targetId);
    setPreviewState({
      images,
      index: index === -1 ? 0 : index,
      zoom: PREVIEW_DEFAULT_ZOOM,
      offset: { x: 0, y: 0 },
    });
  }, []);

  const closeImagePreview = useCallback(() => setPreviewState(null), []);

  const handleNavigate = useCallback((direction: 1 | -1) => {
    setPreviewState(prev => {
      if (!prev || prev.images.length <= 1) return prev;
      const total = prev.images.length;
      return {
        ...prev,
        index: (prev.index + direction + total) % total,
        zoom: PREVIEW_DEFAULT_ZOOM,
        offset: { x: 0, y: 0 },
      };
    });
  }, []);

  const adjustZoom = useCallback((delta: number) => {
    setPreviewState(prev => {
      if (!prev) return prev;
      const nextZoom = clamp(prev.zoom + delta, PREVIEW_MIN_ZOOM, PREVIEW_MAX_ZOOM);
      return { ...prev, zoom: nextZoom };
    });
  }, []);

  const resetView = useCallback(() => {
    setPreviewState(prev => (prev ? { ...prev, zoom: PREVIEW_DEFAULT_ZOOM, offset: { x: 0, y: 0 } } : prev));
  }, []);

  const handleDownload = useCallback(() => {
    if (!previewState) return;
    const current = previewState.images[previewState.index];
    if (!current) return;
    const link = document.createElement('a');
    link.href = current.resolvedSrc || current.originalSrc;
    link.download = (current.alt?.trim() || 'image').replace(/[\\/:*?"<>|]+/g, '_');
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [previewState]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLImageElement>) => {
      if (!previewState || (event.button && event.button !== 0)) return;
      event.preventDefault();
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
      panStateRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        offsetX: previewState.offset.x,
        offsetY: previewState.offset.y,
      };
    },
    [previewState],
  );

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLImageElement>) => {
    const panState = panStateRef.current;
    if (!panState || panState.pointerId !== event.pointerId) return;
    event.preventDefault();
    const dx = event.clientX - panState.startX;
    const dy = event.clientY - panState.startY;
    setPreviewState(prev => (prev ? { ...prev, offset: { x: panState.offsetX + dx, y: panState.offsetY + dy } } : prev));
  }, []);

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLImageElement>) => {
    const panState = panStateRef.current;
    if (!panState || panState.pointerId !== event.pointerId) return;
    (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
    panStateRef.current = null;
  }, []);

  const handleWheelZoom = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (!previewState) return;
      event.preventDefault();
      const delta = event.deltaY > 0 ? -PREVIEW_ZOOM_STEP : PREVIEW_ZOOM_STEP;
      setPreviewState(prev => {
        if (!prev) return prev;
        const nextZoom = clamp(prev.zoom + delta, PREVIEW_MIN_ZOOM, PREVIEW_MAX_ZOOM);
        return { ...prev, zoom: nextZoom };
      });
    },
    [previewState],
  );

  const handleSelectImage = useCallback((index: number) => {
    setPreviewState(prev => (prev ? { ...prev, index, zoom: PREVIEW_DEFAULT_ZOOM, offset: { x: 0, y: 0 } } : prev));
  }, []);

  useEffect(() => {
    document.title = activeFile ? `${activeFile.name} | ${siteConfig.title}` : siteConfig.title;
  }, [activeFile]);

  useEffect(() => {
    if (!previewState) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopImmediatePropagation(); // 完全阻止所有后续处理器，包括 App 的全局 ESC 处理器
        closeImagePreview();
      } else if (event.key === 'ArrowLeft') {
        handleNavigate(-1);
      } else if (event.key === 'ArrowRight') {
        handleNavigate(1);
      }
    };
    // 使用捕获阶段确保在 App 的处理器之前执行
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [previewState, closeImagePreview, handleNavigate]);

  useEffect(() => {
    if (!previewState) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [previewState]);

  const { scrollYProgress } = useScroll({ container: contentRef });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const renderMarkdown = Boolean(activeFile?.name.endsWith('.md'));

  return (
    <motion.div className="flex-1 flex flex-col glass-panel rounded-2xl overflow-hidden shadow-2xl h-full border border-white/5 bg-[#0f172a]/40 backdrop-blur-3xl relative">
      {activeFile && (
        <motion.div className="absolute top-0 left-0 right-0 h-0.5 bg-cyan-500 z-50 origin-left" style={{ scaleX }} />
      )}

      {openFiles.length > 0 && (
        <div className="h-10 flex items-end px-4 gap-2 overflow-x-auto scrollbar-hide border-b border-white/5 bg-black/20 pt-2 shrink-0">
          <AnimatePresence mode="popLayout">
            {openFiles.map(fileId => {
              const file = files[fileId];
              if (!file) return null;
              const isActive = activeFileId === fileId;
              return (
                <motion.div
                  key={fileId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => onTabClick(fileId)}
                  className={`group relative flex items-center px-4 py-2 rounded-t-lg cursor-pointer text-xs select-none transition-all duration-200 border-t border-x min-w-[120px] max-w-[200px] ${
                    isActive
                      ? 'bg-[#0f172a]/60 text-cyan-100 border-white/10 shadow-lg mb-[-1px] pb-2.5 z-10'
                      : 'bg-transparent text-gray-500 border-transparent hover:bg-white/5 hover:text-gray-300'
                  }`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-[2px] bg-cyan-500 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                  <IconHelper name={file.name} className={`mr-2 ${isActive ? 'opacity-100' : 'opacity-50'}`} />
                  <span className="truncate flex-1">{file.name}</span>
                  <button
                    onClick={e => onCloseTab(fileId, e)}
                    className={`ml-2 p-0.5 rounded-full hover:bg-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 ${
                      isActive ? 'opacity-100' : ''
                    }`}
                  >
                    <X size={10} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <div id="main-scroll-container" className="flex-1 overflow-y-auto relative bg-transparent" ref={contentRef}>
        <AnimatePresence mode="wait">
          {activeFile ? (
            <motion.div
              key={activeFile.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-4xl mx-auto p-8 md:p-12 pb-32 min-h-full relative"
            >
              <div className="scanning-line" />

              <div className="flex items-center gap-2 text-xs font-mono text-gray-500 mb-8 border-b border-white/5 pb-4">
                <span className="text-cyan-500/50">~/project</span>
                <span className="text-gray-700">/</span>
                <span>{activeFile.parentId?.replace('folder-', '')}</span>
                <span className="text-gray-700">/</span>
                <span className="text-cyan-300">{activeFile.name}</span>
              </div>

              {renderMarkdown && tocItems.length > 0 && (
                <div className="mb-12 rounded-2xl border border-white/5 bg-[#070c16]/80 p-6 shadow-2xl backdrop-blur-xl xl:hidden">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                      <Hash size={18} />
                    </div>
                    <div>
                      <p className="text-xs tracking-[0.3em] text-cyan-400/70 uppercase">Table of Contents</p>
                      <h4 className="text-lg font-semibold text-white">当前文章目录</h4>
                    </div>
                  </div>
                  <nav className="space-y-1">
                    {tocItems.map(item => (
                      <button
                        key={item.id}
                        onClick={e => handleAnchorNavigation(e, item.id)}
                        className="w-full flex items-center gap-3 rounded-xl py-2 px-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                        style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                      >
                        <span className="text-cyan-500/70 text-xs font-mono">
                          {item.level === 1 ? 'H1' : item.level === 2 ? 'H2' : 'H3'}
                        </span>
                        <span className="truncate flex-1">{item.text}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              )}

              {renderMarkdown && tocItems.length > 0 && (
                <div className="hidden xl:block">
                  <div className="fixed top-32 right-6 z-40">
                    <AnimatePresence mode="wait">
                      {isTocOpen ? (
                        <motion.div
                          key="toc-panel"
                          initial={{ opacity: 0, x: 20, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 20, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className="w-72 rounded-2xl border border-white/5 bg-[#070c16]/95 shadow-2xl backdrop-blur-2xl"
                        >
                          <div
                            className="flex items-center justify-between px-5 py-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors"
                            onClick={() => setIsTocOpen(false)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                                <List size={18} />
                              </div>
                              <div>
                                <p className="text-[11px] tracking-[0.4em] text-cyan-400/70 uppercase">TOC</p>
                                <h4 className="text-base font-semibold text-white">文章导航</h4>
                              </div>
                            </div>
                            <PanelRightClose size={16} className="text-gray-500 hover:text-white transition-colors" />
                          </div>
                          <nav className="max-h-[60vh] overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
                            {tocItems.map(item => (
                              <button
                                key={item.id}
                                onClick={e => handleAnchorNavigation(e, item.id)}
                                className="w-full flex items-center gap-3 rounded-xl py-2 px-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all text-left"
                                style={{ paddingLeft: `${(item.level - 1) * 14}px` }}
                              >
                                <span className="text-cyan-500/70 text-[11px] font-mono uppercase tracking-widest w-8 shrink-0">
                                  {item.level === 1 ? 'H1' : item.level === 2 ? 'H2' : 'H3'}
                                </span>
                                <span className="truncate flex-1">{item.text}</span>
                              </button>
                            ))}
                          </nav>
                        </motion.div>
                      ) : (
                        <motion.button
                          key="toc-trigger"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsTocOpen(true)}
                          className="w-12 h-12 rounded-xl bg-[#070c16]/90 border border-white/10 shadow-lg backdrop-blur-xl flex items-center justify-center text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all"
                          title="展开目录导航"
                        >
                          <List size={20} />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {renderMarkdown ? (
                <div className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-100 prose-h2:text-2xl prose-h2:text-cyan-100 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2 prose-h2:mt-12 prose-h3:text-xl prose-h3:text-cyan-50 prose-h3:mt-8 prose-p:text-slate-400 prose-p:leading-relaxed prose-strong:text-white prose-code:text-cyan-300 prose-code:bg-cyan-950/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-[#0b1120] prose-pre:border prose-pre:border-white/10 prose-pre:shadow-2xl prose-pre:rounded-xl prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline hover:prose-a:text-cyan-300 prose-ul:list-disc prose-ul:pl-6 prose-li:marker:text-cyan-500 prose-li:text-slate-300 prose-ol:list-decimal prose-ol:pl-6 prose-li:marker:text-cyan-500">
                  <MarkdownRenderer
                    content={activeFile.content}
                    activeFile={activeFile}
                    renderSlugger={renderSlugger}
                    handleAnchorNavigation={handleAnchorNavigation}
                    resolveImageSrc={resolveImageSrc}
                    registerImage={registerImage}
                    openImagePreview={openImagePreview}
                    imageEntriesRef={imageEntriesRef}
                  />

                  {activeFile.tags && (
                    <div className="mt-16 pt-6 border-t border-white/10 flex gap-2 flex-wrap">
                      {activeFile.tags.map((tag, index) => (
                        <span
                          key={`${tag}-${index}`}
                          onClick={() => {
                            onTagClick(tag);
                            onCloseFile?.();
                          }}
                          className="text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full font-mono cursor-pointer hover:bg-cyan-500/20 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)] transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {activeFile.parentId?.includes('post') && <Comments term={activeFile.id} />}
                </div>
              ) : (
                <div className="font-mono text-sm whitespace-pre text-gray-300 bg-[#0b1120] p-6 rounded-xl border border-white/10 shadow-inner">
                  {activeFile.content}
                </div>
              )}
            </motion.div>
          ) : (
            <Dashboard files={files} language={language} onOpenFile={onOpenFile} isBooting={isBooting} onTagClick={onTagClick} activeTag={activeTag} />
          )}
        </AnimatePresence>
      </div>

      <ImagePreviewOverlay
        previewState={previewState}
        onClose={closeImagePreview}
        onNavigate={handleNavigate}
        onAdjustZoom={adjustZoom}
        onResetView={resetView}
        onDownload={handleDownload}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheelZoom}
        onSelectImage={handleSelectImage}
      />
    </motion.div>
  );
});

export default EditorArea;
