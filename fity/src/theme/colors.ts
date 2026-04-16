export const colors = {
  LIME: '#E8FF6B',
  DARK: '#0D0D0D',
  DARK2: '#161616',
  DARK3: '#1E1E1E',
  GRAY: '#2A2A2A',
  GRAY2: '#3A3A3A',
  MUTED: '#777777',
  WHITE: '#FFFFFF',
  TEXT: '#FFFFFF',
} as const;

export type ColorKey = keyof typeof colors;
