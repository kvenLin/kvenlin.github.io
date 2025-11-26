import React from 'react';
import { GitBranch, AlertTriangle, Check, Bell } from 'lucide-react';

export const StatusBar: React.FC = () => {
  return (
    <div className="h-6 bg-[#007acc] text-white flex items-center justify-between px-3 text-xs select-none z-20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 cursor-pointer hover:bg-white/20 px-1 rounded">
          <GitBranch size={12} />
          <span>main</span>
        </div>
        <div className="flex items-center gap-1 cursor-pointer hover:bg-white/20 px-1 rounded">
            <div className="flex items-center gap-1">
                <AlertTriangle size={12} /> 0
            </div>
            <div className="flex items-center gap-1 ml-1">
                <AlertTriangle size={12} /> 0
            </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 cursor-pointer hover:bg-white/20 px-1 rounded">
             <span>Ln 12, Col 45</span>
        </div>
        <div className="cursor-pointer hover:bg-white/20 px-1 rounded">UTF-8</div>
        <div className="cursor-pointer hover:bg-white/20 px-1 rounded">Markdown</div>
        <div className="cursor-pointer hover:bg-white/20 px-1 rounded">Prettier</div>
        <div className="cursor-pointer hover:bg-white/20 px-1 rounded">
          <Bell size={12} />
        </div>
      </div>
    </div>
  );
};