import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Lagoon-theme ambient decorations: rising bubbles, water sparkles, shimmer edges,
 * horizon glow, and wave overlay. Only rendered when theme === 'lagoon'.
 * All elements are pointer-events: none and purely decorative.
 *
 * Performance: Removed clipart SVGs (palm trees, fish, seashell).
 * Bubbles use only bubble-rise (transform + opacity = compositor-only).
 * bubble-shimmer removed (was animating box-shadow = paint trigger).
 */
const LagoonDecorations: React.FC = () => {
  const { theme } = useTheme();

  if (theme !== 'lagoon') return null;

  return (
    <>
      {/* Horizon glow at top */}
      <div className="lagoon-horizon" />

      {/* Water shimmer edge accents */}
      <div className="lagoon-shimmer-left" />
      <div className="lagoon-shimmer-right" />

      {/* Wave overlay at bottom (replaces sandy shore) */}
      <div className="lagoon-wave-bottom">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <path
            d="M0 80 C240 40, 480 100, 720 60 C960 20, 1200 90, 1440 50 L1440 120 L0 120 Z"
            fill="rgba(111, 207, 153, 0.04)"
          />
          <path
            d="M0 90 C300 60, 600 110, 900 70 C1100 45, 1300 95, 1440 65 L1440 120 L0 120 Z"
            fill="rgba(56, 189, 248, 0.03)"
          />
        </svg>
      </div>

      {/* Bubbles — 5 translucent circles that rise upward (reduced from 8) */}
      <div className="lagoon-bubble" style={{ left: '12%', top: '75%' }} />
      <div className="lagoon-bubble" style={{ left: '30%', top: '68%' }} />
      <div className="lagoon-bubble" style={{ left: '55%', top: '72%' }} />
      <div className="lagoon-bubble" style={{ left: '75%', top: '80%' }} />
      <div className="lagoon-bubble" style={{ left: '88%', top: '65%' }} />

      {/* Water sparkles — simple CSS dots with opacity animation */}
      {[14, 38, 62, 82, 48].map((left, i) => (
        <div
          key={i}
          className="lagoon-sparkle-dot"
          style={{ left: `${left}%`, top: `${45 + i * 5}%` }}
        />
      ))}
    </>
  );
};

export default React.memo(LagoonDecorations);
