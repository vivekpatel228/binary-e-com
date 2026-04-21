export const colors = {
  primary: '#1C1C1E',
  secondary: '#87988A',
  tertiary: '#D2C5B3',
  natural: '#F8F9FA',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  success: '#2E7D32',
  danger: '#C62828',
  warning: '#ED6C02',

  muted: 'rgba(28, 28, 30, 0.6)',
  border: 'rgba(28, 28, 30, 0.12)',
  overlay: 'rgba(28, 28, 30, 0.45)',
} as const;

export type AppColors = typeof colors;
