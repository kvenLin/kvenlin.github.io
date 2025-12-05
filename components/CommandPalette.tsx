
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Command, ArrowRight } from 'lucide-react';
import { FileSystem, FileType, FileSystemItem, Theme } from '../types';
import { Language, translations } from '../translations';
import { getDisplayTitle } from '../utils/titleFormatter';

interface CommandPaletteProps {
  onClose: () => void;
  files: FileSystem;
  onFileSelect: (id: string) => void;
  language: Language;
  theme?: Theme;
}

// Helper to extract highlighted snippet
const getHighlightSnippet = (
  content: string,
  query: string,
  theme: Theme,
  maxLength = 60,
): { __html: string } | null => {
    if (!query || !content) return null;
    
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerContent.indexOf(lowerQuery);
    
    if (index === -1) return null;
    
    const start = Math.max(0, index - 20);
    const end = Math.min(content.length, index + query.length + 40);
    let snippet = content.slice(start, end);
    
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';
    
    // Highlight
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const highlightClass = theme === 'dark'
      ? 'text-cyan-300 bg-cyan-900/30'
      : 'text-cyan-600 bg-cyan-100';
    const highlighted = snippet.replace(
      regex,
      `<span class="${highlightClass} font-semibold px-0.5 rounded">$1</span>`,
    );
    
    return { __html: highlighted };
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  onClose,
  files,
  onFileSelect,
  language,
  theme = 'dark',
}) => {
  const t = translations[language];
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isDark = theme !== 'light';

  // Flatten files for search
  const searchableFiles = useMemo(() => 
    (Object.values(files) as FileSystemItem[]).filter(f => f.type === FileType.FILE), 
    [files]
  );

  const filteredFiles = useMemo(() => {
      let results;
      
      if (!query) {
          results = searchableFiles.slice(0, 5).map(f => ({
              file: f,
              score: 0,
              snippet: null
          }));
      } else {
          results = searchableFiles.map(f => {
              const nameMatch = f.name.toLowerCase().includes(query.toLowerCase());
              const tagMatch = f.tags?.some(t => t.toLowerCase().includes(query.toLowerCase()));
              const contentSnippet = !nameMatch && !tagMatch 
                    ? getHighlightSnippet(f.content || '', query, theme) 
                    : null;

              return {
                  file: f,
                  score: nameMatch ? 10 : tagMatch ? 5 : (contentSnippet ? 1 : 0),
                  snippet: contentSnippet
              };
          })
          .filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);
      }
      return results;
  }, [query, searchableFiles]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredFiles.length - 1));
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredFiles[selectedIndex]) {
            onFileSelect(filteredFiles[selectedIndex].file.id);
            onClose();
        }
    } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation(); // Stop propagation so global listeners don't fire redundantly
        onClose();
    }
  };

  // Reset selection on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
      <div
        className={`absolute inset-0 backdrop-blur-sm ${isDark ? 'bg-black/60' : 'bg-slate-300/50'}`}
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className={`w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden relative z-10 flex flex-col border
          ${isDark ? 'bg-[#0f172a] border-white/10' : 'bg-gradient-to-br from-[#e6ecf5] to-[#dde6f3] border-slate-300/70 text-slate-800'}`}
      >
        <div className={`flex items-center px-4 py-3 border-b ${isDark ? 'border-white/5 bg-white/5' : 'border-slate-300/70 bg-[#dde6f3]/80'}`}>
            <Search className={`w-5 h-5 mr-3 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
            <input 
                autoFocus
                className={`flex-1 bg-transparent border-none outline-none text-lg font-mono ${isDark ? 'text-white placeholder-gray-500' : 'text-slate-900 placeholder-slate-400'}`}
                placeholder={t.searchPrompt || "Search files, commands, or content..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <div className="flex gap-2">
                 <kbd className={`hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono ${isDark ? 'bg-white/10 text-gray-400' : 'bg-[#dde6f3] text-slate-500 border border-slate-200'}`}>ESC</kbd>
            </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-2 scrollbar-hide">
            {filteredFiles.length === 0 ? (
                <div className={`p-8 text-center flex flex-col items-center gap-2 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                    <Search size={32} className="opacity-20" />
                    <span className="text-sm">No matching results found.</span>
                </div>
            ) : (
                filteredFiles.map((item, index) => (
                    <div 
                        key={item.file.id}
                        onClick={() => {
                            onFileSelect(item.file.id);
                            onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`flex flex-col px-4 py-3 rounded-lg cursor-pointer transition-all border
                            ${index === selectedIndex
                              ? (isDark
                                  ? 'bg-cyan-900/30 border-cyan-500/30 shadow-lg'
                                  : 'bg-cyan-50 border-cyan-200 shadow-lg shadow-cyan-100/70')
                              : isDark
                                ? 'border-transparent hover:bg-white/5'
                                : 'border-transparent hover:bg-slate-100'}`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <FileText size={16} className={index === selectedIndex ? (isDark ? 'text-cyan-400' : 'text-cyan-600') : (isDark ? 'text-gray-600' : 'text-slate-400')} />
                                <span className={`font-medium truncate ${index === selectedIndex ? (isDark ? 'text-cyan-100' : 'text-cyan-700') : (isDark ? 'text-gray-400' : 'text-slate-600')}`}>
                                    {getDisplayTitle(item.file.name)}
                                </span>
                                
                                {item.file.tags && item.file.tags.length > 0 && (
                                    <div className="flex gap-1 ml-2">
                                        {item.file.tags.slice(0, 2).map(tag => (
                                            <span
                                              key={tag}
                                              className={`text-[10px] px-1.5 py-0.5 rounded ${
                                                isDark ? 'bg-white/5 text-gray-500' : 'bg-slate-200/60 text-slate-600'
                                              }`}
                                            >
                                              #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {index === selectedIndex && <ArrowRight size={14} className={isDark ? 'text-cyan-400' : 'text-cyan-600'} />}
                        </div>

                        {/* Content Snippet Highlight */}
                        {item.snippet && (
                            <div className={`mt-2 ml-7 text-xs font-mono p-2 rounded border-l-2 ${
                              isDark ? 'text-gray-500 bg-black/20 border-cyan-500/30' : 'text-slate-600 bg-slate-100 border-cyan-200'
                            }`}>
                                <div dangerouslySetInnerHTML={item.snippet} />
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
        
        <div className={`px-4 py-2 text-[10px] border-t flex justify-between items-center ${isDark ? 'bg-black/20 text-gray-500 border-white/5' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
            <span>{query ? `Found ${filteredFiles.length} results` : (t.proTip || 'TIP: Use ⇧⌘P / Ctrl+Shift+P to open quickly')}</span>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                    <ArrowRight size={10} />
                    <span>Select</span>
                </div>
                <div className="flex items-center gap-1">
                    <Command size={10} />
                    <span>{t.openPalette}</span>
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
};
