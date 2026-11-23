import { useColorScheme } from 'react-native';

export type Theme = {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primarySoft: string;
  onPrimary: string;
  accent: string;
  success: string;
  danger: string;
  shadow: string;
  overlay: string;
};

const light: Theme = {
  background: '#F5F6FB',
  surface: '#FFFFFF',
  surfaceAlt: '#EFF1F8',
  text: '#171A33',
  textMuted: '#6A708C',
  border: '#E2E5F0',
  primary: '#5B4FE9',
  primarySoft: '#EDEBFF',
  onPrimary: '#FFFFFF',
  accent: '#FF6B5A',
  success: '#189774',
  danger: '#D64550',
  shadow: '#1D1F45',
  overlay: 'rgba(23, 26, 51, 0.45)',
};

const dark: Theme = {
  background: '#0E1020',
  surface: '#191C31',
  surfaceAlt: '#232741',
  text: '#F4F5FF',
  textMuted: '#A2A8C8',
  border: '#30354F',
  primary: '#9A8EFF',
  primarySoft: '#2A2750',
  onPrimary: '#12132A',
  accent: '#FF8A7A',
  success: '#4ED6AE',
  danger: '#FF7B85',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

export const palettes = { light, dark };

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}

export const radius = { sm: 8, md: 14, lg: 20, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
