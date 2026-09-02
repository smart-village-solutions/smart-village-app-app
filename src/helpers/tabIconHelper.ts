import type { ResolvedThemeMode, TabIconConfiguration } from '../types';

export type ResolvedTabIconSource = {
  type: 'image' | 'named' | 'svg';
  value: string;
};

const normalizeIconValue = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

const resolveIconSource = ({
  icon,
  iconName,
  svg
}: {
  icon?: string;
  iconName?: string;
  svg?: string;
}): ResolvedTabIconSource | undefined => {
  const namedIcon = normalizeIconValue(iconName);
  const svgIcon = normalizeIconValue(svg);
  const imageIcon = normalizeIconValue(icon);

  if (namedIcon) return { type: 'named', value: namedIcon };
  if (svgIcon) return { type: 'svg', value: svgIcon };
  if (imageIcon) return { type: 'image', value: imageIcon };
};

export const resolveTabIconSource = (
  configuration: TabIconConfiguration,
  focused: boolean,
  themeMode?: ResolvedThemeMode
): ResolvedTabIconSource | undefined => {
  const themedImages = themeMode ? configuration.themeImages?.[themeMode] : undefined;
  const themedIcon = normalizeIconValue(themedImages?.icon);
  const themedActiveIcon = normalizeIconValue(themedImages?.activeIcon);
  const regularSource = resolveIconSource({
    icon: themedIcon || configuration.icon,
    iconName: configuration.iconName,
    svg: configuration.svg
  });
  const activeImage =
    themedActiveIcon ||
    (themedIcon && regularSource?.type === 'image' ? themedIcon : configuration.activeIcon);
  const activeSource = focused
    ? resolveIconSource({
        icon: activeImage,
        iconName: configuration.activeIconName,
        svg: configuration.activeSvg
      })
    : undefined;

  return activeSource || regularSource;
};
