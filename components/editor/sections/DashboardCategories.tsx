import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, ChevronUp, ChevronDown, ChevronRight, Home, Archive } from 'lucide-react';
import { CategoryNode } from '../dashboardTypes';
import { Language } from '../../../translations';

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
}) => {
  const INITIAL_VISIBLE_CATS = 8;

  return (
    <motion.div layout="size" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14, duration: 0.22 }} className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-cyan-500/80 uppercase tracking-widest flex items-center gap-2">
          <Folder size={14} /> Categories
        </h3>
        <div className="h-px flex-1 bg-gradient-to-r from-cyan-900/50 to-transparent ml-4" />
      </div>

      {/* Breadcrumb Navigation */}
      {categoryPath.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => onBreadcrumbClick(-1)}
            className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <Home size={14} />
            <span>Root</span>
          </button>
          {categoryPath.map((segment, index) => (
            <React.Fragment key={index}>
              <ChevronRight size={14} className="text-slate-600" />
              <button
                onClick={() => onBreadcrumbClick(index)}
                className={`transition-colors ${
                  index === categoryPath.length - 1
                    ? 'text-cyan-400 font-medium'
                    : 'text-slate-400 hover:text-cyan-400'
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
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
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
                    className={`absolute top-0 right-0 w-full h-full rounded-2xl border transition-all duration-300 -z-30 ${
                      isActive ? 'bg-cyan-900/20 border-cyan-500/20' : 'bg-[#0f172a]/30 border-white/5 group-hover:bg-[#0f172a]/40'
                    }`}
                    style={{ transform: 'translate(8px, 8px)' }}
                  />
                )}
                {stackLayers >= 2 && (
                  <div
                    className={`absolute top-0 right-0 w-full h-full rounded-2xl border transition-all duration-300 -z-20 ${
                      isActive ? 'bg-cyan-900/30 border-cyan-500/25' : 'bg-[#0f172a]/40 border-white/5 group-hover:bg-[#0f172a]/50'
                    }`}
                    style={{ transform: 'translate(4px, 4px)' }}
                  />
                )}
                {stackLayers >= 1 && (
                  <div
                    className={`absolute top-0 right-0 w-full h-full rounded-2xl border transition-all duration-300 -z-10 ${
                      isActive ? 'bg-cyan-900/40 border-cyan-500/30' : 'bg-[#0f172a]/50 border-white/5 group-hover:bg-[#0f172a]/60'
                    }`}
                    style={{ transform: 'translate(2px, 2px)' }}
                  />
                )}

                <div
                  className={`relative rounded-2xl border p-5 overflow-hidden transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-cyan-950/70 via-[#0f172a]/90 to-[#0f172a]/80 border-cyan-500/50 shadow-2xl shadow-cyan-900/30'
                      : 'bg-gradient-to-br from-[#0f172a]/60 via-[#0f172a]/50 to-[#0B1121]/60 border-white/10 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-900/20 hover:-translate-y-1'
                  }`}
                >
                  <div
                    className={`absolute inset-0 transition-opacity duration-300 bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-transparent ${
                      isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  />

                  <div className="relative flex items-center justify-between mb-4">
                    <div
                      className={`p-2.5 rounded-xl border transition-all duration-300 ${
                        isActive
                          ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                          : 'bg-black/30 border-white/10 text-gray-400 group-hover:text-cyan-300 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/10'
                      }`}
                    >
                      <Archive size={20} />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-xl font-bold font-mono transition-colors ${
                          isActive ? 'text-cyan-300' : 'text-gray-300 group-hover:text-white'
                        }`}
                      >
                        {cat.totalCount}
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                        {cat.totalCount === 1 ? 'post' : 'posts'}
                      </span>
                    </div>
                  </div>

                  <h3
                    className={`relative text-lg font-semibold tracking-tight transition-colors truncate ${
                      isActive ? 'text-white' : 'text-gray-100 group-hover:text-white'
                    }`}
                  >
                    {cat.name}
                  </h3>

                  <div className="relative mt-3 flex items-center justify-between">
                    <p
                      className={`text-sm transition-colors ${
                        isActive ? 'text-cyan-300/80' : 'text-gray-500 group-hover:text-gray-300'
                      }`}
                    >
                      {cat.hasChildren ? `${Object.keys(cat.children).length} sub-categories` : 'View posts'}
                    </p>
                    <ChevronRight
                      size={16}
                      className={`transition-all duration-300 ${
                        isActive
                          ? 'text-cyan-400 translate-x-0 opacity-100'
                          : 'text-gray-500 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-cyan-400'
                      }`}
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
          className="self-center flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 transition-all group mt-2"
        >
          <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-cyan-400 transition-colors">
            {isCategoriesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
          <span className="text-xs font-mono text-gray-400 group-hover:text-white uppercase tracking-widest">
            {isCategoriesExpanded ? 'Show Less' : `+${totalCategories - INITIAL_VISIBLE_CATS} More Categories`}
          </span>
        </motion.button>
      )}
    </motion.div>
  );
};
