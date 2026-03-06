import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Lagoon-theme ambient decorations: rising bubbles, water sparkles, shimmer edges,
 * horizon glow, sandy shore, and palm tree silhouettes. Only rendered when theme === 'lagoon'.
 * All elements are pointer-events: none and purely decorative.
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

      {/* Sandy shore gradient at bottom */}
      <div className="lagoon-shore" />

      {/* Bubbles — translucent circles that rise upward */}
      <div className="lagoon-bubble" style={{ left: '10%', top: '75%' }} />
      <div className="lagoon-bubble" style={{ left: '15%', top: '70%' }} />
      <div className="lagoon-bubble" style={{ left: '70%', top: '60%' }} />
      <div className="lagoon-bubble" style={{ left: '85%', top: '75%' }} />
      <div className="lagoon-bubble" style={{ left: '40%', top: '80%' }} />
      <div className="lagoon-bubble" style={{ left: '25%', top: '65%' }} />
      <div className="lagoon-bubble" style={{ left: '60%', top: '85%' }} />
      <div className="lagoon-bubble" style={{ left: '90%', top: '70%' }} />

      {/* Water sparkles — small light reflections that drift */}
      {[12, 35, 58, 80, 45].map((left, i) => (
        <div
          key={i}
          className="lagoon-sparkle"
          style={{ left: `${left}%`, top: '50%' }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Four-pointed star sparkle */}
            <path
              d="M12 2 L13.5 9 L20 10 L13.5 11.5 L12 20 L10.5 11.5 L4 10 L10.5 9 Z"
              fill="rgba(56, 189, 248, 0.35)"
            />
          </svg>
        </div>
      ))}

      {/* SVG palm tree silhouette — bottom left */}
      <svg
        className="fixed bottom-0 left-0 pointer-events-none z-0"
        width="130"
        height="220"
        viewBox="0 0 130 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.04 }}
      >
        {/* Palm trunk */}
        <path d="M55 220 Q58 160 65 120 Q68 100 62 80" stroke="#6FCF99" strokeWidth="6" fill="none" strokeLinecap="round" />
        {/* Fronds */}
        <path d="M62 80 Q30 50 10 60" stroke="#6FCF99" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M62 80 Q40 40 20 35" stroke="#6FCF99" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M62 80 Q70 30 55 15" stroke="#6FCF99" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M62 80 Q85 35 100 30" stroke="#6FCF99" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M62 80 Q90 55 110 55" stroke="#6FCF99" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Coconuts */}
        <circle cx="58" cy="82" r="3" fill="#6FCF99" />
        <circle cx="66" cy="79" r="3" fill="#6FCF99" />
      </svg>

      {/* Smaller palm tree — bottom right */}
      <svg
        className="fixed bottom-0 right-0 pointer-events-none z-0"
        width="100"
        height="180"
        viewBox="0 0 100 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.04 }}
      >
        {/* Trunk */}
        <path d="M55 180 Q52 130 48 100 Q45 85 50 65" stroke="#6FCF99" strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* Fronds */}
        <path d="M50 65 Q20 40 5 50" stroke="#6FCF99" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M50 65 Q30 25 15 20" stroke="#6FCF99" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M50 65 Q55 20 45 5" stroke="#6FCF99" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M50 65 Q75 30 88 28" stroke="#6FCF99" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M50 65 Q80 50 95 48" stroke="#6FCF99" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>

      {/* Subtle tropical fish near top-right */}
      <svg
        className="fixed pointer-events-none z-1"
        style={{ top: '15%', right: '8%', opacity: 0.05 }}
        width="36"
        height="24"
        viewBox="0 0 36 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Fish body */}
        <ellipse cx="18" cy="12" rx="12" ry="7" fill="rgba(56, 189, 248, 0.35)" />
        {/* Tail */}
        <path d="M30 12 L36 6 L36 18 Z" fill="rgba(111, 207, 153, 0.3)" />
        {/* Eye */}
        <circle cx="12" cy="10" r="1.5" fill="rgba(255, 209, 102, 0.5)" />
        {/* Stripe */}
        <path d="M16 5 Q18 12 16 19" stroke="rgba(111, 207, 153, 0.2)" strokeWidth="1" fill="none" />
      </svg>

      {/* Small seashell near bottom-left */}
      <svg
        className="fixed pointer-events-none z-1"
        style={{ bottom: '18%', left: '5%', opacity: 0.05 }}
        width="22"
        height="20"
        viewBox="0 0 22 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shell spiral */}
        <path d="M11 2 Q18 4 19 10 Q20 16 14 18 Q8 20 4 16 Q1 12 3 8 Q5 4 11 2 Z" fill="rgba(255, 209, 102, 0.3)" />
        <path d="M11 4 Q16 6 16 10 Q16 14 12 16" stroke="rgba(255, 209, 102, 0.2)" strokeWidth="0.5" fill="none" />
        <path d="M11 6 Q14 7 14 10 Q14 13 11 14" stroke="rgba(255, 209, 102, 0.15)" strokeWidth="0.5" fill="none" />
      </svg>
    </>
  );
};

export default React.memo(LagoonDecorations);
