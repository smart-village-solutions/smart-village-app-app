import { Image as ExpoImage } from 'expo-image';
import React, { useState } from 'react';
import { ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import type { ColorValue } from 'react-native';

import { Icon, IconProps, IconUrl, normalize } from '../config';
import { resolveTabIconSource } from '../helpers/tabIconHelper';
import { resolveTabIconColors } from '../helpers/tabNavigationHelper';
import type { IconLibrary } from '../IconProvider';
import type { ResolvedThemeMode, TabIconConfiguration, ThemeColorPalette } from '../types';

import { OrientationAwareIcon } from './OrientationAwareIcon';

type RemoteIconProps = IconProps & { iconName?: string };
type TabIconComponent = (props: IconProps) => React.JSX.Element;

const NamedTabIcon = (props: IconProps) => {
  const { iconName, ...iconProps } = props as RemoteIconProps;

  return <Icon.NamedIcon {...iconProps} name={iconName || 'question-mark'} />;
};

const resolveNamedIcon = (name: string): TabIconComponent => {
  const SelectedIcon = Icon[name as keyof typeof Icon];

  return SelectedIcon && SelectedIcon !== Icon.NamedIcon
    ? (SelectedIcon as TabIconComponent)
    : NamedTabIcon;
};

const RemoteIconFallback = ({
  color,
  fillColor,
  iconStyle,
  size = normalize(24),
  strokeColor,
  strokeWidth,
  style
}: IconProps) => (
  <Icon.NamedIcon
    color={color}
    fillColor={fillColor}
    hasNoHitSlop
    iconStyle={iconStyle}
    name="photo-off"
    size={size}
    strokeColor={strokeColor}
    strokeWidth={strokeWidth}
    style={style}
  />
);

const RemoteImageIcon = ({
  color,
  fillColor,
  iconName,
  iconStyle,
  size = normalize(24),
  strokeColor,
  strokeWidth,
  style
}: RemoteIconProps) => {
  const [failedUri, setFailedUri] = useState<string>();

  if (!iconName || failedUri === iconName) {
    return (
      <RemoteIconFallback
        color={color}
        fillColor={fillColor}
        iconStyle={iconStyle}
        size={size}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        style={style}
      />
    );
  }

  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={style}
    >
      <ExpoImage
        accessible={false}
        cachePolicy="memory-disk"
        contentFit="contain"
        onError={() => setFailedUri(iconName)}
        source={{ uri: iconName }}
        style={[{ height: size, width: size }, iconStyle as StyleProp<ImageStyle>]}
      />
    </View>
  );
};

const RemoteSvgIcon = ({
  color,
  fillColor,
  iconName,
  iconStyle,
  size = normalize(24),
  strokeColor,
  strokeWidth,
  style
}: RemoteIconProps) => (
  <IconUrl
    color={color}
    fallback={
      <RemoteIconFallback
        color={color}
        fillColor={fillColor}
        iconStyle={iconStyle}
        size={size}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
      />
    }
    fillColor={fillColor}
    iconName={iconName || ''}
    iconStyle={iconStyle}
    isMonochrome
    size={size}
    strokeColor={strokeColor}
    strokeWidth={strokeWidth}
    style={style}
  />
);

type TabBarIconProps = TabIconConfiguration & {
  color: ColorValue;
  focused: boolean;
  iconLandscapeStyle?: StyleProp<ViewStyle>;
  iconSet?: IconLibrary;
  iconSize?: number;
  iconStyle?: StyleProp<ViewStyle>;
  isHighlightedTab?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  tabBarIconFillOnFocus?: boolean;
  themeColors: ThemeColorPalette;
  themeMode: ResolvedThemeMode;
};

export const TabBarIcon = ({
  activeIcon,
  activeIconName,
  activeSvg,
  color,
  focused,
  icon,
  iconLandscapeStyle,
  iconName,
  iconSet,
  iconSize = 24,
  iconStyle,
  isHighlightedTab = false,
  strokeColor,
  strokeWidth,
  svg,
  tabBarIconFillOnFocus = false,
  themeColors,
  themeImages,
  themeMode
}: TabBarIconProps) => {
  const source = resolveTabIconSource(
    { activeIcon, activeIconName, activeSvg, icon, iconName, svg, themeImages },
    focused,
    themeMode
  );
  const resolvedSource = source || { type: 'named' as const, value: 'question-mark' };
  const SelectedIcon: TabIconComponent =
    resolvedSource.type === 'named'
      ? resolveNamedIcon(resolvedSource.value)
      : resolvedSource.type === 'svg'
      ? RemoteSvgIcon
      : RemoteImageIcon;
  const tintColor = typeof color === 'string' ? color : themeColors.primary;
  const resolvedIconColors = isHighlightedTab
    ? {
        color: themeColors.surface,
        fillColor: themeColors.surface,
        strokeColor: themeColors.surface
      }
    : resolveTabIconColors(focused, tintColor, tabBarIconFillOnFocus, strokeColor);
  const iconComponent = (
    <OrientationAwareIcon
      {...resolvedIconColors}
      Icon={SelectedIcon}
      iconName={resolvedSource.value}
      iconSet={iconSet}
      landscapeStyle={iconLandscapeStyle}
      size={normalize(isHighlightedTab ? 28 : iconSize)}
      strokeWidth={strokeWidth}
      style={iconStyle}
    />
  );

  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={
        isHighlightedTab
          ? [styles.highlightedIconWrapper, { backgroundColor: themeColors.primary }]
          : undefined
      }
    >
      {iconComponent}
    </View>
  );
};

const styles = StyleSheet.create({
  highlightedIconWrapper: {
    alignItems: 'center',
    borderRadius: normalize(28),
    height: normalize(56),
    justifyContent: 'center',
    marginTop: -normalize(14),
    width: normalize(56)
  }
});
