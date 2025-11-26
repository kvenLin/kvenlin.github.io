import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Command, Clock, GitCommit, Activity, Hash, ArrowRight, Code } from 'lucide-react';
import { FileSystemItem } from '../types';
import { IconHelper } from './IconHelper';

interface EditorAreaProps {
  openFiles: string[];
  activeFileId: string | null;
  files: Record<string, FileSystemItem>;
  onTabClick: (id: string) => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
}

// Typewriter Component
const Typewriter: React.FC<{ text: string; delay?: number }> = ({ text, delay = 50 }) => {
    const [currentText, setCurrentText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setCurrentText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, delay);
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, delay, text]);

    return <span>{currentText}<span className="animate-pulse text-cyan-400">_</span></span>;
};

// Sub-component for the Dashboard view
const Dashboard: React.FC<{ files: Record<string, FileSystemItem> }> = ({ files }) => {
    const recentPosts = (Object.values(files) as FileSystemItem[])
        .filter(f => f.type === 'FILE' && f.parentId?.includes('post'))
        .slice(0, 3);

    const distinctTags = Array.from(new Set((Object.values(files) as FileSystemItem[]).flatMap(f => f.tags || [])));

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full flex flex-col items-center p-8 overflow-y-auto w-full"
        >
            <div className="max-w-5xl w-full space-y-12 mt-10">
                
                {/* Hero Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 p-8 rounded-2xl bg-gradient-to-r from-blue-900/10 to-transparent border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-grid-pattern opacity-20" />
                    <div className="space-y-4 text-center md:text-left z-10">
                        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight pb-2 text-glow">
                            <Typewriter text="Hello, Developer." />
                        </h1>
                        <p className="text-gray-400 text-lg max-w-lg leading-relaxed">
                            Welcome to the <span className="text-cyan-400">neural interface</span> of my digital brain. 
                            Browse code, read thoughts, and execute commands.
                        </p>
                    </div>
                    <motion.div 
                         whileHover={{ rotate: 5, scale: 1.05 }}
                         className="p-8 rounded-2xl bg-black/30 border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)] backdrop-blur-md z-10 hidden md:block"
                    >
                        <Code size={64} className="text-cyan-400" strokeWidth={1} />
                    </motion.div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: Clock, label: "Last Commit", value: "2h ago", color: "text-blue-400" },
                        { icon: GitCommit, label: "Total Posts", value: (Object.values(files) as FileSystemItem[]).filter(f => f.name.endsWith('.md')).length, color: "text-purple-400" },
                        { icon: Activity, label: "System Status", value: "Operational", color: "text-emerald-400" }
                    ].map((stat, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -4, backgroundColor: "rgba(255,255,255,0.03)" }}
                            className="bg-[#0f172a]/40 border border-white/5 p-5 rounded-xl flex items-center gap-5 transition-all hover:border-white/10 group shadow-lg"
                        >
                            <div className={`p-3 rounded-lg bg-black/40 ${stat.color} shadow-inner`}>
                                <stat.icon size={20} />
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">{stat.label}</div>
                                <div className="text-xl font-mono font-medium text-gray-100 group-hover:text-white transition-colors">{stat.value}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Content Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    
                    {/* Recent Posts */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-bold text-cyan-500/80 uppercase tracking-widest flex items-center gap-2">
                            <ArrowRight size={14} /> Recent Entries
                        </h3>
                        <div className="space-y-3">
                            {recentPosts.map((post, i) => (
                                <motion.div 
                                    key={post.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + (i * 0.1) }}
                                    className="group p-4 rounded-xl bg-[#0f172a]/30 border border-white/5 hover:border-cyan-500/30 hover:bg-[#0f172a]/60 transition-all cursor-default relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex items-center justify-between mb-2 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <IconHelper name={post.name} />
                                            <span className="text-gray-200 font-medium group-hover:text-cyan-300 transition-colors text-lg">{post.name}</span>
                                        </div>
                                        <span className="text-xs text-gray-600 font-mono bg-black/20 px-2 py-1 rounded">{post.date}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 pl-8 truncate opacity-70 relative z-10">
                                        {post.content?.slice(0, 80).replace(/[#`]/g, '')}...
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Topics / Tags */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-bold text-purple-500/80 uppercase tracking-widest flex items-center gap-2">
                            <Hash size={14} /> Knowledge Graph
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {distinctTags.map((tag, i) => (
                                <motion.span 
                                    key={tag}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3 + (i * 0.05) }}
                                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-sm text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all cursor-default"
                                >
                                    #{tag}
                                </motion.span>
                            ))}
                        </div>
                        
                        {/* Contribution Map Decoration */}
                        <div className="pt-8 p-4 rounded-xl bg-black/20 border border-white/5">
                            <div className="text-[10px] text-gray-500 mb-3 font-mono uppercase flex justify-between">
                                <span>Activity</span>
                                <span className="text-emerald-500">High</span>
                            </div>
                            <div className="flex gap-1 h-16 items-end mask-image-b">
                                {Array.from({ length: 40 }).map((_, i) => (
                                    <div 
                                        key={i} 
                                        className="w-full bg-gradient-to-t from-emerald-900 to-emerald-400 rounded-t-sm" 
                                        style={{ height: `${Math.random() * 100}%`, opacity: 0.4 + Math.random() * 0.6 }} 
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </motion.div>
    );
}

export const EditorArea: React.FC<EditorAreaProps> = ({
  openFiles,
  activeFileId,
  files,
  onTabClick,
  onCloseTab
}) => {
  const activeFile = activeFileId ? files[activeFileId] : null;

  return (
    <motion.div 
        layout
        className="flex-1 flex flex-col glass-panel rounded-2xl overflow-hidden shadow-2xl h-full border border-white/5 bg-[#0f172a]/40"
    >
      {/* Tabs Bar */}
      {openFiles.length > 0 && (
        <div className="h-10 flex items-end px-4 gap-2 overflow-x-auto scrollbar-hide border-b border-white/5 bg-black/20 pt-2">
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
                        group relative flex items-center px-4 py-2 rounded-t-lg cursor-pointer text-xs select-none transition-all duration-200 border-t border-x
                        ${isActive 
                            ? 'bg-[#0f172a]/60 text-cyan-100 border-white/10 shadow-lg mb-[-1px] pb-2.5 z-10' 
                            : 'bg-transparent text-gray-500 border-transparent hover:bg-white/5 hover:text-gray-300'}
                    `}
                >
                    <div className={`absolute top-0 left-0 right-0 h-[2px] bg-cyan-500 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                    <IconHelper name={file.name} className={`mr-2 ${isActive ? 'opacity-100' : 'opacity-50'}`} />
                    <span className="truncate max-w-[150px]">{file.name}</span>
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
      <div className="flex-1 overflow-y-auto relative scroll-smooth bg-transparent">
        <AnimatePresence mode="wait">
        {activeFile ? (
          <motion.div 
            key={activeFile.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-4xl mx-auto p-8 md:p-12 pb-32"
          >
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
                    code({node, inline, className, children, ...props}: any) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline ? (
                        <div className="relative group my-8 rounded-xl overflow-hidden border border-white/5 shadow-2xl bg-[#0b1120]">
                           <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                                </div>
                                <div className="text-xs text-gray-500 font-mono">{match ? match[1] : 'code'}</div>
                           </div>
                           <code className={`${className} block p-6 text-sm font-mono overflow-x-auto text-gray-300`} {...props}>
                            {children}
                          </code>
                        </div>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    },
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
          <Dashboard files={files} />
        )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};