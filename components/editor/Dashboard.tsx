import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Clock, GitCommit, Activity, Folder, ChevronUp, ChevronDown, ExternalLink, UserRound, Home, ChevronRight, FileText, Archive } from 'lucide-react';
import { FileSystemItem } from '../../types';
import { Language, translations } from '../../translations';
import { siteConfig } from '../../src/config/site';
import { IconHelper } from '../IconHelper';
import { getDisplayTitle } from '../../utils/titleFormatter';

// Category tree node structure
interface CategoryNode {
  name: string;
  fullPath: string;
  count: number;
  totalCount: number; // Total posts including all sub-categories
  children: Record<string, CategoryNode>;
  hasChildren: boolean;
  depth: number; // Max depth of children
}

interface DashboardProps {
  files: Record<string, FileSystemItem>;
  language: Language;
  onOpenFile: (id: string) => void;
  isBooting?: boolean;
  onTagClick: (tag: string | null) => void;
  activeTag?: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ files, language, onOpenFile, isBooting, onTagClick, activeTag }) => {
  const t = translations[language];
  
  // Current category path for drill-down navigation
  const [categoryPath, setCategoryPath] = useState<string[]>([]);
  // Track which category was clicked for expand animation
  const [expandingFromIndex, setExpandingFromIndex] = useState<number | null>(null);
  // Track animation direction: 'enter' for drilling down, 'exit' for going back
  const [animDirection, setAnimDirection] = useState<'enter' | 'exit'>('enter');

  // Build category tree structure
  const categoryTree = useMemo(() => {
    const root: Record<string, CategoryNode> = {};
    
    (Object.values(files) as FileSystemItem[]).forEach(f => {
      if (f.categories) {
        f.categories.forEach(catPath => {
          const parts = catPath.split('/').filter(Boolean);
          let currentLevel = root;
          let fullPath = '';
          
          parts.forEach((part, index) => {
            fullPath = fullPath ? `${fullPath}/${part}` : part;
            
            if (!currentLevel[part]) {
              currentLevel[part] = {
                name: part,
                fullPath,
                count: 0,
                totalCount: 0,
                children: {},
                hasChildren: false,
                depth: 0
              };
            }
            
            // Count at each level for totalCount
            currentLevel[part].totalCount++;
            
            // Only count at the leaf level (the actual category of the file)
            if (index === parts.length - 1) {
              currentLevel[part].count++;
            }
            
            // Mark parent as having children
            if (index < parts.length - 1) {
              currentLevel[part].hasChildren = true;
            }
            
            currentLevel = currentLevel[part].children;
          });
        });
      }
    });
    
    // Calculate depth for each node
    const calculateDepth = (node: CategoryNode): number => {
      const childNodes = Object.values(node.children);
      if (childNodes.length === 0) return 0;
      const maxChildDepth = Math.max(...childNodes.map(calculateDepth));
      node.depth = maxChildDepth + 1;
      return node.depth;
    };
    
    Object.values(root).forEach(calculateDepth);
    
    return root;
  }, [files]);

  // Get current level categories based on path
  const currentCategories = useMemo(() => {
    let level = categoryTree;
    for (const segment of categoryPath) {
      if (level[segment]) {
        level = level[segment].children;
      } else {
        return [];
      }
    }
    return Object.values(level).sort((a, b) => b.count - a.count);
  }, [categoryTree, categoryPath]);

  // Get posts for current category path
  const currentPathString = categoryPath.join('/');
  
  const recentPosts = useMemo(() => {
    return (Object.values(files) as FileSystemItem[])
      .filter(f => {
        const isPost = f.type === 'FILE' && f.parentId?.includes('post');
        if (!isPost) return false;
        
        // If we have a category path, filter by it
        if (currentPathString) {
          return f.categories?.some(cat => cat.startsWith(currentPathString));
        }
        
        // If activeTag is set from somewhere else, use it
        if (activeTag) {
          return f.tags?.includes(activeTag) || f.categories?.includes(activeTag);
        }
        
        return true;
      })
      .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
      .slice(0, currentPathString ? 20 : 4);
  }, [files, currentPathString, activeTag]);

  // Navigation handlers
  const handleCategoryClick = (cat: CategoryNode, index: number) => {
    // If clicking on already active category, toggle off the filter
    if (activeTag === cat.fullPath) {
      onTagClick(null);
      return;
    }
    
    if (cat.hasChildren) {
      // Has sub-categories, drill down with lighter animation
      setExpandingFromIndex(index);
      setAnimDirection('enter');
      // Use rAF to batch state changes，避免 setTimeout 延迟带来的跳帧
      requestAnimationFrame(() => {
        setCategoryPath(prev => [...prev, cat.name]);
        setExpandingFromIndex(null);
      });
    } else {
      // Leaf category, trigger filter
      onTagClick(cat.fullPath);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    setAnimDirection('exit');
    if (index < 0) {
      setCategoryPath([]);
      onTagClick(null);
    } else {
      setCategoryPath(categoryPath.slice(0, index + 1));
    }
  };

  const handleBackClick = () => {
    if (categoryPath.length > 0) {
      setCategoryPath(categoryPath.slice(0, -1));
    }
  };

  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);
  const INITIAL_VISIBLE_CATS = 8;
  const visibleCategories = isCategoriesExpanded ? currentCategories : currentCategories.slice(0, INITIAL_VISIBLE_CATS);

  // ESC key to go back one level (not directly to root)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // First, clear activeTag if set
        if (activeTag) {
          e.preventDefault();
          e.stopPropagation();
          onTagClick(null);
          return;
        }
        // Then, go back one level in category path
        if (categoryPath.length > 0) {
          e.preventDefault();
          e.stopPropagation();
          setAnimDirection('exit');
          setCategoryPath(categoryPath.slice(0, -1));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [categoryPath, activeTag, onTagClick]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isBooting ? 0 : 1 }}
      id="main-scroll-container"
      className="h-full flex flex-col items-center p-4 md:p-8 overflow-y-auto w-full custom-scrollbar"
    >
      <div className="max-w-6xl w-full space-y-12 mt-4 md:mt-10 pb-20">
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={isBooting ? {} : { y: 0, opacity: 1 }}
          transition={{ duration: 0.28, delay: 0.12, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col lg:flex-row items-stretch justify-between gap-8 p-8 rounded-3xl bg-gradient-to-br from-[#0b1120]/90 via-[#090f1d]/95 to-[#050912]/95 border border-white/5 relative overflow-hidden group shadow-2xl backdrop-blur-xl"
        >
          <div className="space-y-6 text-center lg:text-left z-10 flex-1">
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 text-xs font-mono flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                v{siteConfig.build.version}
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-950/30 border border-blue-500/20 text-blue-400 text-xs font-mono flex items-center gap-2">
                <GitCommit size={12} />
                {siteConfig.github.repository_name}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight pb-2">
              {siteConfig.title}
            </h1>
            <p className="text-gray-400 text-lg max-w-xl leading-relaxed border-l-2 border-white/10 pl-4">
              {siteConfig.description}
            </p>

            <div className="flex flex-col gap-4 pt-4">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-sm text-gray-300">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5">
                  <Clock size={14} className="text-blue-300" />
                  <span>{new Date(siteConfig.build.timestamp).toLocaleDateString()}</span>
                </div>
                <a
                  href={siteConfig.github.repository_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-gray-300 hover:text-white hover:border-cyan-400/60 transition-colors"
                >
                  <ExternalLink size={14} className="text-cyan-300" />
                  View Source
                </a>
              </div>

            </div>
          </div>

          <motion.div
            className="w-full lg:w-[340px] relative"
            initial={{ opacity: 0, x: 18 }}
            animate={isBooting ? {} : { opacity: 1, x: 0 }}
            transition={{ delay: 0.16, duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-600/10 to-transparent blur-3xl opacity-40" />
            <motion.div
              whileHover={{ y: -4 }}
              className="relative border border-white/10 rounded-2xl bg-[#050d1a]/80 backdrop-blur-xl shadow-[0_15px_45px_rgba(15,23,42,0.45)] overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <div className="flex flex-col items-center text-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onOpenFile('file-resume')}
                    className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-400/50 shadow-lg"
                    title={t.resumeCta}
                  >
                    <img
                      src={siteConfig.author.avatar || 'https://avatars.githubusercontent.com/u/000000?v=4'}
                      alt={siteConfig.author.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                  <div>
                    <p className="text-xs font-mono text-cyan-400 uppercase tracking-[0.4em]">{siteConfig.author.name}</p>
                    <p className="text-base text-gray-100 mt-1 font-semibold">{siteConfig.author.bio}</p>
                    <p className="text-xs text-gray-500 mt-1">{siteConfig.author.email}</p>
                  </div>
                  <button
                    onClick={() => onOpenFile('file-resume')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-50 border border-cyan-400/40 font-semibold text-xs shadow-[0_8px_18px_rgba(14,165,233,0.35)] hover:translate-y-0.5 transition-transform"
                  >
                    <UserRound size={14} />
                    {t.resumeCta}
                  </button>
                </div>
              </div>

              <motion.div
                className="absolute -right-6 -bottom-6 w-28 h-28 border border-dashed border-cyan-500/30 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
              />
              <motion.div
                className="absolute -right-2 -bottom-2 w-16 h-16 border border-cyan-500/40 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial="hidden"
          animate={isBooting ? 'hidden' : 'visible'}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.06,
                delayChildren: 0.1,
              },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              icon: Clock,
              label: 'Last Build',
              value: new Date(siteConfig.build.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              color: 'text-blue-400',
            },
            {
              icon: GitCommit,
              label: t.totalPosts,
              value: (Object.values(files) as FileSystemItem[]).filter(f => f.name.endsWith('.md') && f.parentId?.includes('post')).length,
              color: 'text-purple-400',
            },
            {
              icon: Activity,
              label: 'System Version',
              value: `v${siteConfig.build.version}`,
              color: 'text-emerald-400',
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={{ hidden: { y: 14, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
              className="bg-[#0f172a]/40 border border-white/5 p-5 rounded-2xl flex items-center gap-5 hover:border-white/10 hover:bg-white/5 transition-all group backdrop-blur-sm"
            >
              <div className={`p-3 rounded-xl bg-black/40 ${stat.color} shadow-inner group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} />
              </div>
              <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">{stat.label}</div>
                <div className="text-xl font-mono font-medium text-gray-100">{stat.value}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {siteConfig.projects.length > 0 && (
          <motion.div
            layout
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-cyan-500/80 uppercase tracking-widest flex items-center gap-2">
                <ExternalLink size={14} /> {t.hostedProjects}
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-cyan-900/50 to-transparent ml-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {siteConfig.projects.map((project, index) => (
                <a
                  key={project.url}
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group rounded-2xl border border-white/5 bg-[#0f172a]/40 p-5 overflow-hidden transition-all hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-900/20"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent" />
                  <div className="relative flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-gray-500 bg-black/20 px-2 py-0.5 rounded-full border border-white/5">
                      #{String(index + 1).padStart(2, '0')}
                    </span>
                    <ExternalLink size={16} className="text-gray-500 group-hover:text-cyan-300 transition-colors" />
                  </div>
                  <h3 className="relative text-lg font-semibold text-gray-100 group-hover:text-white tracking-tight">
                    {project.name}
                  </h3>
                  <p className="relative mt-3 text-sm text-gray-500 leading-relaxed group-hover:text-gray-300 min-h-[60px]">
                    {project.description}
                  </p>
                  <span className="relative mt-4 inline-flex items-center gap-2 text-xs font-mono text-cyan-300 uppercase tracking-widest">
                    {t.visitProject}
                    <ArrowRight size={14} className="transform transition-transform group-hover:translate-x-1" />
                  </span>
                </a>
              ))}
            </div>
          </motion.div>
        )}

        {currentCategories.length > 0 && (
          <motion.div layout="size" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14, duration: 0.22 }} className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-cyan-500/80 uppercase tracking-widest flex items-center gap-2">
                <Folder size={14} /> Categories
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-cyan-900/50 to-transparent ml-4" />
            </div>

            {/* Breadcrumb Navigation */}
            {categoryPath.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => handleBreadcrumbClick(-1)}
                  className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  <Home size={14} />
                  <span>Root</span>
                </button>
                {categoryPath.map((segment, index) => (
                  <React.Fragment key={index}>
                    <ChevronRight size={14} className="text-slate-600" />
                    <button
                      onClick={() => handleBreadcrumbClick(index)}
                      className={`transition-colors ${
                        index === categoryPath.length - 1
                          ? 'text-cyan-400 font-medium'
                          : 'text-slate-400 hover:text-cyan-400'
                      }`}
                    >
                      {segment}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={categoryPath.join('/')}
                initial={animDirection === 'enter' ? { opacity: 0, y: 26 } : { opacity: 0, y: -18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={animDirection === 'enter' ? { opacity: 0, y: -18 } : { opacity: 0, y: 26 }}
                transition={{
                  duration: 0.22,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
              >
                {visibleCategories.map((cat, index) => {
                  const isActive = activeTag === cat.fullPath;
                  // Stack layers based on depth (max 3 layers)
                  const stackLayers = Math.min(cat.depth, 3);
                  const isBeingClicked = expandingFromIndex === index;
                  
                  return (
                    <motion.div
                      key={cat.fullPath}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ 
                        opacity: isBeingClicked ? 0.65 : 1, 
                        scale: isBeingClicked ? 1.02 : 1, 
                        y: 0,
                        transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] }
                      }}
                      whileHover={{ scale: 1.01, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCategoryClick(cat, index)}
                      className="group relative w-full cursor-pointer"
                      style={{ paddingTop: stackLayers * 4, paddingRight: stackLayers * 4 }}
                    >
                      {/* Stack layers based on depth */}
                      {stackLayers >= 3 && (
                        <div className={`absolute top-0 right-0 w-full h-full rounded-2xl border transition-all duration-300 -z-30
                          ${isActive 
                            ? 'bg-cyan-900/20 border-cyan-500/20' 
                            : 'bg-[#0f172a]/30 border-white/5 group-hover:bg-[#0f172a]/40'
                          }
                        `} style={{ transform: 'translate(8px, 8px)' }} />
                      )}
                      {stackLayers >= 2 && (
                        <div className={`absolute top-0 right-0 w-full h-full rounded-2xl border transition-all duration-300 -z-20
                          ${isActive 
                            ? 'bg-cyan-900/30 border-cyan-500/25' 
                            : 'bg-[#0f172a]/40 border-white/5 group-hover:bg-[#0f172a]/50'
                          }
                        `} style={{ transform: 'translate(4px, 4px)' }} />
                      )}
                      {stackLayers >= 1 && (
                        <div className={`absolute top-0 right-0 w-full h-full rounded-2xl border transition-all duration-300 -z-10
                          ${isActive 
                            ? 'bg-cyan-900/40 border-cyan-500/30' 
                            : 'bg-[#0f172a]/50 border-white/5 group-hover:bg-[#0f172a]/60'
                          }
                        `} style={{ transform: 'translate(2px, 2px)' }} />
                      )}

                      {/* Main Card */}
                      <div className={`relative rounded-2xl border p-5 overflow-hidden transition-all duration-300
                        ${isActive 
                            ? 'bg-gradient-to-br from-cyan-950/70 via-[#0f172a]/90 to-[#0f172a]/80 border-cyan-500/50 shadow-2xl shadow-cyan-900/30' 
                            : 'bg-gradient-to-br from-[#0f172a]/60 via-[#0f172a]/50 to-[#0B1121]/60 border-white/10 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-900/20 hover:-translate-y-1'
                        }
                      `}>
                        
                        {/* Gradient overlay on hover */}
                        <div className={`absolute inset-0 transition-opacity duration-300 bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-transparent ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

                        {/* Header with Archive icon */}
                        <div className="relative flex items-center justify-between mb-4">
                          <div className={`p-2.5 rounded-xl border transition-all duration-300 ${
                            isActive 
                              ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' 
                              : 'bg-black/30 border-white/10 text-gray-400 group-hover:text-cyan-300 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/10'
                          }`}>
                            <Archive size={20} />
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`text-xl font-bold font-mono transition-colors ${
                              isActive ? 'text-cyan-300' : 'text-gray-300 group-hover:text-white'
                            }`}>
                              {cat.totalCount}
                            </span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                              {cat.totalCount === 1 ? 'post' : 'posts'}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className={`relative text-lg font-semibold tracking-tight transition-colors truncate ${
                          isActive ? 'text-white' : 'text-gray-100 group-hover:text-white'
                        }`}>
                          {cat.name}
                        </h3>

                        {/* Subtitle / Action hint */}
                        <div className="relative mt-3 flex items-center justify-between">
                          <p className={`text-sm transition-colors ${
                            isActive ? 'text-cyan-300/80' : 'text-gray-500 group-hover:text-gray-300'
                          }`}>
                            {cat.hasChildren 
                              ? `${Object.keys(cat.children).length} sub-categories` 
                              : 'View posts'
                            }
                          </p>
                          <ChevronRight size={16} className={`transition-all duration-300 ${
                            isActive 
                              ? 'text-cyan-400 translate-x-0 opacity-100' 
                              : 'text-gray-500 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-cyan-400'
                          }`} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {currentCategories.length > INITIAL_VISIBLE_CATS && (
              <motion.button
                layout
                onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
                className="self-center flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 transition-all group mt-2"
              >
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-cyan-400 transition-colors">
                  {isCategoriesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
                <span className="text-xs font-mono text-gray-400 group-hover:text-white uppercase tracking-widest">
                  {isCategoriesExpanded ? 'Show Less' : `+${currentCategories.length - INITIAL_VISIBLE_CATS} More Categories`}
                </span>
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Recent Entries Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isBooting ? { opacity: 0 } : { opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-cyan-500/80 uppercase tracking-widest flex items-center gap-2">
                <ArrowRight size={14} /> {activeTag ? `Filtered: #${activeTag}` : t.recentEntries}
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-cyan-900/50 to-transparent ml-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentPosts.map(post => (
                <div
                  key={post.id}
                  onClick={() => onOpenFile(post.id)}
                  className="group p-5 rounded-2xl bg-[#0f172a]/30 border border-white/5 cursor-pointer relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-900/10 hover:border-cyan-500/30 flex flex-col h-full"
                >
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="flex items-center gap-3">
                      <IconHelper name={post.name} className="group-hover:text-cyan-300 transition-colors" />
                      <span className="text-gray-200 font-bold group-hover:text-cyan-300 transition-colors text-lg tracking-tight truncate max-w-[200px]">{getDisplayTitle(post.name)}</span>
                    </div>
                    <span className="text-xs text-gray-500 font-mono bg-black/20 px-2.5 py-1 rounded-md border border-white/5 flex-shrink-0">{post.date}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate opacity-70 relative z-10 group-hover:opacity-100 group-hover:text-gray-400 transition-all flex-1">
                    {post.content?.slice(0, 100).replace(/[#`]/g, '')}...
                  </p>
                  <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                    <ArrowRight size={18} className="text-cyan-400" />
                  </div>
                </div>
              ))}
            </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
