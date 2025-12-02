import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { LanguageFn } from 'highlight.js';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import javaLang from 'highlight.js/lib/languages/java';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import xml from 'highlight.js/lib/languages/xml';
import cssLang from 'highlight.js/lib/languages/css';
import scss from 'highlight.js/lib/languages/scss';
import less from 'highlight.js/lib/languages/less';
import sql from 'highlight.js/lib/languages/sql';
import pythonLang from 'highlight.js/lib/languages/python';
import graphql from 'highlight.js/lib/languages/graphql';
import markdownLang from 'highlight.js/lib/languages/markdown';
import 'highlight.js/styles/github-dark.css';
import { Code, Copy, Check } from 'lucide-react';

const HIGHLIGHT_LANGUAGES: Array<[string, LanguageFn]> = [
  ['javascript', javascript as LanguageFn],
  ['typescript', typescript as LanguageFn],
  ['bash', bash as LanguageFn],
  ['java', javaLang as LanguageFn],
  ['json', json as LanguageFn],
  ['yaml', yaml as LanguageFn],
  ['xml', xml as LanguageFn],
  ['css', cssLang as LanguageFn],
  ['scss', scss as LanguageFn],
  ['less', less as LanguageFn],
  ['sql', sql as LanguageFn],
  ['python', pythonLang as LanguageFn],
  ['graphql', graphql as LanguageFn],
  ['markdown', markdownLang as LanguageFn],
];

HIGHLIGHT_LANGUAGES.forEach(([name, language]) => {
  if (!hljs.getLanguage(name)) {
    hljs.registerLanguage(name, language);
  }
});

hljs.registerAliases(['js', 'jsx', 'javascriptreact'], { languageName: 'javascript' });
hljs.registerAliases(['ts', 'tsx', 'typescriptreact'], { languageName: 'typescript' });
hljs.registerAliases(['sh', 'shell', 'zsh'], { languageName: 'bash' });

const escapeHtml = (str: string) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

type LanguageTheme = {
  label: string;
  gradient: string;
  border: string;
  glow: string;
  headerBg: string;
  headerBorder: string;
  labelBg: string;
  labelText: string;
  copyHover: string;
  dotColors: string[];
  codeBg: string;
  codeText: string;
  icon: typeof Code;
};

const BASE_LANGUAGE_THEME: LanguageTheme = {
  label: 'Code',
  gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
  border: 'border-white/10',
  glow: 'shadow-[0_20px_45px_rgba(15,23,42,0.45)]',
  headerBg: 'bg-gradient-to-r from-white/10 via-white/5 to-transparent',
  headerBorder: 'border-white/10',
  labelBg: 'bg-cyan-500/10 border border-cyan-500/25',
  labelText: 'text-cyan-100',
  copyHover: 'hover:text-cyan-200',
  dotColors: ['bg-red-500/50', 'bg-yellow-500/50', 'bg-emerald-500/50'],
  codeBg: 'bg-[#050d1a]/95',
  codeText: 'text-slate-100',
  icon: Code,
};

