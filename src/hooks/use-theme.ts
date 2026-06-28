import { Colors } from '@/constants/theme';
import { useThemeStore } from '@/hooks/useThemeStore';

export function useTheme() {
  const { themeMode } = useThemeStore();
  return Colors[themeMode];
}
