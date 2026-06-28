import { Pressable, Text, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { ThemeColor } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = PressableProps & {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
  color?: ThemeColor;
};

export function Button({ title, variant = 'primary', size = 'md', style, color, ...rest }: ButtonProps) {
  const theme = useTheme();

  const getBackgroundColor = (pressed: boolean) => {
    switch (variant) {
      case 'primary':
        return pressed ? theme.primary + 'CC' : theme.primary;
      case 'secondary':
        return pressed ? theme.card + 'CC' : theme.card;
      case 'outline':
      case 'ghost':
        return pressed ? theme.card : 'transparent';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'secondary':
        return theme.text;
      case 'outline':
      case 'ghost':
        return theme.primary;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') return theme.primary;
    return 'transparent';
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[size],
        {
          backgroundColor: getBackgroundColor(pressed),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
        },
        style,
      ]}
      {...rest}
    >
      <Text
        style={[
          styles.textBase,
          styles[`${size}Text`],
          { color: getTextColor() },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  md: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  lg: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  textBase: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smText: {
    fontSize: 14,
  },
  mdText: {
    fontSize: 16,
  },
  lgText: {
    fontSize: 18,
  },
});
