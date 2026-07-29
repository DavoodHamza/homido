/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    primary: '#4A6D50', // Premium Rich Sage
    background: '#F9F9F9', // Crisp modern off-white
    card: '#FFFFFF', // Pure white for cards to pop
    text: '#1A1A1A', // Sharp dark contrast
    textSecondary: '#8E8E93', // Clean gray
    accent: '#4A6D50',
    border: '#E5E5EA', // Subtle borders
    error: '#FF3B30',
    success: '#34C759',
  },
  dark: {
    primary: '#668C6D', // Lighter sage for dark mode
    background: '#121212', // Standard deep dark mode
    card: '#1C1C1E', // Elevated dark card
    text: '#FFFFFF',
    textSecondary: '#98989D',
    accent: '#668C6D',
    border: '#2C2C2E',
    error: '#FF453A',
    success: '#32D74B',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
