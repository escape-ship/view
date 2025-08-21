/**
 * Linear Design System - Theme Index
 * Central export for all theme utilities and configurations
 */

export { colors, type ColorScale, type ColorKey } from './colors';
export {
  typography,
  type TypographyScale,
  type FontSizeKey,
  type FontWeightKey,
} from './typography';
export {
  spacing,
  borderRadius,
  type SpacingScale,
  type SpacingKey,
  type BorderRadiusKey,
} from './spacing';
export {
  animations,
  shadows,
  type AnimationScale,
  type TransitionKey,
  type ShadowKey,
} from './animations';

// Component-specific theme configurations from theme_data.json
export const components = {
  button: {
    primary: {
      backgroundColor: '#141516',
      color: '#F7F8F8',
      borderRadius: '30px',
      padding: '16px 24px',
      fontSize: '16px',
      fontWeight: 400,
      border: 'none',
    },
    secondary: {
      backgroundColor: 'rgba(0, 0, 0, 0)',
      color: '#8A8F98',
      borderRadius: '8px',
      padding: '0px 12px',
      fontSize: '13px',
      fontWeight: 510,
      border: 'none',
    },
    outline: {
      backgroundColor: '#28282C',
      color: '#F7F8F8',
      borderRadius: '9999px',
      padding: '0px 16px',
      fontSize: '15px',
      fontWeight: 510,
      border: '1px solid #3E3E44',
    },
  },
  card: {
    default: {
      backgroundColor: 'rgba(40, 40, 40, 0.2)',
      borderRadius: '16px',
      padding: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: 'none',
    },
    elevated: {
      backgroundColor: '#0F1011',
      borderRadius: '30px',
      padding: '32px 24px',
      border: 'none',
      boxShadow: 'none',
    },
  },
} as const;

// Design principles from Linear
export const designPrinciples = {
  focus: 'relentless focus',
  execution: 'fast execution',
  craft: 'commitment to quality of craft',
  simplicity: 'purposeful minimalism',
  performance: 'obsessive focus on speed',
} as const;

// Layout configuration
export const layout = {
  container: {
    maxWidth: '1200px',
    padding: '0 24px',
  },
  section: {
    paddingY: '96px',
  },
  navigation: {
    height: '72px',
    padding: '0 32px',
  },
} as const;
