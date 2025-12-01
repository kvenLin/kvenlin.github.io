
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import type { LanguageFn } from 'highlight.js';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import javaLang from 'highlight.js/lib/languages/java';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import xml from 'highlight.js/lib/languages/xml';
import cssLang from 'highlight.js/lib/languages/css';
import scss from 'highlight.js/lib/languages/scss';
import less from 'highlight.js/lib/languages/less';
import sql from 'highlight.js/lib/languages/sql';
import pythonLang from 'highlight.js/lib/languages/python';
import graphql from 'highlight.js/lib/languages/graphql';
import markdownLang from 'highlight.js/lib/languages/markdown';
import 'highlight.js/styles/github-dark.css';
import { type LucideIcon, X, Clock, GitCommit, Activity, Hash, ArrowRight, Code, Copy, Check, Cpu, Power, Lock, FolderOpen, ChevronUp, ChevronDown, Folder, LayoutGrid, FileText, Terminal, Braces, Palette, Globe, Database, Bug, List, PanelRightClose } from 'lucide-react';
import { FileSystemItem, Theme } from '../types';
import { IconHelper } from './IconHelper';
import { GlitchText } from './GlitchText';
import { Language, translations } from '../translations';
import { siteConfig } from '../src/config/site';
import { Comments } from './Comments';

const HIGHLIGHT_LANGUAGES: Array<[string, LanguageFn]> = [
  ['javascript', javascript as LanguageFn],
  ['typescript', typescript as LanguageFn],
  ['bash', bash as LanguageFn],
  ['java', javaLang as LanguageFn],
  ['json', json as LanguageFn],
  ['yaml', yaml as LanguageFn],
  ['xml', xml as LanguageFn],
  ['css', cssLang as LanguageFn],
  ['scss', scss as LanguageFn],
  ['less', less as LanguageFn],
  ['sql', sql as LanguageFn],
  ['python', pythonLang as LanguageFn],
  ['graphql', graphql as LanguageFn],
  ['markdown', markdownLang as LanguageFn],
];

HIGHLIGHT_LANGUAGES.forEach(([name, language]) => {
  if (!hljs.getLanguage(name)) {
    hljs.registerLanguage(name, language);
  }
});

hljs.registerAliases(['js', 'jsx', 'javascriptreact'], { languageName: 'javascript' });
hljs.registerAliases(['ts', 'tsx', 'typescriptreact'], { languageName: 'typescript' });
hljs.registerAliases(['sh', 'shell', 'zsh'], { languageName: 'bash' });

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
  onNavigateHome?: () => void;
  onCloseFile?: () => void;
  theme: Theme;
}

