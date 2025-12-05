import React from 'react';
import { 
  File, 
  FileJson, 
  FileText, 
  Folder, 
  FolderOpen, 
  FileCode,
  Image as ImageIcon,
  Home,
  Hash,
  LayoutDashboard,
  Filter
} from 'lucide-react';

interface IconHelperProps {
  name: string;
  isOpen?: boolean;
  isFolder?: boolean;
  className?: string;
  type?: 'home' | 'dashboard' | 'tag' | 'filter';
  theme?: 'dark' | 'light';
}

export const IconHelper: React.FC<IconHelperProps> = ({ name, isOpen, isFolder, className, type, theme = 'dark' }) => {
  const isDark = theme === 'dark';

  // Enhanced colors for better visibility on dark backgrounds
  if (type === 'home') return <Home size={16} className={`${isDark ? 'text-cyan-400' : 'text-cyan-600'} ${className}`} />;
  if (type === 'dashboard') return <LayoutDashboard size={16} className={`${isDark ? 'text-purple-400' : 'text-violet-600'} ${className}`} />;
  if (type === 'tag') return <Hash size={14} className={`${isDark ? 'text-gray-400' : 'text-slate-500'} ${className}`} />;
  if (type === 'filter') return <Filter size={14} className={`${isDark ? 'text-yellow-400' : 'text-amber-500'} ${className}`} />;

  if (isFolder) {
    return isOpen ? 
      <FolderOpen size={16} className={`${isDark ? 'text-blue-400' : 'text-blue-600'} ${className}`} /> : 
      <Folder size={16} className={`${isDark ? 'text-blue-400' : 'text-blue-600'} ${className}`} />;
  }

  if (name.endsWith('.json')) return <FileJson size={16} className={`${isDark ? 'text-yellow-400' : 'text-amber-600'} ${className}`} />;
  if (name.endsWith('.md')) return <FileText size={16} className={`${isDark ? 'text-cyan-300' : 'text-teal-600'} ${className}`} />;
  if (name.endsWith('.tsx') || name.endsWith('.ts')) return <FileCode size={16} className={`${isDark ? 'text-blue-400' : 'text-indigo-600'} ${className}`} />;
  if (name.endsWith('.png') || name.endsWith('.jpg')) return <ImageIcon size={16} className={`${isDark ? 'text-purple-400' : 'text-fuchsia-600'} ${className}`} />;
  
  return <File size={16} className={`${isDark ? 'text-gray-400' : 'text-slate-500'} ${className}`} />;
};