
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../src/config/site';
import type { Theme } from '../types';

interface BootSequenceProps {
  onComplete: () => void;
  theme?: Theme;
}

export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete, theme = 'dark' }) => {
  const [lines, setLines] = useState<string[]>([]);
  const isDark = theme === 'dark';
  
  const sequence = [
    { text: "INITIALIZING KERNEL...", delay: 50 },
    { text: "LOADING MEMORY MODULES... OK", delay: 200 },
    { text: "MOUNTING VIRTUAL FILE SYSTEM...", delay: 400 },
    { text: "ESTABLISHING NEURAL LINK...", delay: 700 },
    { text: "DECRYPTING SECURE ARCHIVES...", delay: 1000 },
    { text: "SYSTEM READY.", delay: 1200 }
  ];

  useEffect(() => {
    let timeouts: ReturnType<typeof setTimeout>[] = [];
    
    sequence.forEach(({ text, delay }) => {
      const timeout = setTimeout(() => {
        setLines(prev => [...prev, text]);
      }, delay);
      timeouts.push(timeout);
    });

    // Finished much faster now (1.5s total approx)
    const finishTimeout = setTimeout(() => {
        onComplete();
    }, 1500);
    timeouts.push(finishTimeout);

    return () => timeouts.forEach(t => clearTimeout(t));
  }, []);

  const containerClasses = isDark
    ? 'bg-gradient-to-br from-[#020617] via-[#0a1224] to-[#0b1731] text-cyan-200'
    : 'bg-gradient-to-br from-[#e9f4ff] via-[#d7e9ff] to-[#c0dbff] text-[#0b2244]';

  const headerBorder = isDark ? 'border-cyan-500/80' : 'border-[#7cc7ff]';
  const headerText = isDark ? 'text-cyan-200' : 'text-[#0f3059]';
  const pulseColor = isDark ? 'bg-cyan-400' : 'bg-[#2ea3ff]';
  const glowOverlay = isDark
    ? 'from-cyan-500/20 via-blue-500/10 to-transparent'
    : 'from-[#7cc7ff]/40 via-[#6bd6ff]/20 to-transparent';

  return (
    <motion.div 
        className={`fixed inset-0 z-[9999] flex items-center justify-center font-mono p-8 ${containerClasses}`}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
        transition={{ duration: 0.8 }}
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(0,200,255,0.12),transparent_30%)] mix-blend-screen opacity-70" />
      <div className={`absolute inset-0 pointer-events-none bg-gradient-to-b ${glowOverlay} blur-3xl opacity-70`} />
      <div className="w-full max-w-lg">
        <div className={`border-b-2 ${headerBorder} mb-4 pb-2 flex justify-between items-end drop-shadow-[0_5px_20px_rgba(0,255,255,0.25)]`}>
            <span className={`text-xl font-bold ${headerText}`}>DEV.OS BIOS v{siteConfig.build.version}</span>
            <span className={`text-xs animate-pulse ${headerText}`}>BOOTING</span>
        </div>
        <div className="space-y-2 text-sm md:text-base relative">
            {lines.map((line, i) => (
                <div key={i} className="flex">
                    <span className="mr-4 opacity-60">[{new Date().toLocaleTimeString()}]</span>
                    <span className="typing-effect drop-shadow-[0_2px_12px_rgba(0,255,255,0.25)]">{line}</span>
                </div>
            ))}
            <div className={`h-4 w-3 ${pulseColor} animate-pulse mt-2 shadow-[0_0_20px_rgba(6,182,212,0.6)]`} />
        </div>
      </div>
    </motion.div>
  );
};
