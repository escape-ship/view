/**
 * Linear Design System - Color System
 * Extracted from theme_data.json and optimized for TypeScript
 */

export const colors = {
  primary: {
    main: '#5E6AD2',
    light: '#94A3FF',
    dark: '#4C59BD',
  },
  neutral: {
    50: '#F7F8F8',
    100: '#E6E6E6',
    200: '#D0D2D8',
    300: '#8A8F98',
    400: '#626269',
    500: '#282828',
    600: '#1E1F16',
    700: '#141516',
    800: '#0F1011',
    900: '#08090A',
  },
  background: {
    primary: '#F7F8F8',
    secondary: '#FFFFFF',
    tertiary: 'rgba(40, 40, 40, 0.2)',
    dark: '#0F1011',
    overlay: 'rgba(10, 10, 10, 0.8)',
  },
  text: {
    primary: '#08090A',
    secondary: '#626269',
    tertiary: '#8A8F98',
    inverse: '#F7F8F8',
    muted: 'rgba(255, 255, 255, 0.7)',
  },
  status: {
    success: '#68CC58',
    warning: '#F2994A',
    error: '#C52828',
    info: '#02B8CC',
    progress: '#67719D',
  },
  accent: {
    purple: '#B59AFF',
    blue: '#5E6AD2',
    green: '#2C901C',
    yellow: '#DEB549',
    orange: '#F2994A',
  },
} as const;

export type ColorScale = typeof colors;
export type ColorKey = keyof ColorScale;
