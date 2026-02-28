import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

type Direction = 'up' | 'down' | 'left' | 'right' | 'scale';

interface RevealOnScrollProps {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  /** 0–1, how much of the element must be visible before triggering */
  threshold?: number;
  className?: string;
  once?: boolean;
}

const offsets: Record<Direction, { x?: number; y?: number; scale?: number }> = {
  up:    { y: 30 },
  down:  { y: -30 },
  left:  { x: 30 },
  right: { x: -30 },
  scale: { scale: 0.9 },
};

const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  threshold = 0.15,
  className = '',
  once = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, amount: threshold });

  const offset = offsets[direction];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...offset }}
      animate={inView ? { opacity: 1, x: 0, y: 0, scale: 1 } : undefined}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1], // cubic-bezier ease-out
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default RevealOnScroll;
