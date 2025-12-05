import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const progressBarRef = useRef<HTMLDivElement>(null);
  const scrollRafRef = useRef<number | null>(null);
  const imageEntriesRef = useRef<ImageEntry[]>([]);
  const imageIdCounterRef = useRef(0);
  const panStateRef = useRef<{ pointerId: number; startX: number; startY: number; offsetX: number; offsetY: number } | null>(null);

  const renderSlugger = useMemo(() => createSlugger(), [activeFile?.content, activeFileId]);
  const tocItems = useMemo(() => buildToc(activeFile?.content), [activeFile?.content]);
  const isDark = theme !== 'light';
  const panelClasses = isDark 
    ? 'border border-white/5 bg-[#0f172a]/40 text-gray-100' 
    : 'border border-slate-300/70 bg-gradient-to-br from-[#edf1fb]/85 via-[#e4e9f6]/90 to-[#d4dced]/85 text-[#1c2542] shadow-[0_35px_80px_rgba(15,23,42,0.18)]';
  const tabStripClasses = isDark 
    ? 'border-white/5 bg-black/20'
    : 'border-slate-200/70 bg-[#e6ebf5]/70';
  const activeTabClasses = isDark
    ? 'bg-[#0f172a]/60 text-cyan-100 border-white/10 shadow-lg mb-[-1px] pb-2.5 z-10'
    : 'bg-[#f8faff] text-[#23567a] border-slate-200/80 shadow-[0_15px_35px_rgba(15,23,42,0.12)] mb-[-1px] pb-2.5 z-10';
  const inactiveTabClasses = isDark
    ? 'bg-transparent text-gray-500 border-transparent hover:bg-white/5 hover:text-gray-300'
    : 'bg-transparent text-slate-500 border-transparent hover:bg-[#e8eef8]/80 hover:text-[#1f2c4c]';
  const tocCardClasses = isDark
    ? 'border-white/5 bg-[#070c16]/80'
    : 'border-slate-200/80 bg-gradient-to-br from-[#f5f7fe] via-[#ecf1fb] to-[#dfe6f5] text-[#1f2a44]';
  const tocFixedClasses = isDark
    ? 'border-white/5 bg-[#070c16]/95'
    : 'border-slate-200/80 bg-gradient-to-br from-[#f0f4fb] via-[#e6ebf6] to-[#dae2f1] text-[#1f2a44] shadow-[0_20px_45px_rgba(15,23,42,0.18)]';
  const pathBarClasses = isDark 
    ? 'text-gray-500 border-white/5'
    : 'text-[#5e6c8d] border-slate-200/80';

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

  const handleScrollProgress = useCallback(() => {
    if (scrollRafRef.current !== null) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const container = contentRef.current;
      const bar = progressBarRef.current;
      if (!container || !bar) return;
      const max = container.scrollHeight - container.clientHeight;
      const progress = max > 0 ? container.scrollTop / max : 0;
      bar.style.transform = `scaleX(${progress})`;
    });
  }, []);

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    container.addEventListener('scroll', handleScrollProgress, { passive: true });
    // 初始化一次
    handleScrollProgress();
    return () => {
      container.removeEventListener('scroll', handleScrollProgress);
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    };
  }, [handleScrollProgress]);

  const renderMarkdown = Boolean(activeFile?.name.endsWith('.md'));

  return (
    <motion.div className={`flex-1 flex flex-col glass-panel rounded-2xl overflow-hidden shadow-2xl h-full backdrop-blur-3xl relative ${panelClasses}`}>
      {activeFile && (
        <div
          ref={progressBarRef}
          className="absolute top-0 left-0 right-0 h-0.5 bg-cyan-500 z-50 origin-left"
          style={{ transform: 'scaleX(0)' }}
        />
      )}

      {openFiles.length > 0 && (
        <div className={`h-10 flex items-end px-4 gap-2 overflow-x-auto scrollbar-hide border-b pt-2 shrink-0 ${tabStripClasses}`}>
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
                    isActive ? activeTabClasses : inactiveTabClasses
                  }`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-[2px] bg-cyan-500 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                  <IconHelper name={file.name} className={`mr-2 ${isActive ? (isDark ? 'opacity-100' : 'opacity-100 text-cyan-600') : (isDark ? 'opacity-50' : 'opacity-60 text-slate-400')}`} />
                  <span className="truncate flex-1">{file.name}</span>
                  <button
                    onClick={e => onCloseTab(fileId, e)}
                    className={`ml-2 p-0.5 rounded-full transition-colors opacity-0 group-hover:opacity-100 ${
                      isActive
                        ? isDark
                          ? 'hover:bg-white/20 hover:text-red-400 opacity-100'
                          : 'hover:bg-slate-200 hover:text-red-500 opacity-100'
                        : isDark
                          ? 'hover:bg-white/10 hover:text-red-400'
                          : 'hover:bg-slate-100 hover:text-red-500'
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

              <div className={`flex items-center gap-2 text-xs font-mono mb-8 border-b pb-4 ${pathBarClasses}`}>
                <span className={isDark ? 'text-cyan-500/50' : 'text-cyan-600/70'}>~/project</span>
                <span className={isDark ? 'text-gray-600' : 'text-slate-400'}>/</span>
                <span>{activeFile.parentId?.replace('folder-', '')}</span>
                <span className={isDark ? 'text-gray-600' : 'text-slate-400'}>/</span>
                <span className={isDark ? 'text-cyan-300' : 'text-cyan-600 font-semibold'}>{activeFile.name}</span>
              </div>

              {renderMarkdown && tocItems.length > 0 && (
                <div className={`mb-12 rounded-2xl border p-6 shadow-2xl backdrop-blur-xl xl:hidden ${tocCardClasses}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300' : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-600'}`}>
                      <Hash size={18} />
                    </div>
                    <div>
                      <p className={`text-xs tracking-[0.3em] uppercase ${isDark ? 'text-cyan-400/70' : 'text-cyan-600/80'}`}>Table of Contents</p>
                      <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>当前文章目录</h4>
                    </div>
                  </div>
                  <nav className="space-y-1">
                    {tocItems.map(item => (
                      <button
                        key={item.id}
                        onClick={e => handleAnchorNavigation(e, item.id)}
                        className={`w-full flex items-center gap-3 rounded-xl py-2 px-3 text-sm transition-all ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                        style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                      >
                        <span className={`text-xs font-mono ${isDark ? 'text-cyan-500/70' : 'text-cyan-600/80'}`}>
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
                          className={`w-72 rounded-2xl border shadow-2xl backdrop-blur-2xl ${tocFixedClasses}`}
                        >
                          <div
                            className={`flex items-center justify-between px-5 py-4 border-b cursor-pointer transition-colors ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-100'}`}
                            onClick={() => setIsTocOpen(false)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300' : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-600'}`}>
                                <List size={18} />
                              </div>
                              <div>
                                <p className={`text-[11px] tracking-[0.4em] uppercase ${isDark ? 'text-cyan-400/70' : 'text-cyan-600/80'}`}>TOC</p>
                                <h4 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>文章导航</h4>
                              </div>
                            </div>
                            <PanelRightClose size={16} className={`transition-colors ${isDark ? 'text-gray-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`} />
                          </div>
                          <nav className="max-h-[60vh] overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
                            {tocItems.map(item => (
                              <button
                                key={item.id}
                                onClick={e => handleAnchorNavigation(e, item.id)}
                                className={`w-full flex items-center gap-3 rounded-xl py-2 px-2 text-sm transition-all text-left ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                                style={{ paddingLeft: `${(item.level - 1) * 14}px` }}
                              >
                                <span className={`text-[11px] font-mono uppercase tracking-widest w-8 shrink-0 ${isDark ? 'text-cyan-500/70' : 'text-cyan-600/80'}`}>
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
                <div className="space-y-8">
                  <div className={
                    isDark 
                      ? 'prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-100 prose-h2:text-2xl prose-h2:text-cyan-100 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2 prose-h2:mt-12 prose-h3:text-xl prose-h3:text-cyan-50 prose-h3:mt-8 prose-p:text-slate-400 prose-p:leading-relaxed prose-strong:text-white prose-code:text-cyan-300 prose-code:bg-cyan-950/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-[#0b1120] prose-pre:border prose-pre:border-white/10 prose-pre:shadow-2xl prose-pre:rounded-xl prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline hover:prose-a:text-cyan-300 prose-ul:list-disc prose-ul:pl-6 prose-li:marker:text-cyan-500 prose-li:text-slate-300 prose-ol:list-decimal prose-ol:pl-6 prose-li:marker:text-cyan-500'
                      : 'prose prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[#1f2e4c] prose-h2:text-2xl prose-h2:text-[#223255] prose-h2:border-b prose-h2:border-slate-200/80 prose-h2:pb-2 prose-h2:mt-12 prose-h3:text-xl prose-h3:text-[#2b3e63] prose-h3:mt-8 prose-p:text-[#3a4a64] prose-p:leading-relaxed prose-strong:text-[#1f2e4c] prose-code:text-rose-600 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-[#ecf0f8] prose-pre:border prose-pre:border-slate-200 prose-pre:shadow-lg prose-pre:rounded-xl prose-a:text-cyan-600 prose-a:no-underline hover:prose-a:underline hover:prose-a:text-cyan-500 prose-ul:list-disc prose-ul:pl-6 prose-li:marker:text-cyan-500 prose-li:text-[#3a4a64] prose-ol:list-decimal prose-ol:pl-6 prose-li:marker:text-cyan-500'
                  }>
                    <MarkdownRenderer
                      content={activeFile.content}
                      activeFile={activeFile}
                      renderSlugger={renderSlugger}
                      handleAnchorNavigation={handleAnchorNavigation}
                      resolveImageSrc={resolveImageSrc}
                      registerImage={registerImage}
                      openImagePreview={openImagePreview}
                      imageEntriesRef={imageEntriesRef}
                      theme={theme}
                    />
                  </div>

                  {activeFile.tags && (
                    <div className={`pt-6 border-t flex gap-2 flex-wrap ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                      {activeFile.tags.map((tag, index) => (
                        <span
                          key={`${tag}-${index}`}
                          onClick={() => {
                            onTagClick(tag);
                            onCloseFile?.();
                          }}
                          className={`text-xs px-3 py-1 rounded-full font-mono cursor-pointer transition-colors ${isDark ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'bg-cyan-50 border border-cyan-200 text-cyan-700 hover:bg-cyan-100 hover:border-cyan-300'}`}
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
            <Dashboard
              files={files}
              language={language}
              onOpenFile={onOpenFile}
              isBooting={isBooting}
              onTagClick={onTagClick}
              activeTag={activeTag}
              theme={theme}
            />
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
