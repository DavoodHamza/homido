import { View, StyleSheet, type ViewProps } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

export type CardProps = ViewProps & {
  padding?: 'none' | 'sm' | 'md' | 'lg';
};

export function Card({ style, padding = 'md', children, ...rest }: CardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.background,
          borderColor: theme.border,
        },
        styles[`padding-${padding}`],
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  'padding-none': { padding: 0 },
  'padding-sm': { padding: 8 },
  'padding-md': { padding: 16 },
  'padding-lg': { padding: 24 },
});
