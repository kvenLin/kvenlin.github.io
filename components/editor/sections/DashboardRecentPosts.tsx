import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Language, translations } from '../../../translations';
import { getDisplayTitle } from '../../../utils/titleFormatter';
import { IconHelper } from '../../IconHelper';
import { FileSystemItem } from '../../../types';

interface DashboardRecentPostsProps {
  language: Language;
  recentPosts: FileSystemItem[];
  activeTag?: string | null;
  onOpenFile: (id: string) => void;
}

export const DashboardRecentPosts: React.FC<DashboardRecentPostsProps> = ({ language, recentPosts, activeTag, onOpenFile }) => {
  const t = translations[language];

  if (!recentPosts.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
                <span className="text-gray-200 font-bold group-hover:text-cyan-300 transition-colors text-lg tracking-tight truncate max-w-[200px]">
                  {getDisplayTitle(post.name)}
                </span>
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
  );
};
