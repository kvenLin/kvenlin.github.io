import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { INITIAL_FILE_SYSTEM } from './constants';
import { FileSystem } from './types';
import { FileExplorer } from './components/FileExplorer';
import { EditorArea } from './components/EditorArea';
import { Terminal } from './components/Terminal';
import { CommandPalette } from './components/CommandPalette';
import { TerminalSquare } from 'lucide-react';

function App() {
  const [fileSystem, setFileSystem] = useState<FileSystem>(INITIAL_FILE_SYSTEM);
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Global Mouse Tracking for Spotlight Effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (containerRef.current) {
            const x = e.clientX;
            const y = e.clientY;
            containerRef.current.style.setProperty('--mouse-x', `${x}px`);
            containerRef.current.style.setProperty('--mouse-y', `${y}px`);
        }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsPaletteOpen(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toggle folder expansion
  const handleToggleFolder = useCallback((folderId: string) => {
    setFileSystem(prev => ({
      ...prev,
      [folderId]: {
        ...prev[folderId],
        isOpen: !prev[folderId].isOpen
      }
    }));
  }, []);

  // Handle file opening
  const handleFileClick = useCallback((fileId: string) => {
    if (!openFiles.includes(fileId)) {
      setOpenFiles(prev => [...prev, fileId]);
    }
    setActiveFileId(fileId);
  }, [openFiles]);

  // Handle Home/Dashboard navigation
  const handleNavigateHome = useCallback(() => {
    setActiveFileId(null);
    setActiveTag(null);
  }, []);

  const handleTagClick = useCallback((tag: string | null) => {
    setActiveTag(tag);
  }, []);

  // Handle tab click
  const handleTabClick = useCallback((fileId: string) => {
    setActiveFileId(fileId);
  }, []);

  // Handle closing tab
  const handleCloseTab = useCallback((fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setOpenFiles(prev => {
      const newOpenFiles = prev.filter(id => id !== fileId);
      if (activeFileId === fileId) {
        if (newOpenFiles.length > 0) {
          setActiveFileId(newOpenFiles[newOpenFiles.length - 1]);
        } else {
          setActiveFileId(null);
        }
      }
      return newOpenFiles;
    });
  }, [activeFileId]);

  return (
    <div 
        ref={containerRef}
        className="flex h-screen w-screen bg-[#020617] text-gray-300 overflow-hidden relative selection:bg-cyan-500/30 font-sans spotlight-group"
    >
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s'}} />
      </div>

      <CommandPalette 
         isOpen={isPaletteOpen} 
         onClose={() => setIsPaletteOpen(false)}
         files={fileSystem}
         onFileSelect={handleFileClick}
      />

      {/* Sidebar (Floating Glass) */}
      <div className="z-10 w-72 h-full p-4 hidden md:flex flex-col">
        <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-1 glass-panel rounded-2xl overflow-hidden flex flex-col shadow-2xl relative"
        >
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                </div>
                <span className="text-[10px] font-mono text-cyan-500/70 border border-cyan-900/30 px-2 py-0.5 rounded bg-cyan-950/20">DEV.OS</span>
            </div>
            
            <FileExplorer 
                files={fileSystem}
                onToggleFolder={handleToggleFolder}
                onFileClick={handleFileClick}
                activeFileId={activeFileId}
                onNavigateHome={handleNavigateHome}
                activeTag={activeTag}
                onTagClick={handleTagClick}
                onOpenSearch={() => setIsPaletteOpen(true)}
            />

            <div className="p-3 border-t border-white/5 text-[10px] text-gray-500 font-mono text-center bg-black/20 backdrop-blur-md">
                <div className="flex justify-between items-center px-2">
                    <span>SYS.STATUS</span>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                        <span className="text-emerald-400/80">ONLINE</span>
                    </div>
                </div>
            </div>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 z-10 flex flex-col min-w-0 h-full p-4 pl-0 relative">
        <EditorArea 
          openFiles={openFiles}
          activeFileId={activeFileId}
          files={fileSystem}
          onTabClick={handleTabClick}
          onCloseTab={handleCloseTab}
        />
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
         <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsTerminalOpen(!isTerminalOpen)}
            className={`
                p-3 rounded-full shadow-lg border backdrop-blur-md transition-all
                ${isTerminalOpen 
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-[0_0_15px_rgba(8,145,178,0.5)]' 
                    : 'bg-black/40 text-gray-400 border-white/10 hover:text-cyan-400 hover:border-cyan-400/50'}
            `}
         >
            <TerminalSquare size={20} />
         </motion.button>
      </div>

      {/* Terminal Overlay */}
      <AnimatePresence>
        {isTerminalOpen && (
            <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-40 h-[40vh] md:h-[350px] p-4 md:px-72" 
            >
                <div className="h-full w-full glass-panel rounded-t-2xl shadow-2xl overflow-hidden border-t border-x border-white/10">
                     <Terminal onClose={() => setIsTerminalOpen(false)} />
                </div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;