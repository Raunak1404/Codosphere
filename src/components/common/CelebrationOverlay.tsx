import React, { useEffect, useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Engine, ISourceOptions } from '@tsparticles/engine';

interface CelebrationOverlayProps {
  /** When true, the overlay shows and auto-dismisses after `duration` ms */
  show: boolean;
  /** 'confetti' for wins/achievements, 'loss' for a subtle red vignette */
  type?: 'confetti' | 'loss';
  /** Message displayed */
  message?: string;
  /** ms before auto-dismiss (default 3000) */
  duration?: number;
  onDismiss?: () => void;
}

const confettiOptions: ISourceOptions = {
  fullScreen: { enable: false },
  fpsLimit: 60,
  particles: {
    number: { value: 80 },
    color: { value: ['#f45b69', '#00d4ff', '#fbbf24', '#22c55e', '#a78bfa'] },
    shape: { type: ['circle', 'square'] },
    opacity: { value: { min: 0.6, max: 1 } },
    size: { value: { min: 3, max: 7 } },
    move: {
      enable: true,
      speed: { min: 8, max: 16 },
      direction: 'top' as const,
      gravity: { enable: true, acceleration: 5 },
      outModes: { default: 'destroy' as const },
    },
    rotate: {
      value: { min: 0, max: 360 },
      animation: { enable: true, speed: 30 },
    },
    tilt: {
      enable: true,
      value: { min: 0, max: 360 },
      animation: { enable: true, speed: 30 },
    },
    life: {
      count: 1,
      duration: { value: { min: 1, max: 3 } },
    },
  },
  emitters: {
    position: { x: 50, y: 100 },
    rate: { quantity: 20, delay: 0.1 },
    life: { count: 1, duration: 0.5 },
  },
};

const CelebrationOverlay: React.FC<CelebrationOverlayProps> = memo(({
  show,
  type = 'confetti',
  message = '',
  duration = 3000,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(false);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
        >
          {type === 'confetti' && (
            <Particles
              id="celebration-confetti"
              init={particlesInit}
              options={confettiOptions}
              className="absolute inset-0"
            />
          )}

          {type === 'loss' && (
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 40%, rgba(239,68,68,0.15) 100%)',
              }}
            />
          )}

          {message && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
              className="relative z-10 text-center"
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
                {message}
              </h2>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

CelebrationOverlay.displayName = 'CelebrationOverlay';

export default CelebrationOverlay;
