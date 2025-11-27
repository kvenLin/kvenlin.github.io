
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { X, Clock, GitCommit, Activity, Hash, ArrowRight, Code, Copy, Check, Cpu, Power, Lock } from 'lucide-react';
import { FileSystemItem } from '../types';
import { IconHelper } from './IconHelper';
import { GlitchText } from './GlitchText';
import { Language, translations } from '../translations';

interface EditorAreaProps {
  openFiles: string[];
  activeFileId: string | null;
  files: Record<string, FileSystemItem>;
  onTabClick: (id: string) => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
  language: Language;
  onOpenFile: (id: string) => void;
  isBooting?: boolean; // Added prop
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
const Dashboard: React.FC<{ files: Record<string, FileSystemItem>, language: Language, onOpenFile: (id: string) => void, isBooting?: boolean }> = ({ files, language, onOpenFile, isBooting }) => {
    const t = translations[language];
    
    const recentPosts = (Object.values(files) as FileSystemItem[])
        .filter(f => f.type === 'FILE' && f.parentId?.includes('post'))
        .slice(0, 3);

    const distinctTags = Array.from(new Set((Object.values(files) as FileSystemItem[]).flatMap(f => f.tags || [])));

    // Active Dashboard View (Complex)
    return (
        <motion.div 
            // Wait for boot to finish before fading in dashboard if it's the first load
            initial={{ opacity: 0 }}
            animate={{ opacity: isBooting ? 0 : 1 }} 
            className="h-full flex flex-col items-center p-4 md:p-8 overflow-y-auto w-full custom-scrollbar scroll-smooth"
        >
            <div className="max-w-6xl w-full space-y-12 mt-4 md:mt-10 pb-20">
                
                {/* Hero Header */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={isBooting ? {} : { y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 p-8 rounded-3xl bg-gradient-to-r from-blue-900/10 to-transparent border border-white/5 relative overflow-hidden group shadow-2xl"
                >
                    <div className="absolute inset-0 bg-grid-pattern opacity-20" />
                    <div className="space-y-6 text-center md:text-left z-10 flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-2">
                             <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                             </span>
                             {t.systemStatus}: {t.operational}
                        </div>
                        <h1 className="text-4xl md:text-7xl font-bold text-white tracking-tight pb-2 text-glow">
                             <GlitchText text={t.welcome} />
                        </h1>
                        <p className="text-gray-400 text-lg max-w-xl leading-relaxed border-l-2 border-white/10 pl-4">
                            {t.intro}
                        </p>
                    </div>
                    
                    {/* Controls & Animated Core */}
                    <motion.div 
                        className="hidden md:flex flex-col items-end gap-6"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={isBooting ? {} : { scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 100, delay: 0.4 }}
                    >
                        <SystemCore isCompact />
                    </motion.div>
                </motion.div>

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
                            { icon: Clock, label: t.lastCommit, value: "2h ago", color: "text-blue-400" },
                            { icon: GitCommit, label: t.totalPosts, value: (Object.values(files) as FileSystemItem[]).filter(f => f.name.endsWith('.md')).length, color: "text-purple-400" },
                            { icon: Activity, label: t.activity, value: "98.4%", color: "text-emerald-400" }
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

                    {/* Recent Posts Column */}
                    <motion.div variants={{ hidden: { x: -20, opacity: 0 }, visible: { x: 0, opacity: 1 } }} className="md:col-span-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-cyan-500/80 uppercase tracking-widest flex items-center gap-2">
                                <ArrowRight size={14} /> {t.recentEntries}
                            </h3>
                            <div className="h-px flex-1 bg-gradient-to-r from-cyan-900/50 to-transparent ml-4" />
                        </div>
                        
                        <div className="space-y-4">
                            {recentPosts.map((post, i) => (
                                <div 
                                    key={post.id}
                                    onClick={() => onOpenFile(post.id)}
                                    className="group p-5 rounded-2xl bg-[#0f172a]/30 border border-white/5 cursor-pointer relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-900/10 hover:border-cyan-500/30"
                                >
                                    <div className="flex items-center justify-between mb-3 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <IconHelper name={post.name} className="group-hover:text-cyan-300 transition-colors" />
                                            <span className="text-gray-200 font-bold group-hover:text-cyan-300 transition-colors text-lg tracking-tight">{post.name}</span>
                                        </div>
                                        <span className="text-xs text-gray-500 font-mono bg-black/20 px-2.5 py-1 rounded-md border border-white/5">{post.date}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 pl-9 truncate opacity-70 relative z-10 group-hover:opacity-100 group-hover:text-gray-400 transition-all">
                                        {post.content?.slice(0, 100).replace(/[#`]/g, '')}...
                                    </p>
                                    <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                        <ArrowRight size={18} className="text-cyan-400" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Tags & Graph Column */}
                    <motion.div variants={{ hidden: { x: 20, opacity: 0 }, visible: { x: 0, opacity: 1 } }} className="md:col-span-4 space-y-6">
                         <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-purple-500/80 uppercase tracking-widest flex items-center gap-2">
                                <Hash size={14} /> {t.knowledgeGraph}
                            </h3>
                            <div className="h-px flex-1 bg-gradient-to-r from-purple-900/50 to-transparent ml-4" />
                        </div>

                        <div className="flex flex-wrap gap-2 content-start">
                            {distinctTags.map((tag, i) => (
                                <span 
                                    key={tag}
                                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-gray-400 hover:text-white hover:border-purple-500/30 hover:bg-purple-500/10 transition-all cursor-pointer select-none"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                        
                        {/* Interactive Decoration Widget */}
                        <div className="p-6 rounded-2xl bg-black/20 border border-white/5 relative overflow-hidden min-h-[160px] flex flex-col justify-end group">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-900/10" />
                            <div className="text-[10px] text-gray-500 mb-4 font-mono uppercase flex justify-between relative z-10">
                                <span>{t.activity}</span>
                                <span className="text-emerald-400 animate-pulse">RECORDING</span>
                            </div>
                            <div className="flex gap-1 h-20 items-end mask-image-b relative z-10">
                                {Array.from({ length: 25 }).map((_, i) => (
                                    <div 
                                        key={i} 
                                        className="flex-1 bg-emerald-500/20 rounded-t-sm hover:bg-emerald-400 transition-colors duration-300"
                                        style={{ 
                                            height: `${Math.max(10, Math.random() * 100)}%`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

            </div>
        </motion.div>
    );
}

// Custom Code Block component with Copy functionality
const CodeBlock = ({ inline, className, children, ...props }: any) => {
    const [copied, setCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || '');
    const codeContent = String(children).replace(/\n$/, '');

    const handleCopy = () => {
        navigator.clipboard.writeText(codeContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return !inline ? (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative group my-8 rounded-xl overflow-hidden border border-white/5 shadow-2xl bg-[#0b1120]"
        >
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-500 font-mono uppercase">{match ? match[1] : 'text'}</div>
                    <button 
                        onClick={handleCopy}
                        className="text-gray-500 hover:text-white transition-colors"
                        title="Copy code"
                    >
                        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>
                </div>
            </div>
            <code className={`${className} block p-6 text-sm font-mono overflow-x-auto text-gray-300`} {...props}>
                {children}
            </code>
        </motion.div>
    ) : (
        <code className={className} {...props}>
            {children}
        </code>
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
  isBooting
}) => {
  const activeFile = activeFileId ? files[activeFileId] : null;
  const contentRef = useRef<HTMLDivElement>(null);
  
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
      <div className="flex-1 overflow-y-auto relative scroll-smooth bg-transparent" ref={contentRef}>
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

            {activeFile.name.endsWith('.md') ? (
              <div className="prose prose-invert prose-lg max-w-none 
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-100
                prose-h1:text-4xl prose-h1:mb-8 prose-h1:bg-clip-text prose-h1:text-transparent prose-h1:bg-gradient-to-r prose-h1:from-white prose-h1:to-slate-400
                prose-h2:text-2xl prose-h2:text-cyan-100 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2 prose-h2:mt-12
                prose-p:text-slate-400 prose-p:leading-relaxed
                prose-strong:text-white
                prose-code:text-cyan-300 prose-code:bg-cyan-950/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-[#0b1120] prose-pre:border prose-pre:border-white/10 prose-pre:shadow-2xl prose-pre:rounded-xl
                prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline hover:prose-a:text-cyan-300
              ">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code: CodeBlock,
                    blockquote: ({node, ...props}) => (
                        <blockquote className="border-l-4 border-cyan-500 pl-6 italic text-gray-400 bg-cyan-900/10 py-4 pr-4 my-8 rounded-r-lg" {...props} />
                    )
                  }}
                >
                  {activeFile.content || ''}
                </ReactMarkdown>
                
                {activeFile.tags && (
                  <div className="mt-16 pt-6 border-t border-white/10 flex gap-2">
                    {activeFile.tags.map(tag => (
                      <span key={tag} className="text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full font-mono hover:bg-cyan-500/20 transition-colors cursor-default">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="font-mono text-sm whitespace-pre text-gray-300 bg-[#0b1120] p-6 rounded-xl border border-white/10 shadow-inner">
                {activeFile.content}
              </div>
            )}
          </motion.div>
        ) : (
          <Dashboard files={files} language={language} onOpenFile={onOpenFile} isBooting={isBooting} />
        )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
