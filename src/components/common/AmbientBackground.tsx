import React from 'react';
import { useTheme } from '../../context/ThemeContext';

type Variant = 'default' | 'home' | 'editor' | 'leaderboard' | 'login' | 'study';

interface AmbientBackgroundProps {
  variant?: Variant;
  showHexGrid?: boolean;
  hexGridOpacity?: number;
}

/**
 * GPU-composited ambient background using radial-gradient instead of filter: blur().
 * Replaces per-page blur blob divs that caused Safari GPU strain.
 * Uses position: fixed + translateZ(0) for compositor-layer promotion.
 */
const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  variant = 'default',
  showHexGrid = false,
  hexGridOpacity = 0.01,
}) => {
  const { theme } = useTheme();

  const gradients = getGradients(variant, theme);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          background: gradients,
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
        }}
      />
      {showHexGrid && (
        <div
          className="study-hex-grid"
          style={{ opacity: hexGridOpacity }}
        />
      )}
    </div>
  );
};

function getGradients(variant: Variant, theme: string): string {
  const isCrimson = theme === 'crimson';

  // Theme-aware colors
  const accent = isCrimson ? 'rgba(244, 91, 105,' : 'rgba(111, 207, 153,';
  const accentSecondary = isCrimson ? 'rgba(0, 212, 255,' : 'rgba(56, 189, 248,';
  const accentTertiary = isCrimson ? 'rgba(251, 191, 36,' : 'rgba(255, 209, 102,';
  const purple = 'rgba(168, 85, 247,';

  switch (variant) {
    case 'home':
      return [
        `radial-gradient(ellipse 600px 600px at 20% 15%, ${accent} 0.06) 0%, transparent 70%)`,
        `radial-gradient(ellipse 500px 500px at 85% 85%, ${accentSecondary} 0.05) 0%, transparent 70%)`,
        `radial-gradient(ellipse 400px 400px at 50% 60%, ${accentTertiary} 0.03) 0%, transparent 70%)`,
      ].join(', ');

    case 'editor':
      return [
        `radial-gradient(ellipse 600px 600px at -5% -5%, ${accent} 0.03) 0%, transparent 70%)`,
        `radial-gradient(ellipse 500px 500px at 105% 105%, ${accentSecondary} 0.02) 0%, transparent 70%)`,
      ].join(', ');

    case 'leaderboard':
      return [
        `radial-gradient(ellipse 500px 500px at 15% 10%, ${accentTertiary} 0.03) 0%, transparent 70%)`,
        `radial-gradient(ellipse 400px 400px at 90% 80%, ${accent} 0.03) 0%, transparent 70%)`,
      ].join(', ');

    case 'login':
      return [
        `radial-gradient(ellipse 600px 600px at 25% 25%, ${accent} 0.05) 0%, transparent 70%)`,
        `radial-gradient(ellipse 500px 500px at 75% 75%, ${accentSecondary} 0.04) 0%, transparent 70%)`,
        `radial-gradient(ellipse 400px 400px at 50% 50%, ${purple} 0.03) 0%, transparent 70%)`,
      ].join(', ');

    case 'study':
      return [
        `radial-gradient(ellipse 800px 400px at 50% 0%, ${accent} 0.04) 0%, transparent 70%)`,
        `radial-gradient(ellipse 300px 300px at 100% 100%, ${accentSecondary} 0.03) 0%, transparent 70%)`,
      ].join(', ');

    default:
      return [
        `radial-gradient(ellipse 500px 500px at 10% 10%, ${accent} 0.04) 0%, transparent 70%)`,
        `radial-gradient(ellipse 400px 400px at 90% 85%, ${accentSecondary} 0.03) 0%, transparent 70%)`,
      ].join(', ');
  }
}

export default React.memo(AmbientBackground);
