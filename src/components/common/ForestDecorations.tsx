import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Forest-theme ambient decorations: fireflies, floating leaves, vine edges,
 * canopy overlay, and ground moss. Only rendered when theme === 'forest'.
 * All elements are pointer-events: none and purely decorative.
 */
const ForestDecorations: React.FC = () => {
  const { theme } = useTheme();

  if (theme !== 'forest') return null;

  return (
    <>
      {/* Canopy shadow at top */}
      <div className="forest-canopy" />

      {/* Vine edge accents */}
      <div className="forest-vine-left" />
      <div className="forest-vine-right" />

      {/* Ground moss gradient */}
      <div className="forest-ground" />

      {/* Fireflies — small glowing dots that drift upward */}
      <div className="forest-firefly" style={{ left: '10%', top: '60%' }} />
      <div className="forest-firefly" style={{ left: '15%', top: '30%' }} />
      <div className="forest-firefly" style={{ left: '70%', top: '20%' }} />
      <div className="forest-firefly" style={{ left: '85%', top: '60%' }} />
      <div className="forest-firefly" style={{ left: '40%', top: '70%' }} />
      <div className="forest-firefly" style={{ left: '25%', top: '50%' }} />
      <div className="forest-firefly" style={{ left: '60%', top: '80%' }} />
      <div className="forest-firefly" style={{ left: '90%', top: '40%' }} />

      {/* Floating leaves — subtle SVG leaves that drift down */}
      {[10, 30, 55, 78, 42].map((left, i) => (
        <div
          key={i}
          className="forest-leaf"
          style={{ left: `${left}%`, top: '-5%' }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.5 6.5 4 11 4 15c0 4.4 3.6 8 8 8 0-4 1-8 4-12-1.3.7-2.7 1-4 1 2-3 3.5-6.5 4-10-1.3 1-2.7 1.5-4 0z"
              fill="rgba(16, 185, 129, 0.4)"
            />
          </svg>
        </div>
      ))}

      {/* SVG tree silhouettes at bottom corners */}
      <svg
        className="fixed bottom-0 left-0 pointer-events-none z-0"
        width="120"
        height="200"
        viewBox="0 0 120 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.04 }}
      >
        {/* Simple pine tree silhouette */}
        <path d="M60 10 L20 80 L40 80 L10 140 L35 140 L5 200 L115 200 L85 140 L110 140 L80 80 L100 80 Z" fill="#10b981" />
        <rect x="52" y="170" width="16" height="30" fill="#10b981" />
      </svg>

      <svg
        className="fixed bottom-0 right-0 pointer-events-none z-0"
        width="100"
        height="180"
        viewBox="0 0 100 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.04 }}
      >
        {/* Smaller pine tree */}
        <path d="M50 5 L15 70 L35 70 L5 130 L30 130 L0 180 L100 180 L70 130 L95 130 L65 70 L85 70 Z" fill="#10b981" />
        <rect x="42" y="155" width="16" height="25" fill="#10b981" />
      </svg>

      {/* Subtle dragonfly near top — small, mature, gamified */}
      <svg
        className="fixed pointer-events-none z-1"
        style={{ top: '15%', right: '8%', opacity: 0.06 }}
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Dragonfly body */}
        <line x1="16" y1="4" x2="16" y2="28" stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round" />
        {/* Wings */}
        <ellipse cx="10" cy="10" rx="6" ry="3" transform="rotate(-30 10 10)" fill="rgba(45, 212, 191, 0.3)" />
        <ellipse cx="22" cy="10" rx="6" ry="3" transform="rotate(30 22 10)" fill="rgba(45, 212, 191, 0.3)" />
        <ellipse cx="10" cy="16" rx="5" ry="2.5" transform="rotate(-20 10 16)" fill="rgba(45, 212, 191, 0.2)" />
        <ellipse cx="22" cy="16" rx="5" ry="2.5" transform="rotate(20 22 16)" fill="rgba(45, 212, 191, 0.2)" />
        {/* Head */}
        <circle cx="16" cy="4" r="2" fill="rgba(45, 212, 191, 0.4)" />
      </svg>

      {/* Small beetle near bottom-left */}
      <svg
        className="fixed pointer-events-none z-1"
        style={{ bottom: '20%', left: '5%', opacity: 0.05 }}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="10" cy="12" rx="5" ry="6" fill="rgba(16, 185, 129, 0.5)" />
        <line x1="10" y1="6" x2="10" y2="18" stroke="rgba(7, 26, 18, 0.6)" strokeWidth="0.5" />
        <circle cx="10" cy="7" r="2.5" fill="rgba(16, 185, 129, 0.4)" />
        {/* Antennae */}
        <line x1="8.5" y1="5" x2="6" y2="2" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="0.5" />
        <line x1="11.5" y1="5" x2="14" y2="2" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="0.5" />
      </svg>
    </>
  );
};

export default React.memo(ForestDecorations);
