
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { INITIAL_FILE_SYSTEM } from './constants';
import { FileSystem, Theme } from './types';
import { FileExplorer } from './components/FileExplorer';
import { EditorArea } from './components/EditorArea';
import { Terminal } from './components/Terminal';
import { CommandPalette } from './components/CommandPalette';
import { BootSequence } from './components/BootSequence';
import { TerminalSquare, Menu, ArrowUp, ArrowDown, Moon, Sun, LayoutGrid, ChevronLeft } from 'lucide-react';
import { Language, translations } from './translations';
import { loadPosts, loadSingleFile } from './utils/postLoader';

const SIDEBAR_MIN_WIDTH = 240;
const SIDEBAR_MAX_WIDTH = 480;
const SIDEBAR_DEFAULT_WIDTH = 300;

function App() {
  const [fileSystem, setFileSystem] = useState<FileSystem>(INITIAL_FILE_SYSTEM);
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [language, setLanguage] = useState<Language>('zh');
  const [theme, setTheme] = useState<Theme>(() => {
      return (localStorage.getItem('theme') as Theme) || 'dark';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to closed
  const [sidebarWidth, setSidebarWidth] = useState<number>(SIDEBAR_DEFAULT_WIDTH);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isNearLeftEdge, setIsNearLeftEdge] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarResizeState = useRef({ startX: 0, startWidth: SIDEBAR_DEFAULT_WIDTH });

  const t = translations[language];

  const clampSidebarWidth = useCallback((value: number) => {
    return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, value));
  }, []);

  // Persist theme
  useEffect(() => {
      localStorage.setItem('theme', theme);
      if (theme === 'dark') {
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('dark');
      }
  }, [theme]);

  // Load posts and static files on mount
  useEffect(() => {
    const fetchData = async () => {
        try {
            const [posts, readme, resume] = await Promise.all([
                loadPosts(),
                loadSingleFile('README.md', { id: 'file-readme', parentId: 'root', tags: ['system'] }),
                loadSingleFile('resume.md', { id: 'file-resume', name: 'resume.md', parentId: 'folder-public', tags: ['career'] })
            ]);
            
            setFileSystem(prev => {
                const newFileSystem = { ...prev };
                
                // Update posts
                const postIds = posts.map(p => p.id);
                posts.forEach(post => {
                    newFileSystem[post.id] = post;
                });
                if (newFileSystem['folder-posts']) {
                    newFileSystem['folder-posts'] = {
                        ...newFileSystem['folder-posts'],
                        children: postIds
                    };
                }

                // Update README
                if (readme) {
                    newFileSystem['file-readme'] = readme;
                }

                // Update Resume
                if (resume) {
                    newFileSystem['file-resume'] = resume;
                }
                
                return newFileSystem;
            });
        } catch (error) {
            console.error("Failed to load data:", error);
        }
    };
    fetchData();
  }, []);

  // Restore sidebar width preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedWidth = localStorage.getItem('sidebarWidth');
    if (storedWidth) {
      const parsed = Number(storedWidth);
      if (!Number.isNaN(parsed)) {
        setSidebarWidth(clampSidebarWidth(parsed));
      }
    }
  }, [clampSidebarWidth]);

  // Persist sidebar width
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('sidebarWidth', String(sidebarWidth));
  }, [sidebarWidth]);

  // Global Mouse Tracking for Spotlight Effect & Edge Detection
  useEffect(() => {
    let rafId: number | null = null;
    let mouseX = 0;
    let mouseY = 0;

    const EDGE_THRESHOLD = 60; // 距离左边缘的阈值（像素）

    const updateMousePosition = () => {
        if (containerRef.current) {
            containerRef.current.style.setProperty('--mouse-x', `${mouseX}px`);
            containerRef.current.style.setProperty('--mouse-y', `${mouseY}px`);
        }
        
        // 检测鼠标是否靠近左侧边缘（只在侧边栏打开时有效）
        if (isSidebarOpen) {
            const nearEdge = mouseX <= sidebarWidth + EDGE_THRESHOLD && mouseX >= sidebarWidth - 20;
            setIsNearLeftEdge(nearEdge);
        } else {
            setIsNearLeftEdge(false);
        }
        
        rafId = null;
    };

    const handleMouseMove = (e: MouseEvent) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (rafId === null) {
            rafId = requestAnimationFrame(updateMousePosition);
        }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
        }
    };
  }, [isSidebarOpen, sidebarWidth]);

  // Keyboard Shortcuts (Including ESC handling)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // Global ESC Handler
        if (e.key === 'Escape') {
            // Priority 1: Command Palette (If it doesn't stop propagation itself, catch it here)
            if (isPaletteOpen) {
                setIsPaletteOpen(false);
                return;
            }
            // Priority 2: Terminal
            if (isTerminalOpen) {
                setIsTerminalOpen(false);
                return;
            }
            // Priority 3: Clear Tags
            if (activeTag) {
                setActiveTag(null);
                return;
            }
            // Priority 4: Close File / Home
            if (activeFileId) {
                setActiveFileId(null);
                return;
            }
        }

        // Command Palette Toggle (Ctrl+K / Cmd+K)
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsPaletteOpen(prev => !prev);
        }
        // Toggle Sidebar (Ctrl+B / Cmd+B)
        if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
            e.preventDefault();
            setIsSidebarOpen(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaletteOpen, isTerminalOpen, activeTag, activeFileId]);

  // Sidebar resize listeners
  useEffect(() => {
    if (!isResizingSidebar) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const delta = e.clientX - sidebarResizeState.current.startX;
      const nextWidth = clampSidebarWidth(sidebarResizeState.current.startWidth + delta);
      setSidebarWidth(nextWidth);
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
    };
  }, [clampSidebarWidth, isResizingSidebar]);

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

  // Handle just closing the active file (keeping tags)
  const handleCloseFile = useCallback(() => {
    setActiveFileId(null);
  }, []);

  const handleTagClick = useCallback((tag: string | null) => {
    setActiveTag(tag);
    if (tag) {
        setIsSidebarOpen(true);
    }
  }, []);

  const handleSidebarResizeStart = useCallback((e: React.MouseEvent) => {
    if (!isSidebarOpen) return;
    e.preventDefault();
    sidebarResizeState.current = {
      startX: e.clientX,
      startWidth: sidebarWidth,
    };
    setIsResizingSidebar(true);
  }, [isSidebarOpen, sidebarWidth]);

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
        className={`flex h-screen w-screen overflow-hidden relative font-sans spotlight-group transition-colors duration-300
            ${theme === 'dark' 
                ? 'bg-[#020617] text-gray-300 selection:bg-cyan-500/30' 
                : 'bg-gray-100 text-gray-900 selection:bg-cyan-500/20'}
        `}
    >
      <AnimatePresence>
        {isBooting && <BootSequence onComplete={() => setIsBooting(false)} />}
      </AnimatePresence>

      {/* Global Overlays */}
      <div className="absolute inset-0 pointer-events-none z-[100] scanlines opacity-30 mix-blend-overlay" />
      <div className="bg-noise" />
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s'}} />
      </div>

      <AnimatePresence>
        {isPaletteOpen && (
            <CommandPalette 
                onClose={() => setIsPaletteOpen(false)}
                files={fileSystem}
                onFileSelect={handleFileClick}
                language={language}
            />
        )}
      </AnimatePresence>

      {/* Sidebar (Floating Glass with Collapse Animation) */}
      <motion.div 
         initial={false}
         animate={{ 
            width: isSidebarOpen ? sidebarWidth : 0, 
            opacity: isSidebarOpen ? 1 : 0,
            marginRight: isSidebarOpen ? 0 : -20 // Slightly pull content to avoid jump
         }}
         transition={isResizingSidebar
            ? { duration: 0, ease: 'linear' }
            : { duration: 0.4, ease: [0.4, 0, 0.2, 1] } // Smooth cubic-bezier
         }
         className="z-20 h-full py-4 pl-4 hidden md:flex flex-col overflow-hidden whitespace-nowrap relative"
      >
        <motion.div 
            className="flex-1 glass-panel rounded-2xl overflow-hidden flex flex-col shadow-2xl relative border-white/5"
            style={{ minWidth: SIDEBAR_MIN_WIDTH }}
        >
            <FileExplorer 
                files={fileSystem}
                onToggleFolder={handleToggleFolder}
                onFileClick={handleFileClick}
                activeFileId={activeFileId}
                onNavigateHome={handleNavigateHome}
                activeTag={activeTag}
                onTagClick={handleTagClick}
                onOpenSearch={() => setIsPaletteOpen(true)}
                language={language}
                onToggleSidebar={() => setIsSidebarOpen(false)}
                theme={theme}
            />

            <div className="p-3 border-t border-white/5 text-[10px] text-gray-500 font-mono text-center bg-black/20 backdrop-blur-md">
                <div className="flex justify-between items-center px-2">
                    <span>{t.sysStatusLabel}</span>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                        <span className="text-emerald-400/80">{t.sysStatusOnline}</span>
                    </div>
                </div>
            </div>
        </motion.div>

        {isSidebarOpen && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="调整侧边栏宽度"
            className={`absolute top-4 bottom-4 right-0 w-1 cursor-col-resize transition-colors duration-200 ${
              isResizingSidebar ? 'bg-cyan-400/80 shadow-[0_0_10px_rgba(34,211,238,0.6)]' : 'bg-white/10 hover:bg-white/40'
            }`}
            onMouseDown={handleSidebarResizeStart}
          />
        )}
      </motion.div>
      
      {/* Sidebar Toggle for when closed */}
      {!isSidebarOpen && !isBooting && (
        <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-6 left-6 z-50 p-2 bg-black/40 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:border-cyan-500/50 backdrop-blur-md transition-all"
            onClick={() => setIsSidebarOpen(true)}
        >
            <Menu size={20} />
        </motion.button>
      )}

      {/* 吸附式侧边栏收缩按钮 - 当鼠标靠近侧边栏边缘时显示 */}
      <AnimatePresence>
        {isSidebarOpen && isNearLeftEdge && !isResizingSidebar && (
          <motion.button
            initial={{ x: -20, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: -20, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed z-50 p-2 bg-black/60 border border-cyan-500/50 rounded-full text-cyan-400 hover:text-white hover:bg-cyan-500/20 hover:border-cyan-400 backdrop-blur-md transition-colors shadow-lg shadow-cyan-500/20"
            style={{
              left: sidebarWidth + 8,
              top: '50%',
              transform: 'translateY(-50%)'
            }}
            title="收起侧边栏 (Ctrl+B)"
          >
            <ChevronLeft size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 z-10 flex flex-col min-w-0 h-full p-4 relative">
        <EditorArea 
          openFiles={openFiles}
          activeFileId={activeFileId}
          files={fileSystem}
          onTabClick={handleTabClick}
          onCloseTab={handleCloseTab}
          language={language}
          onOpenFile={handleFileClick}
          isBooting={isBooting}
          onTagClick={handleTagClick} // Pass tag handler
          activeTag={activeTag} // Pass active tag
          onNavigateHome={handleNavigateHome} // Pass nav home
          onCloseFile={handleCloseFile}
          theme={theme}
        />
      </div>

      {/* Floating Action Buttons Group */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
         <AnimatePresence>
             {isFloatingMenuOpen && (
                 <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.8 }}
                    className="flex flex-col gap-3"
                 >
                     {/* Theme Toggle */}
                     <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                        className={`p-3 rounded-full shadow-lg border backdrop-blur-md transition-all
                            ${theme === 'dark' 
                                ? 'bg-black/60 text-gray-400 border-white/10 hover:text-yellow-400 hover:border-yellow-400/50' 
                                : 'bg-white/90 text-gray-600 border-gray-200 hover:text-gray-900 hover:border-gray-400'}
                        `}
                        title={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
                     >
                        {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                     </motion.button>

                     {/* Scroll Top */}
                     <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            const container = document.getElementById('main-scroll-container');
                            if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`p-3 rounded-full shadow-lg border backdrop-blur-md transition-all
                            ${theme === 'dark'
                                ? 'bg-black/60 text-gray-400 border-white/10 hover:text-cyan-400 hover:border-cyan-400/50'
                                : 'bg-white/90 text-gray-600 border-gray-200 hover:text-cyan-500 hover:border-cyan-400'}
                        `}
                     >
                        <ArrowUp size={20} />
                     </motion.button>

                     {/* Scroll Bottom */}
                     <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            const container = document.getElementById('main-scroll-container');
                            if (container) container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
                        }}
                        className={`p-3 rounded-full shadow-lg border backdrop-blur-md transition-all
                            ${theme === 'dark'
                                ? 'bg-black/60 text-gray-400 border-white/10 hover:text-cyan-400 hover:border-cyan-400/50'
                                : 'bg-white/90 text-gray-600 border-gray-200 hover:text-cyan-500 hover:border-cyan-400'}
                        `}
                     >
                        <ArrowDown size={20} />
                     </motion.button>

                     {/* Terminal Toggle */}
                     <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                        className={`
                            p-3 rounded-full shadow-lg border backdrop-blur-md transition-all
                            ${isTerminalOpen 
                                ? 'bg-cyan-600 text-white border-cyan-400 shadow-[0_0_15px_rgba(8,145,178,0.5)]' 
                                : (theme === 'dark' ? 'bg-black/60 text-gray-400 border-white/10 hover:text-cyan-400 hover:border-cyan-400/50' : 'bg-white/90 text-gray-600 border-gray-200 hover:text-cyan-500 hover:border-cyan-400')}
                        `}
                     >
                        <TerminalSquare size={20} />
                     </motion.button>
                 </motion.div>
             )}
         </AnimatePresence>

         {/* Main Toggle Button */}
         <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsFloatingMenuOpen(!isFloatingMenuOpen)}
            className={`
                p-3.5 rounded-full shadow-xl border backdrop-blur-xl transition-all z-50
                ${isFloatingMenuOpen 
                    ? 'bg-cyan-500 text-white border-cyan-400 rotate-45' 
                    : (theme === 'dark' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20' : 'bg-cyan-500 text-white border-cyan-600 hover:bg-cyan-600')}
            `}
         >
            <LayoutGrid size={22} />
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
                     <Terminal 
                        onClose={() => setIsTerminalOpen(false)} 
                        files={fileSystem}
                        onOpenFile={handleFileClick}
                        language={language}
                        setLanguage={setLanguage}
                        theme={theme}
                        setTheme={setTheme}
                     />
                </div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;
