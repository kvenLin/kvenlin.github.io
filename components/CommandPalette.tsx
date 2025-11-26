import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Command, ArrowRight } from 'lucide-react';
import { FileSystem, FileType, FileSystemItem } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileSystem;
  onFileSelect: (id: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, files, onFileSelect }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Flatten files for search
  const searchableFiles = (Object.values(files) as FileSystemItem[]).filter(f => f.type === FileType.FILE);
  const filteredFiles = searchableFiles.filter(f => 
    f.name.toLowerCase().includes(query.toLowerCase()) || 
    f.tags?.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        setSelectedIndex(prev => Math.min(prev + 1, filteredFiles.length - 1));
      } else if (e.key === 'ArrowUp') {
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        if (filteredFiles[selectedIndex]) {
          onFileSelect(filteredFiles[selectedIndex].id);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredFiles, selectedIndex, onFileSelect, onClose]);

  // Reset selection on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="w-full max-w-xl bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl overflow-hidden relative z-10 flex flex-col"
      >
        <div className="flex items-center px-4 py-3 border-b border-white/5 bg-white/5">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input 
                autoFocus
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-lg"
                placeholder="Search files or type a command..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex gap-2">
                 <kbd className="hidden sm:inline-block px-2 py-0.5 bg-white/10 rounded text-[10px] text-gray-400 font-mono">ESC</kbd>
            </div>
        </div>

        <div className="max-h-[300px] overflow-y-auto p-2 scrollbar-hide">
            {filteredFiles.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                    No matching files found.
                </div>
            ) : (
                filteredFiles.map((file, index) => (
                    <div 
                        key={file.id}
                        onClick={() => {
                            onFileSelect(file.id);
                            onClose();
                        }}
                        className={`
                            flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors
                            ${index === selectedIndex ? 'bg-blue-600/20 text-blue-100' : 'text-gray-400 hover:bg-white/5'}
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <FileText size={16} className={index === selectedIndex ? 'text-blue-400' : 'text-gray-600'} />
                            <span className="font-medium">{file.name}</span>
                        </div>
                        {index === selectedIndex && <ArrowRight size={14} className="text-blue-400" />}
                    </div>
                ))
            )}
        </div>
        
        <div className="px-4 py-2 bg-black/20 text-[10px] text-gray-500 border-t border-white/5 flex justify-between">
            <span>PRO TIP: Search by tags with #</span>
            <div className="flex items-center gap-1">
                <Command size={10} />
                <span>+ K to open</span>
            </div>
        </div>
      </motion.div>
    </div>
  );
};