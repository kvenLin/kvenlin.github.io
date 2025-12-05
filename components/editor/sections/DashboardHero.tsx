import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ExternalLink, GitCommit, UserRound } from 'lucide-react';
import { siteConfig } from '../../../src/config/site';
import { translations, Language } from '../../../translations';

interface DashboardHeroProps {
  language: Language;
  isBooting?: boolean;
  onOpenFile: (id: string) => void;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({ language, isBooting, onOpenFile }) => {
  const t = translations[language];

  return (
    <motion.div
      initial={{ y: 12, opacity: 0 }}
      animate={isBooting ? {} : { y: 0, opacity: 1 }}
      transition={{ duration: 0.28, delay: 0.12, ease: [0.4, 0, 0.2, 1] }}
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

        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight pb-2">{siteConfig.title}</h1>
        <p className="text-gray-400 text-lg max-w-xl leading-relaxed border-l-2 border-white/10 pl-4">{siteConfig.description}</p>

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
        initial={{ opacity: 0, x: 18 }}
        animate={isBooting ? {} : { opacity: 1, x: 0 }}
        transition={{ delay: 0.16, duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
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
  );
};
