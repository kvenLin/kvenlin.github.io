import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, GitCommit } from 'lucide-react';
import { Language, translations } from '../../../translations';
import { FileMap } from '../dashboardTypes';
import { siteConfig } from '../../../src/config/site';
import { Theme } from '../../../types';

interface DashboardStatsProps {
  files: FileMap;
  language: Language;
  isBooting?: boolean;
  theme?: Theme;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ files, language, isBooting, theme = 'dark' }) => {
  const t = translations[language];
  const isDark = theme === 'dark';
  const gridGap = isDark ? 'gap-6' : 'gap-5';
  const cardBase = isDark
    ? 'bg-[#0f172a]/40 border border-white/5 text-gray-100 hover:border-white/10 hover:bg-white/5'
    : 'bg-white/95 border border-slate-200 text-slate-800 shadow-[0_20px_40px_rgba(15,23,42,0.08)] hover:border-cyan-200 hover:bg-cyan-50/40';
  const iconWrapper = isDark
    ? 'bg-black/40'
    : 'bg-gradient-to-br from-cyan-50 to-blue-50 border border-slate-100';
  const labelColor = isDark ? 'text-gray-500' : 'text-slate-500';

  const totalPosts = useMemo(
    () => Object.values(files).filter(f => f.name.endsWith('.md') && f.parentId?.includes('post')).length,
    [files],
  );

  const stats = [
    {
      icon: Clock,
      label: 'Last Build',
      value: new Date(siteConfig.build.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      color: 'text-blue-400',
    },
    {
      icon: GitCommit,
      label: t.totalPosts,
      value: totalPosts,
      color: 'text-purple-400',
    },
    {
      icon: Activity,
      label: 'System Version',
      value: `v${siteConfig.build.version}`,
      color: 'text-emerald-400',
    },
  ];

  return (
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
      className={`grid grid-cols-1 md:grid-cols-3 ${gridGap}`}
    >
      {stats.map((stat, idx) => (
        <motion.div
          key={idx}
          variants={{ hidden: { y: 14, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
          className={`${cardBase} p-5 rounded-2xl flex items-center gap-5 transition-all group backdrop-blur-sm`}
        >
          <div className={`p-3 rounded-xl ${iconWrapper} ${stat.color} shadow-inner group-hover:scale-110 transition-transform`}>
            <stat.icon size={20} />
          </div>
          <div>
            <div className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${labelColor}`}>{stat.label}</div>
            <div className={`text-xl font-mono font-medium ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>{stat.value}</div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};
