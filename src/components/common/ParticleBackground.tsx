import { useCallback, useMemo, memo } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Engine, ISourceOptions } from '@tsparticles/engine';

/**
 * Ambient particle background — sparse, GPU-accelerated, auto-disabled on
 * reduced-motion and small screens.  Rendered once at the app root.
 */
const ParticleBackground = memo(() => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const options: ISourceOptions = useMemo(() => ({
    fullScreen: { enable: false },
    fpsLimit: 60,
    detectRetina: true,
    pauseOnOutsideViewport: true,
    particles: {
      number: {
        value: 35,
        density: { enable: true, width: 1200, height: 800 },
      },
      color: {
        value: ['#f45b69', '#00d4ff', '#fbbf24'],
      },
      opacity: {
        value: { min: 0.08, max: 0.2 },
        animation: {
          enable: true,
          speed: 0.3,
          sync: false,
        },
      },
      size: {
        value: { min: 1, max: 2.5 },
      },
      move: {
        enable: true,
        speed: 0.4,
        direction: 'none' as const,
        random: true,
        straight: false,
        outModes: { default: 'out' as const },
      },
      links: {
        enable: true,
        distance: 150,
        color: '#f45b69',
        opacity: 0.06,
        width: 1,
      },
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: 'repulse' },
        resize: { enable: true },
      },
      modes: {
        repulse: { distance: 100, duration: 0.4, speed: 0.5 },
      },
    },
  }), []);

  // Disable particles on small screens (mobile perf) or reduced motion
  if (typeof window !== 'undefined') {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmallScreen = window.innerWidth < 768;
    if (prefersReducedMotion || isSmallScreen) return null;
  }

  return (
    <Particles
      id="tsparticles-bg"
      init={particlesInit}
      options={options}
      className="fixed inset-0 z-[-1] pointer-events-none"
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
    />
  );
});

ParticleBackground.displayName = 'ParticleBackground';

export default ParticleBackground;
