import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';

/** Theme-aware color tokens for inline styles that can't use CSS variables directly. */
export const useThemeColors = () => {
  const { theme } = useTheme();

  return useMemo(() => {
    if (theme === 'lagoon') {
      return {
        accent: '#6FCF99',
        accentRgb: '111, 207, 153',
        accentSecondary: '#38BDF8',
        accentSecondaryRgb: '56, 189, 248',
        accentTertiary: '#FFD166',
        primary: '#091B2A',
        primaryRgb: '9, 27, 42',
        secondary: '#0F2537',
        secondaryRgb: '15, 37, 55',
        surface: '#152D42',
        surfaceRgb: '21, 45, 66',
        cardBg: 'rgba(15, 37, 55, 0.92)',
        cardBgSolid: 'rgba(15, 37, 55, 0.98)',
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
