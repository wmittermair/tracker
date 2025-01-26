import { DefaultTheme } from '@react-navigation/native';

export const COLORS = {
  primary: '#6C5CE7',
  secondary: '#A8A4FF',
  accent: '#00D2D3',
  background: '#FFFFFF',
  card: '#F9F9F9',
  text: '#2D3436',
  textSecondary: '#636E72',
  border: '#DFE6E9',
  success: '#00B894',
  error: '#FF7675',
  warning: '#FFEAA7',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const FONT = {
  regular: {
    fontFamily: 'System',
    fontWeight: '400' as const,
  },
  medium: {
    fontFamily: 'System',
    fontWeight: '600' as const,
  },
  bold: {
    fontFamily: 'System',
    fontWeight: '700' as const,
  },
};

export const TYPOGRAPHY = {
  h1: {
    ...FONT.bold,
    fontSize: 32,
    lineHeight: 40,
  },
  h2: {
    ...FONT.bold,
    fontSize: 24,
    lineHeight: 32,
  },
  h3: {
    ...FONT.medium,
    fontSize: 20,
    lineHeight: 28,
  },
  body: {
    ...FONT.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    ...FONT.regular,
    fontSize: 14,
    lineHeight: 20,
  },
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...COLORS,
  },
  spacing: SPACING,
  typography: TYPOGRAPHY,
}; 