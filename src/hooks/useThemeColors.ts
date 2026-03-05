import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';

/** Theme-aware color tokens for inline styles that can't use CSS variables directly. */
export const useThemeColors = () => {
  const { theme } = useTheme();

  return useMemo(() => {
    if (theme === 'forest') {
      return {
        accent: '#10b981',
        accentRgb: '16, 185, 129',
        accentSecondary: '#2dd4bf',
        accentSecondaryRgb: '45, 212, 191',
        accentTertiary: '#d4a72c',
        primary: '#071a12',
        primaryRgb: '7, 26, 18',
        secondary: '#0d2418',
        secondaryRgb: '13, 36, 24',
        surface: '#12301f',
        surfaceRgb: '18, 48, 31',
        cardBg: 'rgba(13, 36, 24, 0.92)',
        cardBgSolid: 'rgba(13, 36, 24, 0.98)',
      };
    }
    return {
      accent: '#f45b69',
      accentRgb: '244, 91, 105',
      accentSecondary: '#00d4ff',
      accentSecondaryRgb: '0, 212, 255',
      accentTertiary: '#fbbf24',
      primary: '#120a0a',
      primaryRgb: '18, 10, 10',
      secondary: '#1e1212',
      secondaryRgb: '30, 18, 18',
      surface: '#261818',
      surfaceRgb: '38, 24, 24',
      cardBg: 'rgba(30, 18, 18, 0.92)',
      cardBgSolid: 'rgba(30, 18, 18, 0.98)',
    };
  }, [theme]);
};
