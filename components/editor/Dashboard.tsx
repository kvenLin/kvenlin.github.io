import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FileSystemItem, Theme } from '../../types';
import { Language } from '../../translations';
import { DashboardHero } from './sections/DashboardHero';
import { DashboardStats } from './sections/DashboardStats';
import { DashboardProjects } from './sections/DashboardProjects';
import { DashboardCategories } from './sections/DashboardCategories';
import { DashboardRecentPosts } from './sections/DashboardRecentPosts';
import { CategoryNode, FileMap } from './dashboardTypes';
import { siteConfig } from '../../src/config/site';

interface DashboardProps {
  files: FileMap;
  language: Language;
  onOpenFile: (id: string) => void;
  isBooting?: boolean;
  onTagClick: (tag: string | null) => void;
  activeTag?: string | null;
  theme?: Theme;
}

export const Dashboard: React.FC<DashboardProps> = ({
  files,
  language,
  onOpenFile,
  isBooting,
  onTagClick,
  activeTag,
  theme = 'dark',
}) => {
  // Current category path for drill-down navigation
  const [categoryPath, setCategoryPath] = useState<string[]>([]);
  // Track which category was clicked for expand animation
  const [expandingFromIndex, setExpandingFromIndex] = useState<number | null>(null);
  // Track animation direction: 'enter' for drilling down, 'exit' for going back
  const [animDirection, setAnimDirection] = useState<'enter' | 'exit'>('enter');

  // Build category tree structure
  const categoryTree = useMemo(() => {
    const root: Record<string, CategoryNode> = {};
    
    (Object.values(files) as FileSystemItem[]).forEach(f => {
      if (f.categories) {
        f.categories.forEach(catPath => {
          const parts = catPath.split('/').filter(Boolean);
          let currentLevel = root;
          let fullPath = '';
          
          parts.forEach((part, index) => {
            fullPath = fullPath ? `${fullPath}/${part}` : part;
            
            if (!currentLevel[part]) {
              currentLevel[part] = {
                name: part,
                fullPath,
                count: 0,
                totalCount: 0,
                children: {},
                hasChildren: false,
                depth: 0
              };
            }
            
            // Count at each level for totalCount
            currentLevel[part].totalCount++;
            
            // Only count at the leaf level (the actual category of the file)
            if (index === parts.length - 1) {
              currentLevel[part].count++;
            }
            
            // Mark parent as having children
            if (index < parts.length - 1) {
              currentLevel[part].hasChildren = true;
            }
            
            currentLevel = currentLevel[part].children;
          });
        });
      }
    });
    
    // Calculate depth for each node
    const calculateDepth = (node: CategoryNode): number => {
      const childNodes = Object.values(node.children);
      if (childNodes.length === 0) return 0;
      const maxChildDepth = Math.max(...childNodes.map(calculateDepth));
      node.depth = maxChildDepth + 1;
      return node.depth;
    };
    
    Object.values(root).forEach(calculateDepth);
    
    return root;
  }, [files]);

  // Get current level categories based on path
  const currentCategories = useMemo(() => {
    let level = categoryTree;
    for (const segment of categoryPath) {
      if (level[segment]) {
        level = level[segment].children;
      } else {
        return [];
      }
    }
    return Object.values(level).sort((a, b) => b.count - a.count);
  }, [categoryTree, categoryPath]);

  // Get posts for current category path
  const currentPathString = categoryPath.join('/');
  
  const recentPosts = useMemo(() => {
    return (Object.values(files) as FileSystemItem[])
      .filter(f => {
        const isPost = f.type === 'FILE' && f.parentId?.includes('post');
        if (!isPost) return false;
        
        if (currentPathString) {
          return f.categories?.some(cat => cat.startsWith(currentPathString));
        }
        
        if (activeTag) {
          return f.tags?.includes(activeTag) || f.categories?.includes(activeTag);
        }
        
        return true;
      })
      .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
      .slice(0, currentPathString ? 20 : 4);
  }, [files, currentPathString, activeTag]);

  // Navigation handlers
  const handleCategoryClick = (cat: CategoryNode, index: number) => {
    // If clicking on already active category, toggle off the filter
    if (activeTag === cat.fullPath) {
      onTagClick(null);
      return;
    }
    
    if (cat.hasChildren) {
      // Has sub-categories, drill down with lighter animation
      setExpandingFromIndex(index);
      setAnimDirection('enter');
      // Use rAF to batch state changes，避免 setTimeout 延迟带来的跳帧
      requestAnimationFrame(() => {
        setCategoryPath(prev => [...prev, cat.name]);
        setExpandingFromIndex(null);
      });
    } else {
      // Leaf category, trigger filter
      onTagClick(cat.fullPath);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    setAnimDirection('exit');
    if (index < 0) {
      setCategoryPath([]);
      onTagClick(null);
    } else {
      setCategoryPath(categoryPath.slice(0, index + 1));
    }
  };

  const handleBackClick = () => {
    if (categoryPath.length > 0) {
      setCategoryPath(categoryPath.slice(0, -1));
    }
  };

  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);
  const INITIAL_VISIBLE_CATS = 8;
  const visibleCategories = isCategoriesExpanded ? currentCategories : currentCategories.slice(0, INITIAL_VISIBLE_CATS);

  // ESC key to go back one level (not directly to root)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // First, clear activeTag if set
        if (activeTag) {
          e.preventDefault();
          e.stopPropagation();
          onTagClick(null);
          return;
        }
        // Then, go back one level in category path
        if (categoryPath.length > 0) {
          e.preventDefault();
          e.stopPropagation();
          setAnimDirection('exit');
          setCategoryPath(categoryPath.slice(0, -1));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [categoryPath, activeTag, onTagClick]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isBooting ? 0 : 1 }}
      id="main-scroll-container"
      className="h-full flex flex-col items-center p-4 md:p-8 overflow-y-auto w-full custom-scrollbar"
    >
      <div className="max-w-6xl w-full space-y-12 mt-4 md:mt-10 pb-20">
        <DashboardHero language={language} isBooting={isBooting} onOpenFile={onOpenFile} theme={theme} />

        <DashboardStats files={files} language={language} isBooting={isBooting} theme={theme} />

        {siteConfig.projects.length > 0 && (
          <DashboardProjects language={language} projects={siteConfig.projects} theme={theme} />
        )}

        {currentCategories.length > 0 && (
          <DashboardCategories
            language={language}
            categoryPath={categoryPath}
            categories={visibleCategories}
            activeTag={activeTag}
            animDirection={animDirection}
            expandingFromIndex={expandingFromIndex}
            isCategoriesExpanded={isCategoriesExpanded}
            totalCategories={currentCategories.length}
            theme={theme}
            onBreadcrumbClick={handleBreadcrumbClick}
            onCategoryClick={handleCategoryClick}
            onToggleExpand={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
          />
        )}

        <DashboardRecentPosts
          language={language}
          recentPosts={recentPosts}
          activeTag={activeTag}
          theme={theme}
          onOpenFile={onOpenFile}
        />
      </div>
    </motion.div>
  );
};
