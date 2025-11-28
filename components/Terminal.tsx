
import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronRight, Square, Maximize2 } from 'lucide-react';
import { FileSystem, FileSystemItem, FileType, Theme } from '../types';
import { Language, translations } from '../translations';

interface TerminalProps {
  onClose: () => void;
  files: FileSystem;
  onOpenFile: (id: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const Terminal: React.FC<TerminalProps> = ({ onClose, files, onOpenFile, language, setLanguage, theme, setTheme }) => {
  const t = translations[language];
  const [history, setHistory] = useState<string[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [initialized, setInitialized] = useState(false);
  const [input, setInput] = useState('');
  const [currentDirId, setCurrentDirId] = useState('root');
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

  // Helper to get current path string
  const getPath = (dirId: string): string => {
      if (dirId === 'root') return '~';
      let path = '';
      let currentId: string | null = dirId;
      while (currentId && currentId !== 'root') {
          const item = files[currentId];
          if (!item) break;
          path = '/' + item.name + path;
          currentId = item.parentId;
      }
      return '~' + path;
  };

  // Helper to find file in current directory
  const findFileInCurrentDir = (name: string): FileSystemItem | undefined => {
    const currentDir = files[currentDirId];
    if (!currentDir || !currentDir.children) return undefined;
    
    const lowerName = name.toLowerCase();
    // Direct match first
    const directMatchId = currentDir.children.find(id => {
        const f = files[id];
        return f?.name === name;
    });
    if (directMatchId) return files[directMatchId];

    // Then case-insensitive
    const insensitiveMatchId = currentDir.children.find(id => {
        const f = files[id];
        return f?.name.toLowerCase() === lowerName;
    });
    if (insensitiveMatchId) return files[insensitiveMatchId];
    
    return undefined;
  };

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    const currentPathStr = getPath(currentDirId);
    
    if (!trimmedCmd) {
        setHistory(prev => [...prev, `➜  ${currentPathStr}`]);
        return;
    }

    // Add to command history
    setCommandHistory(prev => [...prev, trimmedCmd]);
    setHistoryIndex(-1);

    const [command, ...args] = trimmedCmd.split(/\s+/);
    let output: string | string[] = '';

    switch (command.toLowerCase()) {
      case 'help':
        output = [
          t.termUsage,
          t.cmdLs,
          "  cd <dir>        Change directory",
          "  pwd             Print working directory",
          t.cmdOpen,
          t.cmdCat,
          "  echo <text>     Print text",
          "  theme <mode>    Toggle theme (dark/light)",
          t.cmdLang,
          "  history         Show command history",
          "  reboot          Reload system",
          t.cmdClear,
          t.cmdExit
        ];
        break;
        
      case 'ls':
        const currentDir = files[currentDirId];
        if (currentDir && currentDir.children) {
            const names = currentDir.children.map(id => {
                const f = files[id];
                if (!f) return '';
                return f.type === FileType.FOLDER ? `${f.name}/` : f.name;
            }).filter(Boolean).sort();
            output = names.join('  ');
        } else {
            output = '';
        }
        break;

      case 'cd':
        if (args.length === 0) {
            setCurrentDirId('root');
        } else {
            const target = args[0];
            if (target === '..') {
                const parentId = files[currentDirId]?.parentId;
                if (parentId) setCurrentDirId(parentId);
            } else if (target === '/' || target === '~') {
                setCurrentDirId('root');
            } else {
                const dir = findFileInCurrentDir(target);
                if (dir) {
                    if (dir.type === FileType.FOLDER) {
                        setCurrentDirId(dir.id);
                    } else {
                        output = `${t.termError} ${target} ${t.termDirectory}.`; // Actually "is not a directory" but re-using message logic
                        output = `Error: ${target} is not a directory.`;
                    }
                } else {
                    output = `${t.termError} ${target} ${t.termNotFound}.`;
                }
            }
        }
        break;

      case 'pwd':
        output = getPath(currentDirId).replace('~', '/home/visitor');
        break;

      case 'echo':
        output = args.join(' ');
        break;

      case 'open':
        if (args.length === 0) {
            output = 'Usage: open <filename>';
        } else {
            const fileName = args[0];
            const file = findFileInCurrentDir(fileName);
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
            const file = findFileInCurrentDir(fileName);
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
        
      case 'theme':
        if (args.length > 0) {
            const mode = args[0].toLowerCase();
            if (mode === 'dark' || mode === 'light') {
                setTheme(mode);
                output = `Theme set to ${mode} mode.`;
            } else {
                output = 'Usage: theme <dark|light>';
            }
        } else {
            setTheme(theme === 'dark' ? 'light' : 'dark');
            output = `Theme toggled to ${theme === 'dark' ? 'light' : 'dark'} mode.`;
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
      
      case 'history':
        output = commandHistory;
        break;

      case 'reboot':
        window.location.reload();
        return;

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

    setHistory(prev => [...prev, `➜  ${currentPathStr} ${cmd}`, ...(Array.isArray(output) ? output : [output]), '']);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (commandHistory.length > 0) {
            const newIndex = historyIndex + 1;
            if (newIndex < commandHistory.length) {
                setHistoryIndex(newIndex);
                setInput(commandHistory[commandHistory.length - 1 - newIndex]);
            }
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setInput(commandHistory[commandHistory.length - 1 - newIndex]);
        } else if (historyIndex === 0) {
            setHistoryIndex(-1);
            setInput('');
        }
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
          <span className="mr-2 text-purple-400">{getPath(currentDirId)}</span>
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

