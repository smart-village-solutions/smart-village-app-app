import React from 'react';
import { StatusBar } from 'react-native';
import type { StatusBarProps, StatusBarStyle } from 'react-native';

import { getContrastRatio } from '../helpers/themeHelper';
import { useTheme } from '../hooks/useTheme';

const BLACK = '#000000';
const WHITE = '#FFFFFF';

export type AppStatusBarProps = Omit<StatusBarProps, 'backgroundColor'> & {
  /** The color rendered behind the status bar. It is also used to calculate icon contrast. */
  backgroundColor?: string;
};

export const resolveStatusBarStyle = (
  backgroundColor: string,
  fallbackStyle: StatusBarStyle
): StatusBarStyle => {
  const darkContentContrast = getContrastRatio(BLACK, backgroundColor);
  const lightContentContrast = getContrastRatio(WHITE, backgroundColor);

  if (darkContentContrast === undefined || lightContentContrast === undefined) {
    return fallbackStyle;
  }

  return darkContentContrast >= lightContentContrast ? 'dark-content' : 'light-content';
};

/**
 * Chooses readable status-bar content from the actual surface color.
 * A caller can still pass `barStyle` for branded, image-based or otherwise custom surfaces.
 */
export const AppStatusBar = ({
  animated = true,
  backgroundColor: backgroundColorProp,
  barStyle,
  translucent = true,
  ...props
}: AppStatusBarProps) => {
  const { colors, isDark } = useTheme();
  const backgroundColor = backgroundColorProp ?? colors.background;
  const fallbackStyle = isDark ? 'light-content' : 'dark-content';
  const resolvedBarStyle = barStyle || resolveStatusBarStyle(backgroundColor, fallbackStyle);

  return (
    <StatusBar
      {...props}
      animated={animated}
      backgroundColor={translucent ? 'transparent' : backgroundColor}
      barStyle={resolvedBarStyle}
      translucent={translucent}
    />
  );
};
