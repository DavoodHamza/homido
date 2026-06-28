import { Text, type TextProps } from 'react-native';

import { ThemeColor } from '@/constants/theme';
import { Typography } from '@/constants/typography';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'hero' | 'title' | 'subtitle' | 'h3' | 'small' | 'smallBold' | 'label' | 'stat' | 'bigStat' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

const typeMap = {
  default: Typography.body,
  hero: Typography.hero,
  title: Typography.h1,
  subtitle: Typography.h2,
  h3: Typography.h3,
  small: Typography.caption,
  smallBold: Typography.captionBold,
  label: Typography.label,
  stat: Typography.stat,
  bigStat: Typography.bigStat,
  link: Typography.caption,
  linkPrimary: Typography.caption,
  code: Typography.code,
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        typeMap[type],
        type === 'linkPrimary' && { color: theme.primary },
        style,
      ]}
      {...rest}
    />
  );
}