// System Core Widget (3D Rotating)
const SystemCore = ({ isCompact = false, onClick }: { isCompact?: boolean; onClick?: () => void }) => (
    <motion.div 
        layout
        onClick={onClick}
        className={`relative flex items-center justify-center perspective-1000 cursor-pointer group ${isCompact ? 'w-24 h-24' : 'w-64 h-64'}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
    >
        {/* Outer Ring */}
        <motion.div 
            layoutId="core-outer"
            className={`system-core absolute inset-0 rounded-full border-2 border-dashed ${isCompact ? 'border-cyan-500/30' : 'border-cyan-500/20'} w-full h-full`} 
            style={{ animationDuration: isCompact ? '10s' : '20s' }}
        />
        
        {/* Inner Ring */}
        <motion.div 
            layoutId="core-inner"
            className={`system-core absolute ${isCompact ? 'inset-4 border-cyan-400/50' : 'inset-12 border-cyan-400/30'} rounded-full border w-auto h-auto`} 
            style={{ animationDirection: 'reverse', animationDuration: isCompact ? '15s' : '12s' }} 
        />
        
        {/* Center Icon */}
        <motion.div 
            layoutId="core-icon"
            className="absolute inset-0 flex items-center justify-center z-10"
        >
            <Cpu size={isCompact ? 32 : 64} className={`${isCompact ? 'text-cyan-400' : 'text-cyan-200'} animate-pulse`} />
        </motion.div>

        {/* Energy Field (Only visible in large mode) */}
        {!isCompact && (
            <div className="absolute inset-0 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
        )}

        {/* Text Label */}
        <motion.div 
            layoutId="core-label"
            className={`absolute ${isCompact ? '-bottom-6 text-[10px]' : '-bottom-12 text-sm'} text-cyan-500/80 font-mono tracking-widest text-center w-full`}
        >
            {isCompact ? 'CORE.ACTIVE' : 'SYSTEM.STANDBY'}
        </motion.div>
    </motion.div>
);

// Sub-component for the Dashboard view
const Dashboard: React.FC<{ 
    files: Record<string, FileSystemItem>, 
    language: Language, 
    onOpenFile: (id: string) => void, 
    isBooting?: boolean, 
    onTagClick: (tag: string | null) => void,
    activeTag?: string | null
}> = ({ files, language, onOpenFile, isBooting, onTagClick, activeTag }) => {
    const t = translations[language];
    
    // Filter posts based on activeTag
    const recentPosts = (Object.values(files) as FileSystemItem[])
        .filter(f => {
            const isPost = f.type === 'FILE' && f.parentId?.includes('post');
            if (!activeTag) return isPost;
            // Check tags and categories
            return isPost && (f.tags?.includes(activeTag) || f.categories?.includes(activeTag));
        })
        .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
        .slice(0, activeTag ? 20 : 4); // Show more if filtered

    const distinctTags = Array.from(new Set((Object.values(files) as FileSystemItem[]).flatMap(f => f.tags || [])));

    // Calculate Categories
    const categories = useMemo(() => {
        const cats: Record<string, number> = {};
        (Object.values(files) as FileSystemItem[]).forEach(f => {
            if (f.categories) {
                f.categories.forEach(c => {
                    cats[c] = (cats[c] || 0) + 1;
                });
            }
        });
        return Object.entries(cats).sort((a, b) => b[1] - a[1]); // Sort by count desc
    }, [files]);

    const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);
    const INITIAL_VISIBLE_CATS = 12;
    const visibleCategories = isCategoriesExpanded ? categories : categories.slice(0, INITIAL_VISIBLE_CATS);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: isBooting ? 0 : 1 }} 
            id="main-scroll-container"
            className="h-full flex flex-col items-center p-4 md:p-8 overflow-y-auto w-full custom-scrollbar"
        >
            <div className="max-w-6xl w-full space-y-12 mt-4 md:mt-10 pb-20">
                
                {/* Hero Header - Project Info Style */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={isBooting ? {} : { y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 p-8 rounded-3xl bg-[#0b1120]/80 border border-white/5 relative overflow-hidden group shadow-2xl backdrop-blur-sm"
                >
                    {/* ... content ... */}
                    <div className="space-y-6 text-center md:text-left z-10 flex-1">
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
                        
                        <div className="flex gap-4 justify-center md:justify-start pt-2">
                            <a href={siteConfig.github.repository_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                    <GitCommit size={16} />
                                </div>
                                <span>View Source</span>
                            </a>
                             <div className="flex items-center gap-2 text-sm text-gray-400">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                    <Clock size={16} />
                                </div>
                                <span>Built: {new Date(siteConfig.build.timestamp).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Controls & Animated Core */}
                    <motion.div 
                        className="hidden md:flex flex-col items-end gap-6 opacity-80"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={isBooting ? {} : { scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 100, delay: 0.4 }}
                    >
                        <SystemCore isCompact />
                    </motion.div>
                </motion.div>

                {/* Categories Deck (New Feature) */}
                {categories.length > 0 && (
                    <motion.div
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col gap-4"
                    >
                        <motion.div layout className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            <AnimatePresence mode="popLayout">
                                {visibleCategories.map(([cat, count], i) => (
                                    <motion.div
                                        layout
                                        key={cat}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        whileHover={{ scale: 1.05, y: -5, rotateX: 10 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="relative group cursor-pointer perspective-500"
                                        onClick={() => onTagClick(cat)} 
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="relative h-32 bg-[#0f172a]/60 border border-white/10 rounded-xl p-4 flex flex-col justify-between overflow-hidden backdrop-blur-md group-hover:border-cyan-500/50 transition-colors">
                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-30 transition-opacity">
                                                <Hash size={48} />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <Folder size={24} className="text-cyan-500 group-hover:text-cyan-400 transition-colors" />
                                                <span className="text-xs font-mono text-gray-500 bg-black/30 px-2 py-0.5 rounded-full">{count}</span>
                                            </div>
                                            <div className="mt-auto pt-4">
                                                <h3 className="font-medium text-gray-300 group-hover:text-cyan-300 truncate capitalize">{cat}</h3>
                                                <div className="w-8 h-0.5 bg-cyan-500/30 mt-2 group-hover:w-full transition-all duration-500" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                        
                        {categories.length > INITIAL_VISIBLE_CATS && (
                            <motion.button 
                                layout
                                onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
                                className="self-center flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 transition-all group"
                            >
                                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-cyan-400 transition-colors">
                                    {isCategoriesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </div>
                                <span className="text-xs font-mono text-gray-400 group-hover:text-white uppercase tracking-widest">
                                    {isCategoriesExpanded ? 'Show Less' : `+${categories.length - INITIAL_VISIBLE_CATS} More Modules`}
                                </span>
                            </motion.button>
                        )}
                    </motion.div>
                )}

                {/* ... rest of the grid ... */}


                {/* Staggered Content Grid */}
                <motion.div 
                    initial="hidden"
                    animate={isBooting ? "hidden" : "visible"}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.1,
                                delayChildren: 0.5 // Wait for header to settle
                            }
                        }
                    }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-6"
                >
                    {/* Stats Row */}
                    <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { 
                                icon: Clock, 
                                label: "Last Build", 
                                value: new Date(siteConfig.build.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
                                color: "text-blue-400" 
                            },
                            { 
                                icon: GitCommit, 
                                label: t.totalPosts, 
                                value: (Object.values(files) as FileSystemItem[]).filter(f => f.name.endsWith('.md') && f.parentId?.includes('post')).length, 
                                color: "text-purple-400" 
                            },
                            { 
                                icon: Activity, 
                                label: "System Version", 
                                value: `v${siteConfig.build.version}`, 
                                color: "text-emerald-400" 
                            }
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-[#0f172a]/40 border border-white/5 p-5 rounded-2xl flex items-center gap-5 hover:border-white/10 hover:bg-white/5 transition-all group backdrop-blur-sm">
                                <div className={`p-3 rounded-xl bg-black/40 ${stat.color} shadow-inner group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={20} />
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">{stat.label}</div>
                                    <div className="text-xl font-mono font-medium text-gray-100">{stat.value}</div>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Recent Posts Column - Full Width */}
                    <motion.div variants={{ hidden: { x: -20, opacity: 0 }, visible: { x: 0, opacity: 1 } }} className="md:col-span-12 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-cyan-500/80 uppercase tracking-widest flex items-center gap-2">
                                <ArrowRight size={14} /> {activeTag ? `Filtered: #${activeTag}` : t.recentEntries}
                            </h3>
                            <div className="h-px flex-1 bg-gradient-to-r from-cyan-900/50 to-transparent ml-4" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recentPosts.map((post, i) => (
                                <div 
                                    key={post.id}
                                    onClick={() => onOpenFile(post.id)}
                                    className="group p-5 rounded-2xl bg-[#0f172a]/30 border border-white/5 cursor-pointer relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-900/10 hover:border-cyan-500/30 flex flex-col h-full"
                                >
                                    <div className="flex items-center justify-between mb-3 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <IconHelper name={post.name} className="group-hover:text-cyan-300 transition-colors" />
                                            <span className="text-gray-200 font-bold group-hover:text-cyan-300 transition-colors text-lg tracking-tight truncate max-w-[200px]">{post.name}</span>
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
                </motion.div>

            </div>
        </motion.div>
    );
}

type LanguageTheme = {
    label: string;
    gradient: string;
    border: string;
    glow: string;
    headerBg: string;
    headerBorder: string;
    labelBg: string;
    labelText: string;
    copyHover: string;
    dotColors: string[];
    codeBg: string;
    codeText: string;
    icon: LucideIcon;
};

const BASE_LANGUAGE_THEME: LanguageTheme = {
    label: 'Code',
    gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    border: 'border-white/10',
    glow: 'shadow-[0_20px_45px_rgba(15,23,42,0.45)]',
    headerBg: 'bg-gradient-to-r from-white/10 via-white/5 to-transparent',
    headerBorder: 'border-white/10',
    labelBg: 'bg-cyan-500/10 border border-cyan-500/25',
    labelText: 'text-cyan-100',
    copyHover: 'hover:text-cyan-200',
    dotColors: ['bg-red-500/50', 'bg-yellow-500/50', 'bg-emerald-500/50'],
    codeBg: 'bg-[#050d1a]/95',
    codeText: 'text-slate-100',
    icon: Code,
};

const LANGUAGE_THEMES: Record<string, LanguageTheme> = {
    default: BASE_LANGUAGE_THEME,
    java: {
        ...BASE_LANGUAGE_THEME,
        label: 'Java',
        gradient: 'from-orange-500/25 via-amber-400/10 to-transparent',
        border: 'border-orange-400/40',
        glow: 'shadow-[0_22px_50px_rgba(251,146,60,0.28)]',
        headerBg: 'bg-gradient-to-r from-orange-500/20 via-amber-400/10 to-transparent',
        headerBorder: 'border-orange-400/40',
        labelBg: 'bg-orange-500/20 border border-orange-400/40',
        labelText: 'text-orange-50',
        copyHover: 'hover:text-orange-200',
        dotColors: ['bg-orange-500/70', 'bg-amber-400/60', 'bg-yellow-300/60'],
        codeBg: 'bg-[#211306]/95',
        codeText: 'text-orange-50',
        icon: Braces,
    },
    javascript: {
        ...BASE_LANGUAGE_THEME,
        label: 'JavaScript',
        gradient: 'from-amber-500/20 via-amber-500/10 to-transparent',
        border: 'border-amber-500/40',
        glow: 'shadow-[0_22px_50px_rgba(217,119,6,0.28)]',
        headerBg: 'bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent',
        headerBorder: 'border-amber-500/40',
        labelBg: 'bg-amber-500/15 border border-amber-400/40',
        labelText: 'text-amber-100',
        copyHover: 'hover:text-amber-200',
        dotColors: ['bg-amber-500/70', 'bg-amber-400/60', 'bg-yellow-300/60'],
        codeBg: 'bg-[#1f1405]/95',
        codeText: 'text-amber-50',
        icon: Braces,
    },
    typescript: {
        ...BASE_LANGUAGE_THEME,
        label: 'TypeScript',
        gradient: 'from-sky-500/20 via-sky-500/10 to-transparent',
        border: 'border-sky-500/40',
        glow: 'shadow-[0_22px_50px_rgba(56,189,248,0.28)]',
        headerBg: 'bg-gradient-to-r from-sky-500/15 via-sky-500/10 to-transparent',
        headerBorder: 'border-sky-500/40',
        labelBg: 'bg-sky-500/15 border border-sky-400/40',
        labelText: 'text-sky-100',
        copyHover: 'hover:text-sky-200',
        dotColors: ['bg-sky-500/70', 'bg-sky-400/60', 'bg-cyan-300/60'],
        codeBg: 'bg-[#061b2d]/95',
        codeText: 'text-sky-100',
        icon: Braces,
    },
    shell: {
        ...BASE_LANGUAGE_THEME,
        label: 'Shell',
        gradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
        border: 'border-emerald-500/35',
        glow: 'shadow-[0_22px_50px_rgba(16,185,129,0.25)]',
        headerBg: 'bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-transparent',
        headerBorder: 'border-emerald-500/35',
        labelBg: 'bg-emerald-500/20 border border-emerald-400/40',
        labelText: 'text-emerald-100',
        copyHover: 'hover:text-emerald-200',
        dotColors: ['bg-emerald-500/70', 'bg-emerald-400/60', 'bg-lime-300/60'],
        codeBg: 'bg-[#041a12]/95',
        codeText: 'text-emerald-100',
        icon: Terminal,
    },
    markup: {
        ...BASE_LANGUAGE_THEME,
        label: 'Markup',
        gradient: 'from-rose-500/20 via-rose-500/10 to-transparent',
        border: 'border-rose-500/40',
        glow: 'shadow-[0_22px_50px_rgba(244,114,182,0.28)]',
        headerBg: 'bg-gradient-to-r from-rose-500/15 via-rose-500/10 to-transparent',
        headerBorder: 'border-rose-500/40',
        labelBg: 'bg-rose-500/15 border border-rose-400/40',
        labelText: 'text-rose-100',
        copyHover: 'hover:text-rose-200',
        dotColors: ['bg-rose-500/70', 'bg-pink-400/60', 'bg-rose-300/60'],
        codeBg: 'bg-[#240414]/95',
        codeText: 'text-rose-100',
        icon: Globe,
    },
    styles: {
        ...BASE_LANGUAGE_THEME,
        label: 'Styles',
        gradient: 'from-violet-500/20 via-violet-500/10 to-transparent',
        border: 'border-violet-500/40',
        glow: 'shadow-[0_22px_50px_rgba(139,92,246,0.3)]',
        headerBg: 'bg-gradient-to-r from-violet-500/15 via-violet-500/10 to-transparent',
        headerBorder: 'border-violet-500/40',
        labelBg: 'bg-violet-500/15 border border-violet-400/40',
        labelText: 'text-violet-100',
        copyHover: 'hover:text-violet-200',
        dotColors: ['bg-violet-500/70', 'bg-purple-400/60', 'bg-indigo-300/60'],
        codeBg: 'bg-[#1a0f2b]/95',
        codeText: 'text-violet-100',
        icon: Palette,
    },
    data: {
        ...BASE_LANGUAGE_THEME,
        label: 'Data',
        gradient: 'from-amber-200/10 via-emerald-200/10 to-transparent',
        border: 'border-amber-300/30',
        glow: 'shadow-[0_22px_50px_rgba(250,204,21,0.22)]',
        headerBg: 'bg-gradient-to-r from-amber-300/15 via-emerald-200/10 to-transparent',
        headerBorder: 'border-amber-300/30',
        labelBg: 'bg-amber-300/15 border border-amber-200/40',
        labelText: 'text-amber-50',
        copyHover: 'hover:text-amber-100',
        dotColors: ['bg-amber-300/60', 'bg-emerald-300/60', 'bg-lime-200/60'],
        codeBg: 'bg-[#1b1805]/95',
        codeText: 'text-amber-100',
        icon: Database,
    },
    database: {
        ...BASE_LANGUAGE_THEME,
        label: 'Database',
        gradient: 'from-cyan-500/20 via-emerald-500/10 to-transparent',
        border: 'border-cyan-500/40',
        glow: 'shadow-[0_22px_50px_rgba(6,182,212,0.28)]',
        headerBg: 'bg-gradient-to-r from-cyan-500/15 via-emerald-500/10 to-transparent',
        headerBorder: 'border-cyan-500/40',
        labelBg: 'bg-cyan-500/15 border border-cyan-400/40',
        labelText: 'text-cyan-100',
        copyHover: 'hover:text-cyan-100',
        dotColors: ['bg-cyan-500/70', 'bg-emerald-400/60', 'bg-teal-300/60'],
        codeBg: 'bg-[#031a1c]/95',
        codeText: 'text-cyan-100',
        icon: Database,
    },
    python: {
        ...BASE_LANGUAGE_THEME,
        label: 'Python',
        gradient: 'from-indigo-500/20 via-sky-500/10 to-transparent',
        border: 'border-indigo-500/35',
        glow: 'shadow-[0_22px_50px_rgba(99,102,241,0.28)]',
        headerBg: 'bg-gradient-to-r from-indigo-500/15 via-sky-500/10 to-transparent',
        headerBorder: 'border-indigo-500/35',
        labelBg: 'bg-indigo-500/15 border border-indigo-400/40',
        labelText: 'text-indigo-100',
        copyHover: 'hover:text-indigo-200',
        dotColors: ['bg-indigo-500/70', 'bg-sky-400/60', 'bg-yellow-300/60'],
        codeBg: 'bg-[#0d1028]/95',
        codeText: 'text-indigo-100',
        icon: Bug,
    },
};

const LANGUAGE_ALIASES: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    es6: 'javascript',
    mjs: 'javascript',
    cjs: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    typescriptreact: 'typescript',
    javascriptreact: 'javascript',
    shell: 'shell',
    sh: 'shell',
    bash: 'shell',
    zsh: 'shell',
    fish: 'shell',
    powershell: 'shell',
    ps: 'shell',
    html: 'markup',
    xml: 'markup',
    svg: 'markup',
    md: 'markup',
    markdown: 'markup',
    css: 'styles',
    scss: 'styles',
    less: 'styles',
    styl: 'styles',
    json: 'data',
    yaml: 'data',
    yml: 'data',
    toml: 'data',
    java: 'java',
    graphql: 'data',
    sql: 'database',
    mysql: 'database',
    postgres: 'database',
    postgresql: 'database',
    sqlite: 'database',
    py: 'python',
    python: 'python',
};

