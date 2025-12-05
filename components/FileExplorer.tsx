import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, X, Search, ChevronLeft, Menu, Folder, Hash, ChevronUp, FileText } from 'lucide-react';
import { FileSystem, FileSystemItem, FileType, Theme } from '../types';
import { IconHelper } from './IconHelper';
import { getDisplayTitle } from '../utils/titleFormatter';
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
  onToggleSidebar: () => void;
  theme: Theme;
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
    // Match against both tags and categories
    return (item.tags?.includes(tag) || item.categories?.includes(tag)) || false;
  }
  if (item.children) {
    return item.children.some(childId => hasMatchingChildren(childId, files, tag));
  }
  return false;
};

const HIDDEN_FILE_IDS = new Set(['file-resume']);

const FileTreeItem = React.memo<FileTreeItemProps>(({ 
  itemId, 
  files, 
  onToggleFolder, 
  onFileClick, 
  activeFileId, 
  depth,
  filterTag,
  theme
}) => {
  const item = files[itemId];
  if (!item || HIDDEN_FILE_IDS.has(item.id)) return null;

  const isFolder = item.type === FileType.FOLDER;
  const displayName = isFolder ? item.name : getDisplayTitle(item.name);
  const isActive = activeFileId === item.id;
  const paddingLeft = `${depth * 16 + 12}px`;
  const isDark = theme === 'dark';
  const activeClasses = isDark 
    ? 'bg-cyan-500/20 text-cyan-50 shadow-[0_5px_15px_rgba(6,182,212,0.18)]' 
    : 'bg-cyan-500/10 text-cyan-900 shadow-[0_8px_20px_rgba(14,165,233,0.15)]';
  const inactiveClasses = isDark 
    ? 'text-gray-400 hover:text-gray-100 hover:bg-white/5' 
    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80';
  const indicatorColor = isDark ? 'bg-cyan-400' : 'bg-cyan-500';
  const chevronColor = isDark ? 'text-white/70' : 'text-slate-500';
  const iconBase = isActive 
    ? (isDark 
        ? 'opacity-100 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]' 
        : 'opacity-100 drop-shadow-[0_0_12px_rgba(14,165,233,0.35)] text-cyan-600')
    : (isDark ? 'opacity-70' : 'opacity-70 text-slate-500');
  const matchHighlight = isDark ? 'text-cyan-300' : 'text-cyan-700';

  const isVisible = hasMatchingChildren(itemId, files, filterTag);
  // Check match in tags OR categories
  const isMatch = !isFolder && filterTag && (item.tags?.includes(filterTag) || item.categories?.includes(filterTag));

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
          ${isActive ? activeClasses : inactiveClasses}
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
                className={`absolute left-0 w-1 h-4 rounded-r-full ${indicatorColor}`} 
            />
        )}

        <span className={`mr-1.5 flex-shrink-0 ${chevronColor}`}>
          {isFolder && (
            item.isOpen || filterTag ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          )}
          {!isFolder && <div className="w-[14px]" />} 
        </span>
        
        <div className="mr-2 w-4 h-4 flex items-center justify-center">
          <IconHelper 
            name={item.name} 
            isFolder={isFolder} 
            isOpen={item.isOpen || !!filterTag} 
            className={`transition-opacity ${iconBase}`}
            theme={theme}
          />
        </div>
        
        <span className={`truncate font-medium ${isMatch ? matchHighlight : ''}`}>{displayName}</span>
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
                theme={theme}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export const FileExplorer: React.FC<FileExplorerProps> = (props) => {
  const { files, onNavigateHome, activeFileId, activeTag, onTagClick, onOpenSearch, language, onToggleSidebar, theme } = props;
  const t = translations[language];
  const isDark = theme === 'dark';
  const shellClasses = isDark
    ? 'bg-[#050c1a]/75 border border-white/5 text-gray-200 shadow-[0_25px_45px_rgba(2,6,23,0.6)]'
    : 'bg-gradient-to-br from-[#e0e8f5] via-[#d4dced] to-[#c8d4e6] border border-slate-300/70 text-[#1f2b46] shadow-[0_35px_70px_rgba(9,16,35,0.20)]';
  const sectionLabelColor = isDark ? 'text-gray-500' : 'text-[#5c6787]';
  const mutedText = isDark ? 'text-gray-500' : 'text-[#6a7697]';
  const dividerGradient = isDark ? 'from-white/10' : 'from-[#c3cee5]';
  const quickCardClasses = isDark
    ? 'bg-white/5 border border-white/5 text-gray-500 hover:bg-white/10 hover:border-white/20'
    : 'bg-gradient-to-r from-[#d4e4f5] via-[#c8daf0] to-[#bcd0eb] text-[#1e293b] border border-blue-200/70 shadow-[0_15px_35px_rgba(15,23,42,0.15)] hover:border-cyan-400 hover:text-[#0a2f48]';

  // Expand state for Tags
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);
  const INITIAL_VISIBLE_COUNT = 6;

  const { allTags } = useMemo(() => {
    const tags = new Set<string>();
    
    (Object.values(files) as FileSystemItem[]).forEach(file => {
      if (file.tags) file.tags.forEach(t => tags.add(t));
    });
    
    return {
        allTags: Array.from(tags).sort(),
    };
  }, [files]);

  const visibleTags = isTagsExpanded ? allTags : allTags.slice(0, INITIAL_VISIBLE_COUNT);

  return (
    <div className={`flex-1 flex flex-col overflow-hidden gap-2 pt-0 rounded-3xl backdrop-blur-xl transition-colors duration-300 ${shellClasses}`}>
      
      {/* Header / Toggle */}
      <div className={`flex justify-between items-center p-4 px-5 border-b shrink-0 backdrop-blur-md ${isDark ? 'border-white/5 bg-black/5' : 'border-slate-200/60 bg-gradient-to-r from-[#f1f4fc]/85 to-[#e1e7f6]/80 text-[#1f2d4f]'}`}>
         <span className={`text-[10px] font-mono border px-2 py-0.5 rounded tracking-[0.3em] ${isDark ? 'text-cyan-300/80 border-cyan-900/40 bg-cyan-900/10' : 'text-cyan-600 border-cyan-200 bg-cyan-50/70'}`}>DEV.OS</span>
         <button 
            onClick={onToggleSidebar} 
            className={`transition-colors ${isDark ? 'text-gray-500 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`} 
            title="Collapse Sidebar (Zen Mode)"
        >
            <ChevronLeft size={16} />
         </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
          {/* Quick Access Section */}
          <div className="flex flex-col gap-1 px-2 mt-4 shrink-0">
             <div 
                onClick={onOpenSearch}
                className={`mx-2 mb-3 px-4 py-2 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer group ${quickCardClasses}`}
             >
                <div className={`flex items-center gap-2 ${isDark ? 'group-hover:text-gray-300' : 'group-hover:text-[#122742]'}`}>
                    <Search size={12} />
                    <span>{t.searchPlaceholder}</span>
                </div>
                <kbd className={`hidden md:block px-1.5 rounded text-[10px] font-mono ${isDark ? 'bg-black/30 text-gray-300' : 'bg-[#ced4e7] text-[#1f2c46]'}`}>⌘K</kbd>
             </div>

                <div className={`px-3 py-1 text-[10px] font-bold tracking-widest uppercase ${isDark ? 'text-gray-500' : 'text-[#5c6787]'}`}>{t.quickAccess}</div>
             <motion.button 
               whileHover={{ scale: 1.02, x: 5 }}
               whileTap={{ scale: 0.98 }}
               onClick={onNavigateHome}
               className={`
                   flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 mx-2 text-left relative overflow-hidden
                   ${activeFileId === null && !activeTag 
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' 
                        : isDark 
                            ? 'text-gray-400 hover:bg-white/5 hover:text-white' 
                            : 'text-[#2c3551] hover:bg-[#e6ecf8]/80 hover:text-[#0f1f3a]'}
               `}
            >
               <div className="relative z-10 flex items-center gap-3">
                   <IconHelper name="dashboard" type="dashboard" className={activeFileId === null && !activeTag ? 'text-white' : ''} theme={theme} />
                   <span className="font-medium">{t.dashboard}</span>
               </div>
               {activeFileId === null && !activeTag && (
                   <div className="absolute inset-0 bg-white/10 animate-pulse" />
               )}
            </motion.button>
          </div>

          {/* Tags Section */}
          {allTags.length > 0 && (
              <div className="flex flex-col gap-1 px-2 mt-4 shrink-0">
                <div className={`px-3 py-1 text-[10px] font-bold tracking-widest uppercase flex justify-between items-center ${isDark ? 'text-gray-500' : 'text-[#5c6787]'}`}>
                    <span>{t.filterTags}</span>
                    {activeTag && (
                        <button 
                            onClick={() => onTagClick(null)} 
                            className={`flex items-center gap-1 text-[10px] transition-colors ${isDark ? 'text-gray-500 hover:text-white' : 'text-[#6a7697] hover:text-[#0f1f38]'}`}
                        >
                            <span>{t.clear}</span>
                            <X size={10} />
                        </button>
                    )}
                </div>
                <div className="flex flex-wrap gap-2 px-2 pl-3">
                    {visibleTags.map((tag) => {
                        const isActive = activeTag === tag;
                        return (
                            <motion.button
                                key={tag}
                                onClick={() => onTagClick(isActive ? null : tag)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`
                                    text-[10px] px-2 py-0.5 rounded-full border transition-all duration-200 flex items-center gap-1
                                    ${isActive 
                                        ? (isDark 
                                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                                            : 'bg-cyan-100 border-cyan-400/70 text-cyan-700 shadow-[0_0_12px_rgba(14,165,233,0.25)]')
                                        : (isDark 
                                            ? 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300 hover:bg-white/10'
                                            : 'bg-[#e8ecf8] border-[#cfd8ee] text-[#3c4b6e] hover:border-cyan-200 hover:text-[#0e3a55] hover:bg-[#d9e5ff]')}
                                `}
                            >
                                <span className="opacity-50">#</span>{tag}
                            </motion.button>
                        )
                    })}
                    {allTags.length > INITIAL_VISIBLE_COUNT && (
                         <button 
                            onClick={() => setIsTagsExpanded(!isTagsExpanded)}
                            className={`text-[10px] ${isDark ? 'text-gray-500 hover:text-cyan-400' : 'text-[#6b7695] hover:text-[#0f3a55]' } transition-colors px-2 py-0.5 flex items-center gap-1`}
                        >
                             {isTagsExpanded ? 'Less' : `+${allTags.length - INITIAL_VISIBLE_COUNT}`}
                        </button>
                    )}
                </div>
              </div>
          )}

          {/* Explorer Tree */}
          <div className="flex-1 flex flex-col mt-4">
            <div className={`px-5 py-2 text-[10px] font-bold tracking-widest uppercase flex items-center justify-between ${isDark ? 'text-gray-500' : 'text-[#5c6787]'}`}>
                <span>{t.projectSource}</span>
                {activeTag && <IconHelper name="filter" type="filter" className={`animate-pulse ${isDark ? 'text-cyan-400' : 'text-cyan-500'}`} theme={theme} />}
            </div>
            <div className="flex-1 pb-4">
              <FileTreeItem 
                itemId="root" 
                depth={0} 
                files={files}
                onToggleFolder={props.onToggleFolder}
                onFileClick={props.onFileClick}
                activeFileId={props.activeFileId}
                filterTag={activeTag}
                theme={theme}
              />
            </div>
          </div>
      </div>
    </div>
  );
};
