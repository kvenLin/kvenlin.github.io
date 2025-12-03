import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';
import { PreviewState, PREVIEW_DEFAULT_ZOOM, PREVIEW_ZOOM_STEP } from './types';

interface ImagePreviewOverlayProps {
  previewState: PreviewState | null;
  onClose: () => void;
  onNavigate: (direction: 1 | -1) => void;
  onAdjustZoom: (delta: number) => void;
  onResetView: () => void;
  onDownload: () => void;
  onPointerDown: (event: React.PointerEvent<HTMLImageElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLImageElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLImageElement>) => void;
  onWheel: (event: React.WheelEvent<HTMLDivElement>) => void;
  onSelectImage: (index: number) => void;
}

export const ImagePreviewOverlay: React.FC<ImagePreviewOverlayProps> = ({
  previewState,
  onClose,
  onNavigate,
  onAdjustZoom,
  onResetView,
  onDownload,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onWheel,
  onSelectImage,
}) => (
  <AnimatePresence>
    {previewState && (
      <motion.div
        key="image-preview"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4"
        onWheel={onWheel}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-gray-200 hover:text-white hover:bg-white/20 transition-all"
          aria-label="关闭预览"
        >
          <X size={20} />
        </button>

        {previewState.images.length > 1 && (
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-6 pointer-events-none">
            <button
              onClick={() => onNavigate(-1)}
              className="pointer-events-auto p-3 rounded-full bg-black/60 text-gray-200 hover:text-white hover:bg-white/10 border border-white/10 transition-colors"
              aria-label="上一张"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              onClick={() => onNavigate(1)}
              className="pointer-events-auto p-3 rounded-full bg-black/60 text-gray-200 hover:text-white hover:bg-white/10 border border-white/10 transition-colors"
              aria-label="下一张"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        )}

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative max-w-6xl w-full"
          onClick={e => e.stopPropagation()}
        >
          <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-gray-300 font-mono">
            <span>{previewState.index + 1} / {previewState.images.length}</span>
          </div>

          <div className="rounded-2xl border border-white/20 bg-black/60 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/30 text-sm text-gray-200 relative z-10">
              <div className="flex items-center gap-2">
                <button onClick={() => onAdjustZoom(PREVIEW_ZOOM_STEP)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" aria-label="放大">
                  <ZoomIn size={18} />
                </button>
                <button onClick={() => onAdjustZoom(-PREVIEW_ZOOM_STEP)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" aria-label="缩小">
                  <ZoomOut size={18} />
                </button>
                <button onClick={onResetView} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" aria-label="重置视图">
                  <RotateCcw size={18} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={onDownload} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" aria-label="下载图片">
                  <Download size={18} />
                </button>
              </div>
            </div>

            <div className="relative flex-1 min-h-[60vh] flex items-center justify-center bg-black/80 z-0">
              {previewState.images.map((img, idx) => (
                <AnimatePresence key={img.id}>
                  {idx === previewState.index && (
                    <motion.img
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      src={img.resolvedSrc}
                      alt={img.alt}
                      referrerPolicy="no-referrer"
                      onPointerDown={onPointerDown}
                      onPointerMove={onPointerMove}
                      onPointerUp={onPointerUp}
                      onPointerCancel={onPointerUp}
                      style={{
                        transform: `scale(${previewState.zoom}) translate(${previewState.offset.x / previewState.zoom}px, ${previewState.offset.y / previewState.zoom}px)`,
                      }}
                      className="max-h-[70vh] w-auto object-contain select-none cursor-grab active:cursor-grabbing"
                    />
                  )}
                </AnimatePresence>
              ))}
            </div>

            {previewState.images.length > 1 && (
              <div className="px-4 py-3 border-t border-white/10 bg-black/30 flex items-center gap-2 overflow-x-auto">
                {previewState.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => onSelectImage(idx)}
                    className={`relative w-16 h-16 rounded-lg border ${idx === previewState.index ? 'border-cyan-400' : 'border-white/10'} overflow-hidden flex-shrink-0`}
                  >
                    <img src={img.resolvedSrc} alt={img.alt} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    {idx === previewState.index && <span className="absolute inset-0 border-2 border-cyan-400 rounded-lg" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {previewState.images[previewState.index]?.alt && (
            <p className="mt-4 text-center text-sm text-gray-300 tracking-wide">
              {previewState.images[previewState.index]?.alt}
            </p>
          )}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
