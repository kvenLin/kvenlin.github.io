import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronRight, Square, Maximize2 } from 'lucide-react';

interface TerminalProps {
  onClose: () => void;
}

export const Terminal: React.FC<TerminalProps> = ({ onClose }) => {
  const [history, setHistory] = useState<string[]>([
    'Welcome to DevBlog CLI [v2.0]',
    'Connected to local session...',
    '',
    'Type "help" for a list of commands.',
    ''
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    inputRef.current?.focus();
  }, [history]);

  const handleCommand = (cmd: string) => {
    const args = cmd.trim().split(' ');
    const command = args[0].toLowerCase();

    let output: string | string[] = '';

    switch (command) {
      case 'help':
        output = [
          '  ls          List contents',
          '  open <file> Open a specific file',
          '  clear       Clear console',
          '  whoami      Current user info',
          '  date        System time',
          '  exit        Close terminal'
        ];
        break;
      case 'ls':
        output = 'src/  public/  README.md  package.json';
        break;
      case 'whoami':
        output = 'guest@portfolio';
        break;
      case 'date':
        output = new Date().toLocaleString();
        break;
      case 'clear':
        setHistory([]);
        return;
      case 'exit':
        onClose();
        return;
      case '':
        break;
      default:
        output = `Command not found: ${command}`;
    }

    setHistory(prev => [...prev, `➜  ~ ${cmd}`, ...(Array.isArray(output) ? output : [output])]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    }
  };

  return (
    <div className="h-full flex flex-col font-mono text-sm bg-black/90 text-gray-200" onClick={() => inputRef.current?.focus()}>
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5 select-none">
        <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500 font-bold">TERMINAL</div>
            <div className="px-2 py-0.5 rounded text-[10px] bg-blue-900/30 text-blue-400 border border-blue-500/20">bash</div>
        </div>
        <div className="flex items-center gap-4">
            <Maximize2 size={14} className="text-gray-500 hover:text-white cursor-pointer" />
            <X size={14} className="text-gray-500 hover:text-red-400 cursor-pointer" onClick={onClose} />
        </div>
      </div>
      
      {/* Terminal Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
        {history.map((line, i) => (
          <div key={i} className={`${line.startsWith('➜') ? 'text-blue-400 font-bold mt-4' : 'text-gray-300 ml-4'} break-words`}>
            {line}
          </div>
        ))}
        <div className="flex items-center text-blue-400 mt-2 font-bold animate-pulse">
          <span className="mr-2">➜</span>
          <span className="mr-2 text-purple-400">~</span>
          <input 
            ref={inputRef}
            className="flex-1 bg-transparent border-none outline-none text-gray-100 font-normal caret-white"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};