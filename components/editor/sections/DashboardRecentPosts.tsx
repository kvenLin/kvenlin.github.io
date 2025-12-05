import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Language, translations } from '../../../translations';
import { getDisplayTitle } from '../../../utils/titleFormatter';
import { IconHelper } from '../../IconHelper';
import { FileSystemItem, Theme } from '../../../types';

interface DashboardRecentPostsProps {
  language: Language;
  recentPosts: FileSystemItem[];
  activeTag?: string | null;
  onOpenFile: (id: string) => void;
  theme?: Theme;
}

export const DashboardRecentPosts: React.FC<DashboardRecentPostsProps> = ({
  language,
  recentPosts,
  activeTag,
  onOpenFile,
  theme = 'dark',
}) => {
  const t = translations[language];
  const isDark = theme === 'dark';
  const headerAccent = isDark ? 'from-cyan-900/50' : 'from-cyan-100/70';
  const cardBase = isDark
    ? 'bg-[#0f172a]/30 border border-white/5 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-900/10 hover:border-cyan-500/30'
    : 'bg-gradient-to-br from-[#e6ecf5] to-[#dde6f3] border border-slate-300/70 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(15,23,42,0.15)] hover:border-cyan-300';
  const titleColor = isDark ? 'text-gray-200 group-hover:text-cyan-300' : 'text-slate-800 group-hover:text-cyan-600';
  const metaPill = isDark
    ? 'text-gray-500 bg-black/20 border border-white/5'
    : 'text-slate-500 bg-slate-100 border border-slate-200';
  const excerptColor = isDark ? 'text-gray-500 group-hover:text-gray-400' : 'text-slate-500 group-hover:text-slate-700';
  const chevronColor = isDark ? 'text-cyan-400' : 'text-cyan-600';

  if (!recentPosts.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-cyan-500/80' : 'text-cyan-600/80'}`}>
          <ArrowRight size={14} /> {activeTag ? `Filtered: #${activeTag}` : t.recentEntries}
        </h3>
        <div className={`h-px flex-1 bg-gradient-to-r ${headerAccent} to-transparent ml-4`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recentPosts.map(post => (
          <div
            key={post.id}
            onClick={() => onOpenFile(post.id)}
            className={`group p-5 rounded-2xl cursor-pointer relative overflow-hidden transition-all flex flex-col h-full backdrop-blur-sm ${cardBase}`}
          >
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-3">
                <IconHelper
                  name={post.name}
                  className={`transition-colors ${isDark ? 'group-hover:text-cyan-300' : 'group-hover:text-cyan-600'}`}
                  theme={theme}
                />
                <span className={`${titleColor} font-bold transition-colors text-lg tracking-tight truncate max-w-[200px]`}>
                  {getDisplayTitle(post.name)}
                </span>
              </div>
              <span className={`text-xs font-mono px-2.5 py-1 rounded-md flex-shrink-0 ${metaPill}`}>{post.date}</span>
            </div>
            <p className={`text-sm truncate opacity-70 relative z-10 transition-all flex-1 ${excerptColor}`}>
              {post.content?.slice(0, 100).replace(/[#`]/g, '')}...
            </p>
            <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
              <ArrowRight size={18} className={chevronColor} />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
