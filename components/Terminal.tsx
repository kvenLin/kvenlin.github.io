
import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronRight, Square, Maximize2 } from 'lucide-react';
import { FileSystem, FileSystemItem, FileType } from '../types';
import { Language, translations } from '../translations';

interface TerminalProps {
  onClose: () => void;
  files: FileSystem;
  onOpenFile: (id: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const Terminal: React.FC<TerminalProps> = ({ onClose, files, onOpenFile, language, setLanguage }) => {
  const t = translations[language];
  const [history, setHistory] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial welcome message
  useEffect(() => {
    if (!initialized) {
        setHistory([
            t.termWelcome,
            t.termConnect,
            '',
            t.termHelp,
            ''
        ]);
        setInitialized(true);
    }
  }, [language, initialized, t]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    inputRef.current?.focus();
  }, [history]);

  // Helper to find file by name (simple fuzzy match)
  const findFile = (name: string): FileSystemItem | undefined => {
    const lowerName = name.toLowerCase();
    return (Object.values(files) as FileSystemItem[]).find(f => 
        f.name.toLowerCase() === lowerName || 
        f.name.toLowerCase().startsWith(lowerName)
    );
  };

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) {
        setHistory(prev => [...prev, `➜  ~`]);
        return;
    }

    const [command, ...args] = trimmedCmd.split(/\s+/);
    let output: string | string[] = '';

    switch (command.toLowerCase()) {
      case 'help':
        output = [
          t.termUsage,
          t.cmdLs,
          t.cmdOpen,
          t.cmdCat,
          t.cmdLang,
          t.cmdClear,
          t.cmdExit
        ];
        break;
        
      case 'ls':
        const rootFiles = files['root']?.children || [];
        const srcFiles = files['folder-src']?.children || [];
        const publicFiles = files['folder-public']?.children || [];
        
        const allIds = [...rootFiles, ...srcFiles, ...publicFiles];
        const names = allIds.map(id => {
            const f = files[id];
            if (!f) return '';
            return f.type === FileType.FOLDER ? `${f.name}/` : f.name;
        }).filter(Boolean).sort();
        
        output = names.join('  ');
        break;

      case 'open':
        if (args.length === 0) {
            output = 'Usage: open <filename>';
        } else {
            const fileName = args[0];
            const file = findFile(fileName);
            if (file) {
                if (file.type === FileType.FOLDER) {
                     output = `${t.termError} ${file.name} ${t.termDirectory}.`;
                } else {
                    onOpenFile(file.id);
                    output = `${t.termOpening} ${file.name}...`;
                }
            } else {
                output = `${t.termError} ${fileName} ${t.termNotFound}.`;
            }
        }
        break;

      case 'cat':
        if (args.length === 0) {
            output = 'Usage: cat <filename>';
        } else {
            const fileName = args[0];
            const file = findFile(fileName);
            if (file) {
                if (file.type === FileType.FOLDER) {
                     output = `${t.termError} ${file.name} ${t.termDirectory}.`;
                } else {
                    // Limit output length for terminal
                    const content = file.content || '';
                    const lines = content.split('\n').slice(0, 10);
                    if (content.split('\n').length > 10) lines.push('... (use open to see full content)');
                    output = lines;
                }
            } else {
                output = `${t.termError} ${fileName} ${t.termNotFound}.`;
            }
        }
        break;

      case 'lang':
        if (args.length === 0) {
            output = 'Usage: lang <en|zh>';
        } else {
            const lang = args[0].toLowerCase();
            if (lang === 'en' || lang === 'zh') {
                setLanguage(lang as Language);
                output = `Language switched to ${lang === 'zh' ? 'Chinese' : 'English'}.`;
            } else {
                output = 'Error: Invalid language. Use "en" or "zh".';
            }
        }
        break;

      case 'whoami':
        output = 'visitor@devblog-system';
        break;

      case 'date':
        output = new Date().toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US');
        break;

      case 'clear':
        setHistory([]);
        return;

      case 'exit':
        onClose();
        return;

      default:
        output = t.termCommandNotFound;
    }

    setHistory(prev => [...prev, `➜  ~ ${cmd}`, ...(Array.isArray(output) ? output : [output]), '']);
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
            <div className="px-2 py-0.5 rounded text-[10px] bg-blue-900/30 text-blue-400 border border-blue-500/20">zsh</div>
        </div>
        <div className="flex items-center gap-4">
            <Maximize2 size={14} className="text-gray-500 hover:text-white cursor-pointer" />
            <X size={14} className="text-gray-500 hover:text-red-400 cursor-pointer" onClick={onClose} />
        </div>
      </div>
      
      {/* Terminal Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide font-mono">
        {history.map((line, i) => (
          <div key={i} className={`${line.startsWith('➜') ? 'text-cyan-400 font-bold mt-3' : 'text-gray-400 ml-4 leading-relaxed'} break-words whitespace-pre-wrap`}>
            {line}
          </div>
        ))}
        <div className="flex items-center text-cyan-400 mt-2 font-bold group">
          <span className="mr-2">➜</span>
          <span className="mr-2 text-purple-400">~</span>
          <input 
            ref={inputRef}
            className="flex-1 bg-transparent border-none outline-none text-gray-100 font-normal caret-cyan-400"
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
