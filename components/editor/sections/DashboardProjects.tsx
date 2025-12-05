import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { Language, translations } from '../../../translations';
import { siteConfig } from '../../../src/config/site';
import { Theme } from '../../../types';

interface DashboardProjectsProps {
  language: Language;
  projects: typeof siteConfig.projects;
  theme?: Theme;
}

export const DashboardProjects: React.FC<DashboardProjectsProps> = ({ language, projects, theme = 'dark' }) => {
  const t = translations[language];
  const isDark = theme === 'dark';
  const headerAccent = isDark ? 'from-cyan-900/50' : 'from-cyan-200/60';
  const cardBase = isDark
    ? 'border border-white/5 bg-[#0f172a]/40 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-900/20'
    : 'border border-slate-200 bg-white/95 hover:border-cyan-200 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]';
  const overlayGradient = isDark
    ? 'from-cyan-500/10 via-blue-500/5'
    : 'from-cyan-200/40 via-blue-200/30';
  const indexBadge = isDark
    ? 'text-gray-500 bg-black/20 border border-white/5'
    : 'text-slate-500 bg-slate-100 border border-slate-200';
  const linkIcon = isDark ? 'text-gray-500 group-hover:text-cyan-300' : 'text-slate-400 group-hover:text-cyan-500';
  const titleColor = isDark ? 'text-gray-100 group-hover:text-white' : 'text-slate-800 group-hover:text-slate-900';
  const descColor = isDark ? 'text-gray-500 group-hover:text-gray-300' : 'text-slate-500 group-hover:text-slate-700';
  const ctaColor = isDark ? 'text-cyan-300' : 'text-cyan-600';

  if (!projects.length) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-cyan-500/80' : 'text-cyan-600/80'}`}>
          <ExternalLink size={14} /> {t.hostedProjects}
        </h3>
        <div className={`h-px flex-1 bg-gradient-to-r ${headerAccent} to-transparent ml-4`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((project, index) => (
          <a
            key={project.url}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`relative group rounded-2xl p-5 overflow-hidden transition-all ${cardBase}`}
          >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${overlayGradient} to-transparent`} />
            <div className="relative flex items-center justify-between mb-4">
              <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${indexBadge}`}>
                #{String(index + 1).padStart(2, '0')}
              </span>
              <ExternalLink size={16} className={`${linkIcon} transition-colors`} />
            </div>
            <h3 className={`relative text-lg font-semibold tracking-tight ${titleColor}`}>
              {project.name}
            </h3>
            <p className={`relative mt-3 text-sm leading-relaxed min-h-[60px] ${descColor}`}>
              {project.description}
            </p>
            <span className={`relative mt-4 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest ${ctaColor}`}>
              {t.visitProject}
              <ArrowRight size={14} className="transform transition-transform group-hover:translate-x-1" />
            </span>
          </a>
        ))}
      </div>
    </motion.div>
  );
};
