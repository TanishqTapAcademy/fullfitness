import { Easing } from 'react-native-reanimated';

/**
 * Single source of truth for motion timings, easings, staggers, and springs.
 * Every component should import from here instead of hardcoding magic numbers.
 */

export const DURATION = {
  fast: 200,
  base: 320,
  slow: 500,
  hero: 800,
} as const;

export const EASING_OUT_CUBIC = Easing.out(Easing.cubic);
export const EASING_OUT_QUAD = Easing.out(Easing.quad);
export const EASING_IN_OUT = Easing.inOut(Easing.cubic);

export const STAGGER = {
  tight: 60,
  normal: 80,
  loose: 120,
} as const;

export const SPRING_BOUNCE = {
  damping: 8,
  stiffness: 120,
  mass: 0.6,
} as const;

export const SPRING_SOFT = {
  damping: 16,
  stiffness: 160,
  mass: 0.8,
} as const;
