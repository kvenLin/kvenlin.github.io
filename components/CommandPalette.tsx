
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Command, ArrowRight, Hash, AlignLeft } from 'lucide-react';
import { FileSystem, FileType, FileSystemItem } from '../types';
import { Language, translations } from '../translations';

interface CommandPaletteProps {
  onClose: () => void;
  files: FileSystem;
  onFileSelect: (id: string) => void;
  language: Language;
}

// Helper to extract highlighted snippet
const getHighlightSnippet = (content: string, query: string, maxLength = 60): { __html: string } | null => {
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
    const highlighted = snippet.replace(regex, '<span class="text-cyan-300 bg-cyan-900/30 font-bold px-0.5 rounded">$1</span>');
    
    return { __html: highlighted };
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onClose, files, onFileSelect, language }) => {
  const t = translations[language];
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

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
                    ? getHighlightSnippet(f.content || '', query) 
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl overflow-hidden relative z-10 flex flex-col"
      >
        <div className="flex items-center px-4 py-3 border-b border-white/5 bg-white/5">
            <Search className="w-5 h-5 text-cyan-400 mr-3" />
            <input 
                autoFocus
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-lg font-mono"
                placeholder={t.searchPrompt || "Search files, commands, or content..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <div className="flex gap-2">
                 <kbd className="hidden sm:inline-block px-2 py-0.5 bg-white/10 rounded text-[10px] text-gray-400 font-mono">ESC</kbd>
            </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-2 scrollbar-hide">
            {filteredFiles.length === 0 ? (
                <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
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
                        className={`
                            flex flex-col px-4 py-3 rounded-lg cursor-pointer transition-all border border-transparent
                            ${index === selectedIndex ? 'bg-cyan-900/20 border-cyan-500/20 shadow-lg' : 'hover:bg-white/5'}
                        `}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <FileText size={16} className={index === selectedIndex ? 'text-cyan-400' : 'text-gray-600'} />
                                <span className={`font-medium truncate ${index === selectedIndex ? 'text-cyan-100' : 'text-gray-400'}`}>
                                    {item.file.name}
                                </span>
                                
                                {item.file.tags && item.file.tags.length > 0 && (
                                    <div className="flex gap-1 ml-2">
                                        {item.file.tags.slice(0, 2).map(tag => (
                                            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500">#{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {index === selectedIndex && <ArrowRight size={14} className="text-cyan-400" />}
                        </div>

                        {/* Content Snippet Highlight */}
                        {item.snippet && (
                            <div className="mt-2 ml-7 text-xs text-gray-500 font-mono bg-black/20 p-2 rounded border-l-2 border-cyan-500/30">
                                <div dangerouslySetInnerHTML={item.snippet} />
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
        
        <div className="px-4 py-2 bg-black/20 text-[10px] text-gray-500 border-t border-white/5 flex justify-between items-center">
            <span>{query ? `Found ${filteredFiles.length} results` : t.proTip}</span>
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
