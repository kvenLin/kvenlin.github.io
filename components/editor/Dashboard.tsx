import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Clock, GitCommit, Activity, Hash, Folder, ChevronUp, ChevronDown } from 'lucide-react';
import { FileSystemItem } from '../../types';
import { Language, translations } from '../../translations';
import { siteConfig } from '../../src/config/site';
import { IconHelper } from '../IconHelper';

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

  const recentPosts = (Object.values(files) as FileSystemItem[])
    .filter(f => {
      const isPost = f.type === 'FILE' && f.parentId?.includes('post');
      if (!activeTag) return isPost;
      return isPost && (f.tags?.includes(activeTag) || f.categories?.includes(activeTag));
    })
    .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
    .slice(0, activeTag ? 20 : 4);

  const categories = useMemo(() => {
    const cats: Record<string, number> = {};
    (Object.values(files) as FileSystemItem[]).forEach(f => {
      if (f.categories) {
        f.categories.forEach(c => {
          cats[c] = (cats[c] || 0) + 1;
        });
      }
    });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]);
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
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={isBooting ? {} : { y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 p-8 rounded-3xl bg-[#0b1120]/80 border border-white/5 relative overflow-hidden group shadow-2xl backdrop-blur-sm"
        >
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

          <motion.div
            className="hidden md:flex flex-col items-end gap-6 opacity-80"
            initial={{ scale: 0, rotate: -180 }}
            animate={isBooting ? {} : { scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 100, delay: 0.4 }}
          >
            <div className="relative flex items-center justify-center perspective-1000 cursor-pointer group w-24 h-24">
              <motion.div
                layoutId="core-outer"
                className="system-core absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/30 w-full h-full"
                style={{ animationDuration: '10s' }}
              />
              <motion.div
                layoutId="core-inner"
                className="system-core absolute inset-4 border-cyan-400/50 rounded-full border"
                style={{ animationDirection: 'reverse', animationDuration: '15s' }}
              />
              <motion.div layoutId="core-icon" className="absolute inset-0 flex items-center justify-center z-10">
                <Activity size={32} className="text-cyan-200 animate-pulse" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {categories.length > 0 && (
          <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col gap-4">
            <motion.div layout className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <AnimatePresence mode="popLayout">
                {visibleCategories.map(([cat, count]) => (
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

        <motion.div
          initial="hidden"
          animate={isBooting ? 'hidden' : 'visible'}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.5,
              },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
        >
          <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
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

          <motion.div variants={{ hidden: { x: -20, opacity: 0 }, visible: { x: 0, opacity: 1 } }} className="md:col-span-12 space-y-6">
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
};
