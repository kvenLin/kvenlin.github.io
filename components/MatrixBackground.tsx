import React, { useEffect, useRef } from 'react';

export const MatrixBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Characters to use (Katakana + Numbers)
    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const alphabet = katakana + latin + nums;

    const fontSize = 16;
    const columns = Math.ceil(width / fontSize);

    const rainDrops: number[] = [];
    for (let x = 0; x < columns; x++) {
      rainDrops[x] = Math.floor(Math.random() * height / fontSize); // Start at random heights
    }

    // Animation loop variables
    let animationFrameId: number;
    let lastTime = 0;
    const fps = 30; // Limit to 30 FPS for performance
    const interval = 1000 / fps;

    const draw = (timestamp: number) => {
      const deltaTime = timestamp - lastTime;

      if (deltaTime >= interval) {
          lastTime = timestamp - (deltaTime % interval);

          // Semi-transparent black to create fade trail effect
          ctx.fillStyle = 'rgba(2, 6, 23, 0.05)'; 
          ctx.fillRect(0, 0, width, height);

          ctx.font = fontSize + 'px monospace';
            
          for (let i = 0; i < rainDrops.length; i++) {
            const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            const isWhite = Math.random() > 0.99; // Reduced white frequency slightly
                
            // Only switch color if necessary. Default is cyan.
            ctx.fillStyle = isWhite ? '#ffffff' : '#0891b2';
            ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

            if (rainDrops[i] * fontSize > height && Math.random() > 0.975) {
                rainDrops[i] = 0;
            }
            rainDrops[i]++;
          }
        }
        animationFrameId = requestAnimationFrame(draw);
    };

    // Start loop
    animationFrameId = requestAnimationFrame(draw);

    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        // Recalculate columns on resize
        const newColumns = Math.ceil(width / fontSize);
        // Preserve existing drops, add new ones if wider
        if (newColumns > rainDrops.length) {
             for (let x = rainDrops.length; x < newColumns; x++) {
                rainDrops[x] = Math.floor(Math.random() * height / fontSize);
             }
        }
    };
    
    // Debounce resize
    let resizeTimeout: NodeJS.Timeout;
    const debouncedResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 200);
    };

    window.addEventListener('resize', debouncedResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <canvas 
        ref={canvasRef} 
        className="fixed inset-0 z-0 opacity-[0.15] pointer-events-none"
    />
  );
};