const LANGUAGE_THEMES: Record<string, LanguageTheme> = {
  default: BASE_LANGUAGE_THEME,
  java: {
    ...BASE_LANGUAGE_THEME,
    label: 'Java',
    gradient: 'from-orange-500/25 via-amber-400/10 to-transparent',
    border: 'border-orange-400/40',
    glow: 'shadow-[0_22px_50px_rgba(251,146,60,0.28)]',
    headerBg: 'bg-gradient-to-r from-orange-500/20 via-amber-400/10 to-transparent',
    headerBorder: 'border-orange-400/40',
    labelBg: 'bg-orange-500/20 border border-orange-400/40',
    labelText: 'text-orange-50',
    copyHover: 'hover:text-orange-200',
    dotColors: ['bg-orange-500/70', 'bg-amber-400/60', 'bg-yellow-300/60'],
    codeBg: 'bg-[#211306]/95',
    codeText: 'text-orange-50',
    icon: Code,
  },
  javascript: {
    ...BASE_LANGUAGE_THEME,
    label: 'JavaScript',
    gradient: 'from-amber-500/20 via-amber-500/10 to-transparent',
    border: 'border-amber-500/40',
    glow: 'shadow-[0_22px_50px_rgba(217,119,6,0.28)]',
    headerBg: 'bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent',
    headerBorder: 'border-amber-500/40',
    labelBg: 'bg-amber-500/15 border border-amber-400/40',
    labelText: 'text-amber-100',
    copyHover: 'hover:text-amber-200',
    dotColors: ['bg-amber-500/70', 'bg-amber-400/60', 'bg-yellow-300/60'],
    codeBg: 'bg-[#1f1405]/95',
    codeText: 'text-amber-50',
    icon: Code,
  },
  typescript: {
    ...BASE_LANGUAGE_THEME,
    label: 'TypeScript',
    gradient: 'from-sky-500/20 via-sky-500/10 to-transparent',
    border: 'border-sky-500/40',
    glow: 'shadow-[0_22px_50px_rgba(56,189,248,0.28)]',
    headerBg: 'bg-gradient-to-r from-sky-500/15 via-sky-500/10 to-transparent',
    headerBorder: 'border-sky-500/40',
    labelBg: 'bg-sky-500/15 border border-sky-400/40',
    labelText: 'text-sky-100',
    copyHover: 'hover:text-sky-200',
    dotColors: ['bg-sky-500/70', 'bg-sky-400/60', 'bg-cyan-300/60'],
    codeBg: 'bg-[#061b2d]/95',
    codeText: 'text-sky-100',
    icon: Code,
  },
  shell: {
    ...BASE_LANGUAGE_THEME,
    label: 'Shell',
    gradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
    border: 'border-emerald-500/35',
    glow: 'shadow-[0_22px_50px_rgba(16,185,129,0.25)]',
    headerBg: 'bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-transparent',
    headerBorder: 'border-emerald-500/35',
    labelBg: 'bg-emerald-500/20 border border-emerald-400/40',
    labelText: 'text-emerald-100',
    copyHover: 'hover:text-emerald-200',
    dotColors: ['bg-emerald-500/70', 'bg-emerald-400/60', 'bg-lime-300/60'],
    codeBg: 'bg-[#041a12]/95',
    codeText: 'text-emerald-100',
    icon: Code,
  },
  markup: {
    ...BASE_LANGUAGE_THEME,
    label: 'Markup',
    gradient: 'from-rose-500/20 via-rose-500/10 to-transparent',
    border: 'border-rose-500/40',
    glow: 'shadow-[0_22px_50px_rgba(244,114,182,0.28)]',
    headerBg: 'bg-gradient-to-r from-rose-500/15 via-rose-500/10 to-transparent',
    headerBorder: 'border-rose-500/40',
    labelBg: 'bg-rose-500/15 border border-rose-400/40',
    labelText: 'text-rose-100',
    copyHover: 'hover:text-rose-200',
    dotColors: ['bg-rose-500/70', 'bg-pink-400/60', 'bg-rose-300/60'],
    codeBg: 'bg-[#240414]/95',
    codeText: 'text-rose-100',
    icon: Code,
  },
  styles: {
    ...BASE_LANGUAGE_THEME,
    label: 'Styles',
    gradient: 'from-violet-500/20 via-violet-500/10 to-transparent',
    border: 'border-violet-500/40',
    glow: 'shadow-[0_22px_50px_rgba(139,92,246,0.3)]',
    headerBg: 'bg-gradient-to-r from-violet-500/15 via-violet-500/10 to-transparent',
    headerBorder: 'border-violet-500/40',
    labelBg: 'bg-violet-500/15 border border-violet-400/40',
    labelText: 'text-violet-100',
    copyHover: 'hover:text-violet-200',
    dotColors: ['bg-violet-500/70', 'bg-purple-400/60', 'bg-indigo-300/60'],
    codeBg: 'bg-[#1a0f2b]/95',
    codeText: 'text-violet-100',
    icon: Code,
  },
  data: {
    ...BASE_LANGUAGE_THEME,
    label: 'Data',
    gradient: 'from-amber-200/10 via-emerald-200/10 to-transparent',
    border: 'border-amber-300/30',
    glow: 'shadow-[0_22px_50px_rgba(250,204,21,0.22)]',
    headerBg: 'bg-gradient-to-r from-amber-300/15 via-emerald-200/10 to-transparent',
    headerBorder: 'border-amber-300/30',
    labelBg: 'bg-amber-300/15 border border-amber-200/40',
    labelText: 'text-amber-50',
    copyHover: 'hover:text-amber-100',
    dotColors: ['bg-amber-300/60', 'bg-emerald-300/60', 'bg-lime-200/60'],
    codeBg: 'bg-[#1b1805]/95',
    codeText: 'text-amber-100',
    icon: Code,
  },
  database: {
    ...BASE_LANGUAGE_THEME,
    label: 'Database',
    gradient: 'from-cyan-500/20 via-emerald-500/10 to-transparent',
    border: 'border-cyan-500/40',
    glow: 'shadow-[0_22px_50px_rgba(6,182,212,0.28)]',
    headerBg: 'bg-gradient-to-r from-cyan-500/15 via-emerald-500/10 to-transparent',
    headerBorder: 'border-cyan-500/40',
    labelBg: 'bg-cyan-500/15 border border-cyan-400/40',
    labelText: 'text-cyan-100',
    copyHover: 'hover:text-cyan-100',
    dotColors: ['bg-cyan-500/70', 'bg-emerald-400/60', 'bg-teal-300/60'],
    codeBg: 'bg-[#031a1c]/95',
    codeText: 'text-cyan-100',
    icon: Code,
  },
  python: {
    ...BASE_LANGUAGE_THEME,
    label: 'Python',
    gradient: 'from-indigo-500/20 via-sky-500/10 to-transparent',
    border: 'border-indigo-500/35',
    glow: 'shadow-[0_22px_50px_rgba(99,102,241,0.28)]',
    headerBg: 'bg-gradient-to-r from-indigo-500/15 via-sky-500/10 to-transparent',
    headerBorder: 'border-indigo-500/35',
    labelBg: 'bg-indigo-500/15 border border-indigo-400/40',
    labelText: 'text-indigo-100',
    copyHover: 'hover:text-indigo-200',
    dotColors: ['bg-indigo-500/70', 'bg-sky-400/60', 'bg-yellow-300/60'],
    codeBg: 'bg-[#0d1028]/95',
    codeText: 'text-indigo-100',
    icon: Code,
  },
};

