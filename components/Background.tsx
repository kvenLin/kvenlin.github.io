import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Theme } from '../types';

interface BackgroundProps {
  theme: Theme;
}

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  angle: number;
}

export const Background: React.FC<BackgroundProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const animationFrameRef = useRef<number>(0);

  // Initialize stars
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      const starCount = Math.floor((window.innerWidth * window.innerHeight) / 3000);
      starsRef.current = [];
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          opacity: Math.random(),
          speed: Math.random() * 0.05 + 0.01,
        });
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      if (!canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw stars
      ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#1e293b';
      starsRef.current.forEach((star) => {
        star.y -= star.speed;
        if (star.y < 0) star.y = canvas.height;
        
        // Twinkle effect
        star.opacity += (Math.random() - 0.5) * 0.05;
        if (star.opacity < 0.3) star.opacity = 0.3;
        if (star.opacity > 1) star.opacity = 1;

        ctx.globalAlpha = star.opacity * (theme === 'dark' ? 1 : 0.8);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Randomly spawn shooting stars
      if (Math.random() < 0.005 && shootingStarsRef.current.length < 3) {
        shootingStarsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.5,
          length: Math.random() * 80 + 20,
          speed: Math.random() * 10 + 5,
          opacity: 1,
          angle: Math.PI / 4 // 45 degrees
        });
      }

      // Update and draw shooting stars
      ctx.strokeStyle = theme === 'dark' ? '#22d3ee' : '#0ea5e9';
      ctx.lineWidth = 2;
      shootingStarsRef.current = shootingStarsRef.current.filter(star => {
        star.x += star.speed * Math.cos(star.angle);
        star.y += star.speed * Math.sin(star.angle);
        star.opacity -= 0.02;

        if (star.opacity <= 0) return false;

        ctx.globalAlpha = star.opacity;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x - star.length * Math.cos(star.angle), star.y - star.length * Math.sin(star.angle));
        ctx.stroke();

        return true;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [theme]);

  const blobColors = theme === 'dark' 
    ? ['bg-blue-500/30', 'bg-cyan-500/30', 'bg-purple-500/30']
    : ['bg-blue-400/40', 'bg-cyan-400/40', 'bg-purple-400/40'];

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Animated Gradient Blobs */}
      <motion.div 
        animate={{ 
            x: [0, 100, 0], 
            y: [0, -50, 0],
            scale: [1, 1.2, 1] 
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] ${blobColors[0]}`} 
      />
      <motion.div 
        animate={{ 
            x: [0, -100, 0], 
            y: [0, 50, 0],
            scale: [1, 1.3, 1] 
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className={`absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] ${blobColors[1]}`} 
      />
      <motion.div 
        animate={{ 
            x: [0, 50, 0], 
            y: [0, 100, 0],
            scale: [1, 1.1, 1] 
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        className={`absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full blur-[100px] ${blobColors[2]}`} 
      />

      {/* Star Field Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full opacity-90"
      />
    </div>
  );
};
