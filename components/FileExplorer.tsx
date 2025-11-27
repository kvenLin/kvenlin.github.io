
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, X, Search, ChevronLeft, Menu } from 'lucide-react';
import { FileSystem, FileSystemItem, FileType } from '../types';
import { IconHelper } from './IconHelper';
import { Language, translations } from '../translations';

interface FileExplorerProps {
  files: FileSystem;
  onToggleFolder: (id: string) => void;
  onFileClick: (id: string) => void;
  onNavigateHome: () => void;
  activeFileId: string | null;
  activeTag: string | null;
  onTagClick: (tag: string | null) => void;
  onOpenSearch?: () => void;
  language: Language;
  onToggleSidebar: () => void; // New prop
}

interface FileTreeItemProps extends Omit<FileExplorerProps, 'onNavigateHome' | 'onTagClick' | 'activeTag' | 'onOpenSearch' | 'language' | 'onToggleSidebar'> {
  itemId: string;
  depth: number;
  filterTag: string | null;
}

const hasMatchingChildren = (fileId: string, files: FileSystem, tag: string | null): boolean => {
  if (!tag) return true;
  const item = files[fileId];
  if (item.type === FileType.FILE) {
    return item.tags?.includes(tag) || false;
  }
  if (item.children) {
    return item.children.some(childId => hasMatchingChildren(childId, files, tag));
  }
  return false;
};

