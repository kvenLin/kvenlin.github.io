import React from 'react';
import { Files, Search, GitGraph, Box, Settings, User } from 'lucide-react';

export const ActivityBar: React.FC = () => {
  return (
    <div className="w-12 h-full bg-[#333333] flex flex-col items-center py-2 justify-between border-r border-[#1e1e1e] z-10">
      <div className="flex flex-col gap-6">
        <div className="relative group cursor-pointer">
          <Files size={24} className="text-white opacity-100 border-l-2 border-white pl-2 -ml-2.5" />
        </div>
        <div className="group cursor-pointer opacity-40 hover:opacity-100 transition-opacity">
          <Search size={24} className="text-gray-300" />
        </div>
        <div className="group cursor-pointer opacity-40 hover:opacity-100 transition-opacity">
          <GitGraph size={24} className="text-gray-300" />
        </div>
        <div className="group cursor-pointer opacity-40 hover:opacity-100 transition-opacity">
          <Box size={24} className="text-gray-300" />
        </div>
      </div>
      
      <div className="flex flex-col gap-6 mb-2">
        <div className="group cursor-pointer opacity-40 hover:opacity-100 transition-opacity">
          <User size={24} className="text-gray-300" />
        </div>
        <div className="group cursor-pointer opacity-40 hover:opacity-100 transition-opacity">
          <Settings size={24} className="text-gray-300" />
        </div>
      </div>
    </div>
  );
};