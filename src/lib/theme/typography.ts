/**
 * Linear Design System - Typography System
 * Inter Variable font configuration with Linear-specific weights and sizes
 */

export const typography = {
  fontFamily: {
    primary:
      '"Inter Variable", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
  },
  fontSize: {
    xs: '10px',
    sm: '13px',
    base: '14px',
    md: '15px',
    lg: '16px',
    xl: '17px',
    '2xl': '21px',
    '3xl': '24px',
    '4xl': '40px',
    '5xl': '56px',
  },
  fontWeight: {
    normal: 400,
    medium: 510,
    semibold: 538,
  },
  lineHeight: {
    tight: '19.5px',
    normal: '24px',
    relaxed: '32px',
    loose: '44px',
  },
} as const;

export type TypographyScale = typeof typography;
export type FontSizeKey = keyof typeof typography.fontSize;
export type FontWeightKey = keyof typeof typography.fontWeight;