const FileTreeItem: React.FC<FileTreeItemProps> = ({ 
  itemId, 
  files, 
  onToggleFolder, 
  onFileClick, 
  activeFileId, 
  depth,
  filterTag
}) => {
  const item = files[itemId];
  if (!item) return null;

  const isFolder = item.type === FileType.FOLDER;
  const isActive = activeFileId === item.id;
  const paddingLeft = `${depth * 16 + 12}px`;
  
  const isVisible = hasMatchingChildren(itemId, files, filterTag);
  const isMatch = !isFolder && filterTag && item.tags?.includes(filterTag);

  if (!isVisible && filterTag) return null;

  return (
    <div className="relative">
      <motion.div 
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: 4, transition: { duration: 0.2 } }}
        transition={{ delay: depth * 0.05 }}
        className={`
          relative flex items-center py-1.5 cursor-pointer select-none text-sm transition-colors duration-200 group rounded-md mx-2 mb-0.5
          ${isActive ? 'bg-cyan-500/20 text-cyan-50' : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'}
          ${filterTag && !isMatch && !isFolder ? 'opacity-30' : 'opacity-100'}
        `}
        style={{ paddingLeft }}
        onClick={(e) => {
          e.stopPropagation();
          if (isFolder) {
            onToggleFolder(item.id);
          } else {
            onFileClick(item.id);
          }
        }}
      >
        {/* Active Indicator */}
        {isActive && (
            <motion.div 
                layoutId="active-indicator"
                className="absolute left-0 w-1 h-4 bg-cyan-400 rounded-r-full" 
            />
        )}

        <span className="mr-1.5 flex-shrink-0 opacity-70">
          {isFolder && (
            item.isOpen || filterTag ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          )}
          {!isFolder && <div className="w-[14px]" />} 
        </span>
        
        <IconHelper 
          name={item.name} 
          isFolder={isFolder} 
          isOpen={item.isOpen || !!filterTag} 
          className={`mr-2 transition-opacity ${isActive ? 'opacity-100 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]' : 'opacity-70'}`}
        />
        
        <span className={`truncate font-medium ${isMatch ? 'text-cyan-300' : ''}`}>{item.name}</span>
      </motion.div>

      <AnimatePresence>
        {isFolder && (item.isOpen || filterTag) && item.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {item.children.map(childId => (
              <FileTreeItem
                key={childId}
                itemId={childId}
                files={files}
                onToggleFolder={onToggleFolder}
                onFileClick={onFileClick}
                activeFileId={activeFileId}
                depth={depth + 1}
                filterTag={filterTag}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FileExplorer: React.FC<FileExplorerProps> = (props) => {
  const { files, onNavigateHome, activeFileId, activeTag, onTagClick, onOpenSearch, language, onToggleSidebar } = props;
  const t = translations[language];

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    (Object.values(files) as FileSystemItem[]).forEach(file => {
      if (file.tags) file.tags.forEach(t => tags.add(t));
    });
    return Array.from(tags).sort();
  }, [files]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden gap-6 pt-0">
      
      {/* Header / Toggle */}
      <div className="flex justify-between items-center p-3 px-4 border-b border-white/5 bg-black/20">
         <span className="text-[10px] font-mono text-cyan-500/70 border border-cyan-900/30 px-2 py-0.5 rounded bg-cyan-950/20">DEV.OS</span>
         <button onClick={onToggleSidebar} className="text-gray-500 hover:text-white transition-colors" title="Collapse Sidebar (Zen Mode)">
            <ChevronLeft size={16} />
         </button>
      </div>

      {/* Quick Access Section */}
      <div className="flex flex-col gap-1 px-2 mt-2">
         
         <div 
            onClick={onOpenSearch}
            className="mx-2 mb-4 px-3 py-2 bg-white/5 border border-white/5 rounded-lg flex items-center justify-between text-xs text-gray-500 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
         >
            <div className="flex items-center gap-2 group-hover:text-gray-300">
                <Search size={12} />
                <span>{t.searchPlaceholder}</span>
            </div>
            <kbd className="hidden md:block bg-black/30 px-1.5 rounded text-[10px] font-mono">⌘K</kbd>
         </div>

         <div className="px-3 py-2 text-[10px] font-bold text-gray-500 tracking-widest uppercase">{t.quickAccess}</div>
         <motion.button 
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNavigateHome}
            className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 mx-2 text-left relative overflow-hidden
                ${activeFileId === null && !activeTag ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
            `}
         >
            <div className="relative z-10 flex items-center gap-3">
                <IconHelper name="dashboard" type="dashboard" className={activeFileId === null && !activeTag ? 'text-white' : ''} />
                <span className="font-medium">{t.dashboard}</span>
            </div>
            {activeFileId === null && !activeTag && (
                <div className="absolute inset-0 bg-white/10 animate-pulse" />
            )}
         </motion.button>
      </div>

      {/* Tags Section */}
      <div className="flex flex-col gap-1 px-2 min-h-[80px]">
        <div className="px-3 py-2 text-[10px] font-bold text-gray-500 tracking-widest uppercase flex justify-between items-center">
            <span>{t.filterTags}</span>
            {activeTag && (
                <button onClick={() => onTagClick(null)} className="text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
                    <span className="text-[10px]">{t.clear}</span>
                    <X size={10} />
                </button>
            )}
        </div>
        <div className="flex flex-wrap gap-2 px-2">
            {allTags.map((tag, i) => {
                const isActive = activeTag === tag;
                return (
                    <motion.button
                        key={tag}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => onTagClick(isActive ? null : tag)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`
                            text-xs px-2.5 py-1 rounded-full border transition-all duration-200 flex items-center gap-1
                            ${isActive 
                                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                                : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300 hover:bg-white/10'}
                        `}
                    >
                        <span className="opacity-50">#</span>{tag}
                    </motion.button>
                )
            })}
        </div>
      </div>

      {/* Explorer Tree */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 py-2 text-[10px] font-bold text-gray-500 tracking-widest uppercase flex items-center justify-between">
            <span>{t.projectSource}</span>
            {activeTag && <IconHelper name="filter" type="filter" className="animate-pulse text-cyan-400" />}
        </div>
        <div className="flex-1 overflow-y-auto font-sans scrollbar-hide mask-image-b pb-4">
          <FileTreeItem 
            itemId="root" 
            depth={0} 
            files={files}
            onToggleFolder={props.onToggleFolder}
            onFileClick={props.onFileClick}
            activeFileId={props.activeFileId}
            filterTag={activeTag}
          />
        </div>
      </div>
    </div>
  );
};
