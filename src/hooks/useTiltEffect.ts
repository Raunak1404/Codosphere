import { useRef, useCallback, useEffect, useState } from 'react';

interface TiltStyle {
  transform: string;
  transition: string;
}

/**
 * Subtle 3D tilt effect on hover driven by mouse position.
 * Max rotation clamped to ±3deg for a refined, non-gimmicky feel.
 *
 * Usage:
 *   const { ref, tiltStyle } = useTiltEffect<HTMLDivElement>();
 *   <div ref={ref} style={tiltStyle}> ... </div>
 */
export function useTiltEffect<T extends HTMLElement>(maxDeg = 3) {
  const ref = useRef<T>(null);
  const [style, setStyle] = useState<TiltStyle>({
    transform: 'perspective(600px) rotateX(0deg) rotateY(0deg)',
    transition: 'transform 0.15s ease-out',
  });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 .. 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setStyle({
        transform: `perspective(600px) rotateY(${x * maxDeg * 2}deg) rotateX(${-y * maxDeg * 2}deg)`,
        transition: 'transform 0.1s ease-out',
      });
    },
    [maxDeg],
  );

  const handleMouseLeave = useCallback(() => {
    setStyle({
      transform: 'perspective(600px) rotateX(0deg) rotateY(0deg)',
      transition: 'transform 0.4s ease-out',
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return { ref, tiltStyle: style };
}
