
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BootSequenceProps {
  onComplete: () => void;
}

export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  const [lines, setLines] = useState<string[]>([]);
  
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

  return (
    <motion.div 
        className="fixed inset-0 bg-black z-[9999] flex items-center justify-center font-mono text-cyan-500 p-8"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
        transition={{ duration: 0.8 }}
    >
      <div className="w-full max-w-lg">
        <div className="border-b-2 border-cyan-500 mb-4 pb-2 flex justify-between items-end">
            <span className="text-xl font-bold">DEV.OS BIOS v2.0.4</span>
            <span className="text-xs animate-pulse">BOOTING</span>
        </div>
        <div className="space-y-2 text-sm md:text-base">
            {lines.map((line, i) => (
                <div key={i} className="flex">
                    <span className="mr-4 opacity-50">[{new Date().toLocaleTimeString()}]</span>
                    <span className="typing-effect">{line}</span>
                </div>
            ))}
            <div className="h-4 w-3 bg-cyan-500 animate-pulse mt-2" />
        </div>
      </div>
    </motion.div>
  );
};
