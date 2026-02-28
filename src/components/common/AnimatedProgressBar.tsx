import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedProgressBarProps {
  /** 0–100 */
  value: number;
  /** Optional label shown inside or beside the bar */
  label?: string;
  /** Color theme */
  variant?: 'accent' | 'cyan' | 'gold' | 'green';
  /** Height in px */
  height?: number;
  className?: string;
}

const gradients: Record<string, string> = {
  accent: 'linear-gradient(90deg, #f45b69, #ff7eb3)',
  cyan:   'linear-gradient(90deg, #00d4ff, #7df9ff)',
  gold:   'linear-gradient(90deg, #fbbf24, #f59e0b)',
  green:  'linear-gradient(90deg, #22c55e, #4ade80)',
};

const glows: Record<string, string> = {
  accent: 'rgba(244, 91, 105, 0.35)',
  cyan:   'rgba(0, 212, 255, 0.35)',
  gold:   'rgba(251, 191, 36, 0.35)',
  green:  'rgba(34, 197, 94, 0.35)',
};

const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  value,
  label,
  variant = 'accent',
  height = 8,
  className = '',
}) => {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-[var(--text-secondary)]">{label}</span>
          <span className="text-xs font-medium text-[var(--text)]">{Math.round(clamped)}%</span>
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{
          height,
          background: 'rgba(255,255,255,0.05)',
        }}
      >
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            background: gradients[variant],
            boxShadow: clamped > 10 ? `0 0 12px ${glows[variant]}` : 'none',
          }}
        >
          {/* Shimmer overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.15) 50%, transparent 75%)',
              backgroundSize: '200% 100%',
              animation: 'progress-shimmer 2s linear infinite',
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default AnimatedProgressBar;
