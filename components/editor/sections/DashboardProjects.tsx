import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { Language, translations } from '../../../translations';
import { siteConfig } from '../../../src/config/site';

interface DashboardProjectsProps {
  language: Language;
  projects: typeof siteConfig.projects;
}

export const DashboardProjects: React.FC<DashboardProjectsProps> = ({ language, projects }) => {
  const t = translations[language];

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
        <h3 className="text-xs font-bold text-cyan-500/80 uppercase tracking-widest flex items-center gap-2">
          <ExternalLink size={14} /> {t.hostedProjects}
        </h3>
        <div className="h-px flex-1 bg-gradient-to-r from-cyan-900/50 to-transparent ml-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((project, index) => (
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
  );
};