const resolveLanguage = (className?: string) => {
    const match = /language-([\w-]+)/.exec(className || '');
    if (!match) return 'default';
    const raw = match[1].toLowerCase();
    return LANGUAGE_ALIASES[raw] ?? raw;
};

const prettifyLanguageLabel = (lang?: string) => {
    if (!lang || lang === 'default') return 'Code';
    return lang
        .split(/[-_]/)
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
};

const escapeHtml = (str: string) =>
    str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const slugify = (text: string) =>
    text
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
        .replace(/\s+/g, '-'
        )
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'section';

const createSlugger = () => {
    const counts = new Map<string, number>();
    return (value: string) => {
        const base = slugify(value);
        const count = counts.get(base) || 0;
        const id = count === 0 ? base : `${base}-${count}`;
        counts.set(base, count + 1);
        return id;
    };
};

const flattenText = (children: React.ReactNode): string => {
    if (typeof children === 'string' || typeof children === 'number') return `${children}`;
    if (Array.isArray(children)) return children.map(flattenText).join('');
    if (React.isValidElement(children)) {
        const elementProps = children.props as { children?: React.ReactNode };
        return flattenText(elementProps.children ?? '');
    }
    return '';
};

const stripMarkdown = (text: string): string => {
    return text
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Images
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
        .replace(/(\*\*|__)(.*?)\1/g, '$2') // Bold
        .replace(/(\*|_)(.*?)\1/g, '$2') // Italic
        .replace(/`([^`]+)`/g, '$1') // Inline code
        .replace(/~~(.*?)~~/g, '$1'); // Strikethrough
};

type TocItem = {
    id: string;
    text: string;
    level: number;
};

const buildToc = (markdown?: string): TocItem[] => {
    if (!markdown) return [];
    
    // 临时移除代码块以避免匹配到代码块中的注释
    const cleanMarkdown = markdown.replace(/```[\s\S]*?```/g, '');
    
    const regex = /^(#{1,3})\s+(.+)$/gm;
    const slugger = createSlugger();
    const toc: TocItem[] = [];
    let match;
    while ((match = regex.exec(cleanMarkdown)) !== null) {
        const level = match[1].length;
        if (level > 3) continue;
        const rawText = match[2].trim();
        const text = stripMarkdown(rawText);
        const id = slugger(text);
        // console.log('TOC Item:', text, '->', id);
        toc.push({ id, text, level });
    }
    return toc;
};

// Custom Code Block component with Copy functionality
const CodeBlock = ({ inline, className, children, node, ...props }: any) => {
    const [copied, setCopied] = useState(false);
    const languageMatch = /language-([\w-]+)/.exec(className || '');
    const rawLanguage = languageMatch?.[1]?.toLowerCase();
    const resolvedLanguage = resolveLanguage(className);
    const theme = useMemo(() => {
        if (LANGUAGE_THEMES[resolvedLanguage]) {
            return LANGUAGE_THEMES[resolvedLanguage];
        }
        const dynamicLabel = prettifyLanguageLabel(rawLanguage ?? resolvedLanguage);
        return {
            ...BASE_LANGUAGE_THEME,
            label: dynamicLabel,
            icon: Code,
        };
    }, [resolvedLanguage, rawLanguage]);
    const Icon = theme.icon ?? Code;
    const displayLabel = theme.label ?? prettifyLanguageLabel(rawLanguage ?? resolvedLanguage);
    const codeContent = String(children).replace(/\n$/, '');
    const highlightedHtml = useMemo(() => {
        if (!codeContent) return '';
        try {
            if (resolvedLanguage !== 'default' && hljs.getLanguage(resolvedLanguage)) {
                return hljs.highlight(codeContent, {
                    language: resolvedLanguage,
                    ignoreIllegals: true,
                }).value;
            }
            return hljs.highlightAuto(codeContent).value;
        } catch (error) {
            console.warn('highlight.js failed to render code block', error);
            return escapeHtml(codeContent);
        }
    }, [codeContent, resolvedLanguage]);

    // 检测是否为内联代码：无语言标记 且 不包含换行符 或 明确标记为 inline
    const isInline = inline || (!languageMatch && !codeContent.includes('\n'));

    const handleCopy = () => {
        navigator.clipboard.writeText(codeContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // 内联代码样式
    if (isInline) {
        return (
            <code 
                className="text-cyan-300 bg-cyan-950/30 px-1.5 py-0.5 rounded text-sm font-mono" 
                {...props}
            >
                {children}
            </code>
        );
    }

    // 代码块样式
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={`relative group my-8 rounded-2xl overflow-hidden border ${theme.border} ${theme.glow}`}
        >
            <div className={`absolute inset-0 pointer-events-none bg-gradient-to-br ${theme.gradient} opacity-60`} />
            <div className="relative">
                <div className={`flex items-center justify-between px-4 py-3 ${theme.headerBg} border-b ${theme.headerBorder}`}>
                    <div className="flex gap-1.5">
                        {theme.dotColors.map((dotClass, idx) => (
                            <div key={idx} className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-widest ${theme.labelBg} ${theme.labelText}`}>
                            <Icon size={14} />
                            {displayLabel}
                        </span>
                        <button 
                            onClick={handleCopy}
                            className={`text-gray-400 transition-colors ${theme.copyHover}`}
                            title="复制代码"
                        >
                            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                    </div>
                </div>
                <div className={`${className ?? ''} block p-6 text-sm font-mono overflow-x-auto ${theme.codeBg} ${theme.codeText}`} {...props}>
                    <pre className="whitespace-pre break-words m-0 p-0">
                        <code
                            className={`hljs block text-sm font-mono leading-relaxed ${theme.codeText}`}
                            dangerouslySetInnerHTML={{ __html: highlightedHtml || escapeHtml(codeContent) }}
                        />
                    </pre>
                </div>
            </div>
        </motion.div>
    );
};

