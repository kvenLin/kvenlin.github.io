import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ExternalLink, GitCommit, UserRound } from 'lucide-react';
import { siteConfig } from '../../../src/config/site';
import { translations, Language } from '../../../translations';
import { Theme } from '../../../types';

interface DashboardHeroProps {
  language: Language;
  isBooting?: boolean;
  onOpenFile: (id: string) => void;
  theme?: Theme;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({ language, isBooting, onOpenFile, theme = 'dark' }) => {
  const t = translations[language];
  const isDark = theme === 'dark';
  const containerClasses = isDark
    ? 'bg-gradient-to-br from-[#0b1120]/90 via-[#090f1d]/95 to-[#050912]/95 border border-white/5 text-white shadow-2xl'
    : 'bg-gradient-to-br from-[#e6ecf5] via-[#dde6f3] to-[#d4dced] border border-slate-300/70 text-slate-900 shadow-[0_25px_70px_rgba(15,23,42,0.15)]';
  const badgePrimary = isDark
    ? 'bg-cyan-950/30 border border-cyan-500/20 text-cyan-400'
    : 'bg-cyan-100 text-cyan-700 border border-cyan-200';
  const badgeSecondary = isDark
    ? 'bg-blue-950/30 border border-blue-500/20 text-blue-400'
    : 'bg-blue-100 text-blue-700 border border-blue-200';
  const chipClasses = isDark
    ? 'border border-white/10 bg-white/5 text-gray-300'
    : 'border border-slate-300/70 bg-[#e6ecf5] text-slate-700';
  const descriptionClasses = isDark
    ? 'text-gray-400 border-white/10'
    : 'text-slate-600 border-slate-200';
  const userCardClasses = isDark
    ? 'border border-white/10 bg-[#050d1a]/80 shadow-[0_15px_45px_rgba(15,23,42,0.45)]'
    : 'border border-slate-300/70 bg-gradient-to-br from-[#e8eef8] to-[#dde6f3] shadow-[0_25px_50px_rgba(15,23,42,0.12)]';
  const ctaClasses = isDark
    ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-50 border border-cyan-400/40'
    : 'bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 border border-cyan-200 shadow-[0_12px_24px_rgba(15,23,42,0.1)]';

  return (
    <motion.div
      initial={{ y: 12, opacity: 0 }}
      animate={isBooting ? {} : { y: 0, opacity: 1 }}
      transition={{ duration: 0.28, delay: 0.12, ease: [0.4, 0, 0.2, 1] }}
      className={`flex flex-col lg:flex-row items-stretch justify-between gap-8 p-8 rounded-3xl relative overflow-hidden group backdrop-blur-xl ${containerClasses}`}
    >
      <div className="space-y-6 text-center lg:text-left z-10 flex-1">
        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-2">
          <span className={`px-3 py-1 rounded-full text-xs font-mono flex items-center gap-2 ${badgePrimary}`}>
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            v{siteConfig.build.version}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-mono flex items-center gap-2 ${badgeSecondary}`}>
            <GitCommit size={12} />
            {siteConfig.github.repository_name}
          </span>
        </div>

        <h1 className={`text-4xl md:text-6xl font-bold tracking-tight pb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{siteConfig.title}</h1>
        <p className={`text-lg max-w-xl leading-relaxed border-l-2 pl-4 ${descriptionClasses}`}>{siteConfig.description}</p>

        <div className="flex flex-col gap-4 pt-4">
          <div className={`flex flex-wrap items-center justify-center lg:justify-start gap-3 text-sm ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${chipClasses}`}>
              <Clock size={14} className={isDark ? 'text-blue-300' : 'text-blue-500'} />
              <span>{new Date(siteConfig.build.timestamp).toLocaleDateString()}</span>
            </div>
            <a
              href={siteConfig.github.repository_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${chipClasses} ${isDark ? 'hover:text-white hover:border-cyan-400/60' : 'hover:text-cyan-600 hover:border-cyan-400/60'}`}
            >
              <ExternalLink size={14} className={isDark ? 'text-cyan-300' : 'text-cyan-500'} />
              View Source
            </a>
          </div>
        </div>
      </div>

      <motion.div
        className="w-full lg:w-[340px] relative"
        initial={{ opacity: 0, x: 18 }}
        animate={isBooting ? {} : { opacity: 1, x: 0 }}
        transition={{ delay: 0.16, duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className={`absolute inset-0 blur-3xl opacity-40 ${isDark ? 'bg-gradient-to-br from-cyan-500/20 via-blue-600/10 to-transparent' : 'bg-gradient-to-br from-cyan-400/15 via-sky-200/40 to-transparent'}`} />
        <motion.div
          whileHover={{ y: -4 }}
          className={`relative rounded-2xl backdrop-blur-xl overflow-hidden ${userCardClasses}`}
        >
          <div className="p-6 space-y-4">
            <div className="flex flex-col items-center text-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onOpenFile('file-resume')}
                className={`relative w-24 h-24 rounded-full overflow-hidden border-2 shadow-lg ${isDark ? 'border-cyan-400/50' : 'border-cyan-200/70'}`}
                title={t.resumeCta}
              >
                <img
                  src={siteConfig.author.avatar || 'https://avatars.githubusercontent.com/u/000000?v=4'}
                  alt={siteConfig.author.name}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-tr ${isDark ? 'from-cyan-500/40' : 'from-cyan-200/50'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
              </motion.button>
              <div>
                <p className={`text-xs font-mono uppercase tracking-[0.4em] ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{siteConfig.author.name}</p>
                <p className={`text-base mt-1 font-semibold ${isDark ? 'text-gray-100' : 'text-slate-800'}`}>{siteConfig.author.bio}</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>{siteConfig.author.email}</p>
              </div>
              <button
                onClick={() => onOpenFile('file-resume')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-xs hover:translate-y-0.5 transition-transform ${ctaClasses}`}
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
  );
};
