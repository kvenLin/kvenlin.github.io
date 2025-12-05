import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, ChevronUp, ChevronDown, ChevronRight, Home, Archive } from 'lucide-react';
import { CategoryNode } from '../dashboardTypes';
import { Language } from '../../../translations';
import { Theme } from '../../../types';

interface DashboardCategoriesProps {
  language: Language;
  categoryPath: string[];
  categories: CategoryNode[];
  activeTag?: string | null;
  animDirection: 'enter' | 'exit';
  expandingFromIndex: number | null;
  isCategoriesExpanded: boolean;
  totalCategories: number;
  onBreadcrumbClick: (index: number) => void;
  onCategoryClick: (cat: CategoryNode, index: number) => void;
  onToggleExpand: () => void;
  theme?: Theme;
}

export const DashboardCategories: React.FC<DashboardCategoriesProps> = ({
  language: _language,
  categoryPath,
  categories,
  activeTag,
  animDirection,
  expandingFromIndex,
  isCategoriesExpanded,
  totalCategories,
  onBreadcrumbClick,
  onCategoryClick,
  onToggleExpand,
  theme = 'dark',
}) => {
  const INITIAL_VISIBLE_CATS = 8;
  const isDark = theme === 'dark';
  const headerColor = isDark ? 'text-cyan-500/80' : 'text-cyan-600/80';
  const headerDivider = isDark ? 'from-cyan-900/50' : 'from-cyan-200/70';
  const breadcrumbIdle = isDark ? 'text-slate-400' : 'text-slate-500';
  const breadcrumbHover = isDark ? 'hover:text-cyan-400' : 'hover:text-cyan-600';
  const gridGap = isDark ? 'gap-5' : 'gap-4';
  const badgeStacks = (layer: number, active: boolean) => {
    const base = active
      ? ['bg-cyan-900/40', 'border-cyan-500/30']
      : isDark
        ? ['bg-[#0f172a]/40', 'border-white/5']
        : ['bg-[#e6ecf5]', 'border-slate-300/70'];
    const hover = active
      ? ''
      : isDark
        ? 'group-hover:bg-[#0f172a]/55'
        : 'group-hover:bg-[#dde6f3] group-hover:border-cyan-300';
    return `${base[0]} ${base[1]} ${hover}`;
  };
  const cardBase = (active: boolean) =>
    active
      ? isDark
        ? 'bg-gradient-to-br from-cyan-950/70 via-[#0f172a]/90 to-[#0f172a]/80 border-cyan-500/50 text-white'
        : 'bg-gradient-to-br from-[#e6ecf5] via-[#d4e4f5] to-[#c8daf0] border-cyan-400/70 text-slate-800 shadow-[0_20px_40px_rgba(15,23,42,0.12)]'
      : isDark
        ? 'bg-gradient-to-br from-[#0f172a]/60 via-[#0f172a]/50 to-[#0B1121]/60 border-white/10 text-gray-100 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-900/20'
        : 'bg-gradient-to-br from-[#e6ecf5] to-[#dde6f3] border border-slate-300/70 text-slate-800 shadow-[0_20px_40px_rgba(15,23,42,0.10)] hover:border-cyan-300 hover:from-[#dde6f3] hover:to-[#d4dced]';
  const chipBase = (active: boolean) =>
    active
      ? isDark
        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
        : 'bg-cyan-100 border-cyan-300 text-cyan-700'
      : isDark
        ? 'bg-black/30 border-white/10 text-gray-400 group-hover:text-cyan-300 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/10'
        : 'bg-slate-100 border-slate-200 text-slate-500 group-hover:text-cyan-600 group-hover:border-cyan-300 group-hover:bg-cyan-50';
  const statsColor = (active: boolean) =>
    active ? (isDark ? 'text-cyan-300' : 'text-cyan-600') : isDark ? 'text-gray-300 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-900';
  const subtitleColor = (active: boolean) =>
    active ? (isDark ? 'text-cyan-300/80' : 'text-cyan-600/80') : isDark ? 'text-gray-500 group-hover:text-gray-300' : 'text-slate-500 group-hover:text-slate-600';
  const chevronColor = (active: boolean) =>
    active
      ? 'text-cyan-400 translate-x-0 opacity-100'
      : isDark
        ? 'text-gray-500 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-cyan-400'
        : 'text-slate-400 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-cyan-500';
  const loadMoreBtn = isDark
    ? 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 text-gray-400 hover:text-white'
    : 'bg-[#e6ecf5] border border-slate-300/70 hover:border-cyan-300 text-slate-600 hover:text-cyan-600 shadow-[0_10px_30px_rgba(15,23,42,0.10)]';

  return (
    <motion.div layout="size" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14, duration: 0.22 }} className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${headerColor}`}>
          <Folder size={14} /> Categories
        </h3>
        <div className={`h-px flex-1 bg-gradient-to-r ${headerDivider} to-transparent ml-4`} />
      </div>

      {/* Breadcrumb Navigation */}
      {categoryPath.length > 0 && (
        <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
          <button
            onClick={() => onBreadcrumbClick(-1)}
            className={`flex items-center gap-1 transition-colors ${breadcrumbIdle} ${breadcrumbHover}`}
          >
            <Home size={14} />
            <span>Root</span>
          </button>
          {categoryPath.map((segment, index) => (
            <React.Fragment key={index}>
              <ChevronRight size={14} className={isDark ? 'text-slate-600' : 'text-slate-400'} />
              <button
                onClick={() => onBreadcrumbClick(index)}
                className={`transition-colors ${
                  index === categoryPath.length - 1
                    ? (isDark ? 'text-cyan-400 font-medium' : 'text-cyan-600 font-medium')
                    : `${breadcrumbIdle} ${breadcrumbHover}`
                }`}
              >
                {segment}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={categoryPath.join('/')}
          initial={animDirection === 'enter' ? { opacity: 0, y: 26 } : { opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={animDirection === 'enter' ? { opacity: 0, y: -18 } : { opacity: 0, y: 26 }}
          transition={{
            duration: 0.22,
            ease: [0.4, 0, 0.2, 1],
          }}
          className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${gridGap}`}
        >
          {categories.map((cat, index) => {
            const isActive = activeTag === cat.fullPath;
            const stackLayers = Math.min(cat.depth, 3);
            const isBeingClicked = expandingFromIndex === index;

            return (
              <motion.div
                key={cat.fullPath}
                initial={{ opacity: 0, y: 16 }}
                animate={{
                  opacity: isBeingClicked ? 0.65 : 1,
                  scale: isBeingClicked ? 1.02 : 1,
                  y: 0,
                  transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] },
                }}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onCategoryClick(cat, index)}
                className="group relative w-full cursor-pointer"
                style={{ paddingTop: stackLayers * 4, paddingRight: stackLayers * 4 }}
              >
                {stackLayers >= 3 && (
                  <div
                    className={`absolute top-0 right-0 w-full h-full rounded-2xl border transition-all duration-300 -z-30 ${badgeStacks(3, isActive)}`}
                    style={{ transform: 'translate(8px, 8px)' }}
                  />
                )}
                {stackLayers >= 2 && (
                  <div className={`absolute top-0 right-0 w-full h-full rounded-2xl border transition-all duration-300 -z-20 ${badgeStacks(2, isActive)}`} style={{ transform: 'translate(4px, 4px)' }} />
                )}
                {stackLayers >= 1 && (
                  <div className={`absolute top-0 right-0 w-full h-full rounded-2xl border transition-all duration-300 -z-10 ${badgeStacks(1, isActive)}`} style={{ transform: 'translate(2px, 2px)' }} />
                )}

                <div
                  className={`relative rounded-2xl border p-5 overflow-hidden transition-all duration-300 ${cardBase(isActive)}`}
                >
                  <div
                    className={`absolute inset-0 transition-opacity duration-300 ${isDark ? 'bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-transparent' : 'bg-gradient-to-br from-cyan-200/40 via-blue-100/30 to-transparent'} ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                  />

                  <div className="relative flex items-center justify-between mb-4">
                    <div
                      className={`p-2.5 rounded-xl border transition-all duration-300 ${chipBase(isActive)}`}
                    >
                      <Archive size={20} />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xl font-bold font-mono transition-colors ${statsColor(isActive)}`}>
                        {cat.totalCount}
                      </span>
                      <span className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                        {cat.totalCount === 1 ? 'post' : 'posts'}
                      </span>
                    </div>
                  </div>

                  <h3
                    className={`relative text-lg font-semibold tracking-tight transition-colors truncate ${
                      isActive ? (isDark ? 'text-white' : 'text-slate-900') : isDark ? 'text-gray-100 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'
                    }`}
                  >
                    {cat.name}
                  </h3>

                  <div className="relative mt-3 flex items-center justify-between">
                    <p className={`text-sm transition-colors ${subtitleColor(isActive)}`}>
                      {cat.hasChildren ? `${Object.keys(cat.children).length} sub-categories` : 'View posts'}
                    </p>
                    <ChevronRight
                      size={16}
                      className={`transition-all duration-300 ${chevronColor(isActive)}`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {totalCategories > INITIAL_VISIBLE_CATS && (
        <motion.button
          layout
          onClick={onToggleExpand}
          className={`self-center flex items-center gap-3 px-6 py-3 rounded-full transition-all group mt-2 ${loadMoreBtn}`}
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-white/5 text-gray-400 group-hover:text-cyan-400' : 'bg-slate-100 text-slate-500 group-hover:text-cyan-500'}`}>
            {isCategoriesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
          <span className={`text-xs font-mono uppercase tracking-widest ${isDark ? 'text-gray-400 group-hover:text-white' : 'text-slate-500 group-hover:text-cyan-600'}`}>
            {isCategoriesExpanded ? 'Show Less' : `+${totalCategories - INITIAL_VISIBLE_CATS} More Categories`}
          </span>
        </motion.button>
      )}
    </motion.div>
  );
};
