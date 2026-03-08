import React, { useState, useEffect } from 'react';

/**
 * 2px accent-colored bar at viewport top, fills as user scrolls.
 * Uses single scaleX transform on fixed div — zero layout cost.
 */
const ScrollProgress: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min(scrollTop / docHeight, 1));
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (progress <= 0) return null;

  return (
    <div
      className="fixed top-0 left-0 w-full h-[2px] z-50 pointer-events-none"
      style={{
        background: 'linear-gradient(90deg, var(--accent), var(--accent-secondary), var(--accent))',
        transform: `scaleX(${progress})`,
        transformOrigin: 'left',
        WebkitTransform: `scaleX(${progress})`,
        opacity: progress > 0.01 ? 1 : 0,
        transition: 'opacity 0.2s ease',
      }}
    />
  );
};

export default React.memo(ScrollProgress);
