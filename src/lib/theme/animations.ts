/**
 * Linear Design System - Animation System
 * Linear-style transitions and easing functions
 */

export const animations = {
  transitions: {
    fast: '0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    normal: '0.16s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    slow: '0.24s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    verySlow: '0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  easings: {
    easeOut: 'ease-out',
    easeInOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    spring: 'cubic-bezier(0.85, 0, 0.15, 1)',
  },
} as const;

export const shadows = {
  sm: 'rgba(0, 0, 0, 0.04) 0px 3px 2px 0px, rgba(0, 0, 0, 0.07) 0px 1px 1px 0px, rgba(0, 0, 0, 0.08) 0px 0px 1px 0px',
  md: 'rgba(0, 0, 0, 0.2) 0px 4px 24px 0px',
  lg: 'rgba(0, 0, 0, 0.35) 0px 7px 32px 0px',
  inset:
    'rgba(255, 255, 255, 0.04) 0px 1.503px 5.261px 0px inset, rgba(255, 255, 255, 0.1) 0px -0.752px 0.752px 0px inset',
  complex:
    'rgba(255, 255, 255, 0.14) 0px -2.75px 4.75px 0px inset, rgba(255, 255, 255, 0.1) 0px -0.752px 0.752px 0px inset, rgba(0, 0, 0, 0.5) 0px 54px 73px 3px',
} as const;

export type AnimationScale = typeof animations;
export type TransitionKey = keyof typeof animations.transitions;
export type ShadowKey = keyof typeof shadows;
