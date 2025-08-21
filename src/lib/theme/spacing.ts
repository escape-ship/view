/**
 * Linear Design System - Spacing System
 * 8px-based spacing scale for consistent layout
 */

export const spacing = {
  xs: '2px',
  sm: '4px',
  base: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '48px',
  '5xl': '56px',
  '6xl': '64px',
  '7xl': '72px',
  '8xl': '96px',
  '9xl': '160px',
} as const;

export const borderRadius = {
  none: '0px',
  xs: '1px',
  sm: '4px',
  base: '6px',
  md: '8px',
  lg: '10px',
  xl: '16px',
  '2xl': '18px',
  '3xl': '30px',
  full: '9999px',
  circle: '50%',
} as const;

export type SpacingScale = typeof spacing;
export type SpacingKey = keyof SpacingScale;
export type BorderRadiusKey = keyof typeof borderRadius;
