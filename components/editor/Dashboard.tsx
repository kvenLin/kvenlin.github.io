import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Clock, GitCommit, Activity, Hash, Folder, ChevronUp, ChevronDown, ExternalLink, UserRound } from 'lucide-react';
import { FileSystemItem } from '../../types';
import { Language, translations } from '../../translations';
import { siteConfig } from '../../src/config/site';
import { IconHelper } from '../IconHelper';
import { getDisplayTitle } from '../../utils/titleFormatter';

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
            initial={{ opacity: 0, x: 30 }}
            animate={isBooting ? {} : { opacity: 1, x: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 90 }}
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

        {categories.length > 0 && (
          <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col gap-4">
            <motion.div layout className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <AnimatePresence mode="popLayout">
                {visibleCategories.map(([cat, count]) => {
                  const isActive = activeTag === cat;
                  return (
                    <motion.div
                      layout
                      key={cat}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.05, y: -5, rotateX: 10 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative group cursor-pointer perspective-500 ${isActive ? 'ring-2 ring-cyan-400/80 rounded-2xl' : ''}`}
                      onClick={() => onTagClick(isActive ? null : cat)}
                    >
                      <div className={`absolute inset-0 rounded-xl blur-lg transition-opacity duration-500 ${isActive ? 'opacity-100 bg-gradient-to-br from-cyan-500/40 to-blue-500/30' : 'opacity-0 group-hover:opacity-100 bg-gradient-to-br from-cyan-500/20 to-blue-600/20'}`} />
                      <div className={`relative h-32 rounded-xl p-4 flex flex-col justify-between overflow-hidden backdrop-blur-md transition-colors ${isActive ? 'bg-[#0f172a]/80 border-cyan-400/60' : 'bg-[#0f172a]/60 border border-white/10 group-hover:border-cyan-500/50'}`}>
                        <div className={`absolute top-0 right-0 p-3 transition-opacity ${isActive ? 'opacity-40' : 'opacity-10 group-hover:opacity-30'}`}>
                          <Hash size={48} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Folder size={24} className={`${isActive ? 'text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]' : 'text-cyan-500 group-hover:text-cyan-400'} transition-colors`} />
                          <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${isActive ? 'text-cyan-100 border-cyan-400/50 bg-cyan-500/10' : 'text-gray-500 bg-black/30 border-white/10'}`}>
                            {count}
                          </span>
                        </div>
                        <div className="mt-auto pt-4">
                          <h3 className={`${isActive ? 'text-cyan-100' : 'text-gray-300 group-hover:text-cyan-300'} font-medium truncate capitalize`}>{cat}</h3>
                          <div className={`h-0.5 mt-2 transition-all duration-500 ${isActive ? 'w-full bg-cyan-400' : 'w-8 bg-cyan-500/30 group-hover:w-full'}`} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
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
        </motion.div>
      </div>
    </motion.div>
  );
};