const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  es6: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  typescriptreact: 'typescript',
  javascriptreact: 'javascript',
  shell: 'shell',
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
  fish: 'shell',
  powershell: 'shell',
  ps: 'shell',
  html: 'markup',
  xml: 'markup',
  svg: 'markup',
  md: 'markup',
  markdown: 'markup',
  css: 'styles',
  scss: 'styles',
  less: 'styles',
  styl: 'styles',
  json: 'data',
  yaml: 'data',
  yml: 'data',
  toml: 'data',
  java: 'java',
  graphql: 'data',
  sql: 'database',
  mysql: 'database',
  postgres: 'database',
  postgresql: 'database',
  sqlite: 'database',
  py: 'python',
  python: 'python',
};

const resolveLanguage = (className?: string) => {
  const match = /language-([\w-]+)/.exec(className || '');
  if (!match) return 'default';
  const raw = match[1].toLowerCase();
  return LANGUAGE_ALIASES[raw] ?? raw;
};

const prettifyLanguageLabel = (lang?: string) => {
  if (!lang || lang === 'default') return 'Code';
  return lang
    .split(/[-_]/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  node?: unknown;
  [key: string]: unknown;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const languageMatch = /language-([\w-]+)/.exec(className || '');
  const rawLanguage = languageMatch?.[1]?.toLowerCase();
  const resolvedLanguage = resolveLanguage(className);

  const theme = useMemo(() => {
    if (LANGUAGE_THEMES[resolvedLanguage]) {
      return LANGUAGE_THEMES[resolvedLanguage];
    }
    const dynamicLabel = prettifyLanguageLabel(rawLanguage ?? resolvedLanguage);
    return {
      ...BASE_LANGUAGE_THEME,
      label: dynamicLabel,
      icon: Code,
    } satisfies LanguageTheme;
  }, [resolvedLanguage, rawLanguage]);

  const Icon = theme.icon ?? Code;
  const displayLabel = theme.label ?? prettifyLanguageLabel(rawLanguage ?? resolvedLanguage);
  const codeContent = String(children ?? '').replace(/\n$/, '');

  const highlightedHtml = useMemo(() => {
    if (!codeContent) return '';
    try {
      if (resolvedLanguage !== 'default' && hljs.getLanguage(resolvedLanguage)) {
        return hljs.highlight(codeContent, {
          language: resolvedLanguage,
          ignoreIllegals: true,
        }).value;
      }
      return hljs.highlightAuto(codeContent).value;
    } catch (error) {
      console.warn('highlight.js failed to render code block', error);
      return escapeHtml(codeContent);
    }
  }, [codeContent, resolvedLanguage]);

  const isInline = inline || (!languageMatch && !codeContent.includes('\n'));

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isInline) {
    return (
      <code className="text-cyan-300 bg-cyan-950/30 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className={`relative group my-8 rounded-2xl overflow-hidden border ${theme.border} ${theme.glow}`}
    >
      <div className={`absolute inset-0 pointer-events-none bg-gradient-to-br ${theme.gradient} opacity-60`} />
      <div className="relative">
        <div className={`flex items-center justify-between px-4 py-3 ${theme.headerBg} border-b ${theme.headerBorder}`}>
          <div className="flex gap-1.5">
            {theme.dotColors.map((dotClass, idx) => (
              <div key={idx} className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-widest ${theme.labelBg} ${theme.labelText}`}>
              <Icon size={14} />
              {displayLabel}
            </span>
            <button onClick={handleCopy} className={`text-gray-400 transition-colors ${theme.copyHover}`} title="复制代码">
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
        <div className={`${className ?? ''} block p-6 text-sm font-mono overflow-x-auto ${theme.codeBg} ${theme.codeText}`} {...props}>
          <pre className="whitespace-pre break-words m-0 p-0">
            <code className={`hljs block text-sm font-mono leading-relaxed ${theme.codeText}`} dangerouslySetInnerHTML={{ __html: highlightedHtml || escapeHtml(codeContent) }} />
          </pre>
        </div>
      </div>
    </motion.div>
  );
};
