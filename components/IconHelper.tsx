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
}

export const IconHelper: React.FC<IconHelperProps> = ({ name, isOpen, isFolder, className, type }) => {
  // Enhanced colors for better visibility on dark backgrounds
  if (type === 'home') return <Home size={16} className={`text-cyan-400 ${className}`} />;
  if (type === 'dashboard') return <LayoutDashboard size={16} className={`text-purple-400 ${className}`} />;
  if (type === 'tag') return <Hash size={14} className={`text-gray-400 ${className}`} />;
  if (type === 'filter') return <Filter size={14} className={`text-yellow-400 ${className}`} />;

  if (isFolder) {
    return isOpen ? 
      <FolderOpen size={16} className={`text-blue-400 ${className}`} /> : 
      <Folder size={16} className={`text-blue-400 ${className}`} />;
  }

  if (name.endsWith('.json')) return <FileJson size={16} className={`text-yellow-400 ${className}`} />;
  if (name.endsWith('.md')) return <FileText size={16} className={`text-cyan-300 ${className}`} />;
  if (name.endsWith('.tsx') || name.endsWith('.ts')) return <FileCode size={16} className={`text-blue-400 ${className}`} />;
  if (name.endsWith('.png') || name.endsWith('.jpg')) return <ImageIcon size={16} className={`text-purple-400 ${className}`} />;
  
  return <File size={16} className={`text-gray-400 ${className}`} />;
};