export const EditorArea: React.FC<EditorAreaProps> = ({
  openFiles,
  activeFileId,
  files,
  onTabClick,
  onCloseTab,
  language,
  onOpenFile,
  isBooting,
  onTagClick,
  activeTag,
  onNavigateHome,
  onCloseFile
}) => {
  const activeFile = activeFileId ? files[activeFileId] : null;
  const contentRef = useRef<HTMLDivElement>(null);
  // 每次渲染都创建一个新的 slugger，确保 ReactMarkdown 重新渲染时 ID 计数重置，
  // 避免因为组件重渲染导致 ID 变成 title-1, title-2 等，从而与 TOC 不匹配
  const renderSlugger = createSlugger();
  
  const tocItems = useMemo(() => {
    return buildToc(activeFile?.content);
  }, [activeFile?.content]);

  const scrollToHeading = useCallback((id: string) => {
    const container = contentRef.current;
    if (!container) return;
    
    let target = document.getElementById(id);
    if (!target) {
        // Fallback for React Strict Mode double-invocation issue in dev
        // Headings might have a -1 suffix due to double rendering consuming the slugger
        const fallbackId = `${id}-1`;
        target = document.getElementById(fallbackId);
    }
    
    if (!target) return;
    
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const offset = targetRect.top - containerRect.top + container.scrollTop - 24;
    container.scrollTo({ top: Math.max(offset, 0), behavior: 'smooth' });
  }, []);

  const handleAnchorNavigation = useCallback((event: React.MouseEvent, id: string) => {
    event.preventDefault();
    scrollToHeading(id);
  }, [scrollToHeading]);

  // TOC 折叠状态
  const [isTocOpen, setIsTocOpen] = useState(true);
  
  // Update Document Title
  useEffect(() => {
    if (activeFile) {
      document.title = `${activeFile.name} | ${siteConfig.title}`;
    } else {
      document.title = siteConfig.title;
    }
  }, [activeFile]);

  // Scroll Progress
  const { scrollYProgress } = useScroll({ container: contentRef });
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div 
        layout
        className="flex-1 flex flex-col glass-panel rounded-2xl overflow-hidden shadow-2xl h-full border border-white/5 bg-[#0f172a]/40 backdrop-blur-3xl relative"
    >
      {/* Scroll Progress Bar */}
      {activeFile && (
          <motion.div
            className="absolute top-0 left-0 right-0 h-0.5 bg-cyan-500 z-50 origin-left"
            style={{ scaleX }}
          />
      )}

      {/* Tabs Bar */}
      {openFiles.length > 0 && (
        <div className="h-10 flex items-end px-4 gap-2 overflow-x-auto scrollbar-hide border-b border-white/5 bg-black/20 pt-2 shrink-0">
            <AnimatePresence mode='popLayout'>
            {openFiles.map(fileId => {
            const file = files[fileId];
            const isActive = activeFileId === fileId;
            if (!file) return null;

            return (
                <motion.div
                    key={fileId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => onTabClick(fileId)}
                    className={`
                        group relative flex items-center px-4 py-2 rounded-t-lg cursor-pointer text-xs select-none transition-all duration-200 border-t border-x min-w-[120px] max-w-[200px]
                        ${isActive 
                            ? 'bg-[#0f172a]/60 text-cyan-100 border-white/10 shadow-lg mb-[-1px] pb-2.5 z-10' 
                            : 'bg-transparent text-gray-500 border-transparent hover:bg-white/5 hover:text-gray-300'}
                    `}
                >
                    <div className={`absolute top-0 left-0 right-0 h-[2px] bg-cyan-500 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                    <IconHelper name={file.name} className={`mr-2 ${isActive ? 'opacity-100' : 'opacity-50'}`} />
                    <span className="truncate flex-1">{file.name}</span>
                    <button 
                        onClick={(e) => onCloseTab(fileId, e)}
                        className={`ml-2 p-0.5 rounded-full hover:bg-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 ${isActive ? 'opacity-100' : ''}`}
                    >
                        <X size={10} />
                    </button>
                </motion.div>
            );
            })}
            </AnimatePresence>
        </div>
      )}

      {/* Content Area */}
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
            {/* Scanning Line Effect on Load */}
            <div className="scanning-line" />

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-mono text-gray-500 mb-8 border-b border-white/5 pb-4">
                <span className="text-cyan-500/50">~/project</span>
                <span className="text-gray-700">/</span>
                <span>{activeFile.parentId?.replace('folder-', '')}</span>
                <span className="text-gray-700">/</span>
                <span className="text-cyan-300">{activeFile.name}</span>
            </div>

            {activeFile.name.endsWith('.md') && tocItems.length > 0 && (
              <div className="mb-12 rounded-2xl border border-white/5 bg-[#070c16]/80 p-6 shadow-2xl backdrop-blur-xl xl:hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                    <Hash size={18} />
                  </div>
                  <div>
                    <p className="text-xs tracking-[0.3em] text-cyan-400/70 uppercase">Table of Contents</p>
                    <h4 className="text-lg font-semibold text-white">当前文章目录</h4>
                  </div>
                </div>
                <nav className="space-y-1">
                  {tocItems.map(item => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => handleAnchorNavigation(e, item.id)}
                      className="flex items-center gap-3 rounded-xl py-2 px-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                      style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                    >
                      <span className="text-cyan-500/70 text-xs font-mono">{item.level === 1 ? 'H1' : item.level === 2 ? 'H2' : 'H3'}</span>
                      <span className="truncate flex-1">{item.text}</span>
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* 右侧悬浮 TOC - 可折叠 */}
            {activeFile.name.endsWith('.md') && tocItems.length > 0 && (
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
                        className="w-72 rounded-2xl border border-white/5 bg-[#070c16]/95 shadow-2xl backdrop-blur-2xl"
                      >
                        <div 
                          className="flex items-center justify-between px-5 py-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors"
                          onClick={() => setIsTocOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                              <List size={18} />
                            </div>
                            <div>
                              <p className="text-[11px] tracking-[0.4em] text-cyan-400/70 uppercase">TOC</p>
                              <h4 className="text-base font-semibold text-white">文章导航</h4>
                            </div>
                          </div>
                          <PanelRightClose size={16} className="text-gray-500 hover:text-white transition-colors" />
                        </div>
                        <nav className="max-h-[60vh] overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
                          {tocItems.map(item => (
                            <button
                              key={item.id}
                              onClick={(e) => {
                                handleAnchorNavigation(e, item.id);
                              }}
                              className="w-full flex items-center gap-3 rounded-xl py-2 px-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all text-left"
                              style={{ paddingLeft: `${(item.level - 1) * 14}px` }}
                            >
                              <span className="text-cyan-500/70 text-[11px] font-mono uppercase tracking-widest w-8 shrink-0">
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

            {activeFile.name.endsWith('.md') ? (
              <div className="prose prose-invert prose-lg max-w-none 
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-100
                prose-h2:text-2xl prose-h2:text-cyan-100 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2 prose-h2:mt-12
                prose-h3:text-xl prose-h3:text-cyan-50 prose-h3:mt-8
                prose-p:text-slate-400 prose-p:leading-relaxed
                prose-strong:text-white
                prose-code:text-cyan-300 prose-code:bg-cyan-950/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-[#0b1120] prose-pre:border prose-pre:border-white/10 prose-pre:shadow-2xl prose-pre:rounded-xl
                prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline hover:prose-a:text-cyan-300
                prose-ul:list-disc prose-ul:pl-6 prose-li:marker:text-cyan-500 prose-li:text-slate-300
                prose-ol:list-decimal prose-ol:pl-6 prose-li:marker:text-cyan-500
              ">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: ({ node, children, className, ...props }: any) => {
                      const text = flattenText(children);
                      const id = renderSlugger(text || 'section');
                      // console.log('Render H1:', text, '->', id);
                      return (
                        <div className="relative mb-14 group">
                          <h1
                            {...props}
                            id={id}
                            className={`relative inline-flex items-center gap-3 text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-500 drop-shadow-[0_12px_40px_rgba(34,211,238,0.35)] ${className ?? ''}`}
                          >
                            <span
                              onClick={(e) => handleAnchorNavigation(e, id)}
                              className="flex items-center gap-3 cursor-pointer"
                            >
                              <span className="text-cyan-400/0 group-hover:text-cyan-300 transition-colors">
                                <Hash className="opacity-0 group-hover:opacity-100" size={18} />
                              </span>
                              <span>{children}</span>
                            </span>
                          </h1>
                          <div className="mt-6 h-[3px] w-28 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-transparent shadow-[0_0_25px_rgba(14,165,233,0.45)]" />
                        </div>
                      );
                    },
                    h2: ({ node, children, className, ...props }: any) => {
                      const text = flattenText(children);
                      const id = renderSlugger(text || 'section');
                      return (
                        <h2
                          {...props}
                          id={id}
                          className={`group flex items-center gap-3 text-2xl font-bold tracking-tight text-cyan-50 border-b border-white/10 pb-2 mt-12 ${className ?? ''}`}
                        >
                          <span
                            onClick={(e) => handleAnchorNavigation(e, id)}
                            className="flex items-center gap-3 cursor-pointer"
                          >
                            <span className="text-cyan-400/60 group-hover:text-cyan-300 transition-colors">
                              <Hash size={16} />
                            </span>
                            <span>{children}</span>
                          </span>
                        </h2>
                      );
                    },
                    h3: ({ node, children, className, ...props }: any) => {
                      const text = flattenText(children);
                      const id = renderSlugger(text || 'section');
                      return (
                        <h3
                          {...props}
                          id={id}
                          className={`group flex items-center gap-2 text-xl font-semibold text-cyan-100 mt-8 ${className ?? ''}`}
                        >
                          <span
                            onClick={(e) => handleAnchorNavigation(e, id)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/70 group-hover:bg-cyan-300 transition-colors" />
                            <span>{children}</span>
                          </span>
                        </h3>
                      );
                    },
                    code: CodeBlock,
                    // Fix: Use div instead of p to avoid hydration errors when block elements are nested
                    p: ({node, ...props}) => <div className="mb-4 leading-relaxed text-slate-400" {...props} />,
                    blockquote: ({node, ...props}) => (
                        <blockquote className="border-l-4 border-cyan-500 pl-6 italic text-gray-400 bg-cyan-900/10 py-4 pr-4 my-8 rounded-r-lg" {...props} />
                    ),
                    ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 space-y-2 mb-6" {...props} />,
                    li: ({node, ...props}) => <li className="text-slate-300 pl-2 marker:text-cyan-500" {...props} />,
                    table: ({node, ...props}) => (
                      <div className="my-10 overflow-x-auto rounded-2xl border border-white/10 shadow-xl bg-[#050b16]">
                        <table className="min-w-full text-left text-sm" {...props} />
                      </div>
                    ),
                    thead: ({node, ...props}) => (
                      <thead className="uppercase tracking-[0.3em] text-xs text-cyan-200 bg-white/5" {...props} />
                    ),
                    tbody: ({node, ...props}) => (
                      <tbody className="divide-y divide-white/10" {...props} />
                    ),
                    tr: ({node, ...props}) => (
                      <tr className="hover:bg-white/5 transition-colors" {...props} />
                    ),
                    th: ({node, ...props}) => (
                      <th className="px-4 py-3 font-semibold text-sm" {...props} />
                    ),
                    td: ({node, ...props}) => (
                      <td className="px-4 py-3 text-slate-300" {...props} />
                    )
                  }}
                >
                  {activeFile.content || ''}
                </ReactMarkdown>
                
                {activeFile.tags && (
                  <div className="mt-16 pt-6 border-t border-white/10 flex gap-2 flex-wrap">
                    {activeFile.tags.map((tag, i) => (
                      <span 
                        key={`${tag}-${i}`} 
                        onClick={() => {
                            onTagClick(tag);
                            onCloseFile?.();
                        }}
                        className="text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full font-mono hover:bg-cyan-500/20 transition-colors cursor-pointer hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 评论区 - 仅对博客文章显示 */}
                {activeFile.parentId?.includes('post') && (
                  <Comments term={activeFile.id} />
                )}
              </div>
            ) : (
              <div className="font-mono text-sm whitespace-pre text-gray-300 bg-[#0b1120] p-6 rounded-xl border border-white/10 shadow-inner">
                {activeFile.content}
              </div>
            )}
          </motion.div>
        ) : (
          <Dashboard files={files} language={language} onOpenFile={onOpenFile} isBooting={isBooting} onTagClick={onTagClick} />
        )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
