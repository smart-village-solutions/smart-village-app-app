import React, { useContext } from 'react';

import { Icon, type IconProps } from '../../config';
import { SettingsContext } from '../../SettingsProvider';
import { HEADER_RIGHT_ICON_STROKE_WIDTH } from '../headerIconConfig';

type BookmarkIconName = Exclude<keyof typeof Icon, 'NamedIcon'>;

export type BookmarkIconConfiguration =
  | string
  | {
      activeIconName?: string;
      iconName?: string;
    };

export type ResolvedBookmarkIconConfiguration = {
  activeIconName: BookmarkIconName;
  iconName: BookmarkIconName;
};

const DEFAULT_BOOKMARK_ICONS: ResolvedBookmarkIconConfiguration = {
  activeIconName: 'HeartFilled',
  iconName: 'HeartEmpty'
};

const BOOKMARK_ICON_PRESETS: Record<string, ResolvedBookmarkIconConfiguration> = {
  bookmark: { activeIconName: 'BookmarkFilled', iconName: 'BookmarkEmpty' },
  heart: DEFAULT_BOOKMARK_ICONS
};

const validIconName = (value: unknown): BookmarkIconName | undefined =>
  typeof value === 'string' &&
  value !== 'NamedIcon' &&
  typeof Icon[value as keyof typeof Icon] === 'function'
    ? (value as BookmarkIconName)
    : undefined;

export const resolveBookmarkIconConfiguration = (
  configuration?: unknown
): ResolvedBookmarkIconConfiguration => {
  if (typeof configuration === 'string') {
    const value = configuration.trim();
    const preset = BOOKMARK_ICON_PRESETS[value.toLowerCase()];

    if (preset) return preset;

    const iconName = validIconName(value);

    return iconName ? { activeIconName: iconName, iconName } : DEFAULT_BOOKMARK_ICONS;
  }

  if (configuration && typeof configuration === 'object' && !Array.isArray(configuration)) {
    const iconConfiguration = configuration as Record<string, unknown>;
    const iconName = validIconName(iconConfiguration.iconName);
    const activeIconName = validIconName(iconConfiguration.activeIconName);

    if (iconName) return { activeIconName: activeIconName ?? iconName, iconName };
    if (activeIconName) return { activeIconName, iconName: activeIconName };
  }

  return DEFAULT_BOOKMARK_ICONS;
};

type Props = IconProps & {
  selected?: boolean;
};

export const ConfiguredBookmarkIcon = ({ selected = false, strokeWidth, ...props }: Props) => {
  const configuredIcon = (
    useContext(SettingsContext).globalSettings?.settings as
      | { bookmarkIcon?: BookmarkIconConfiguration }
      | undefined
  )?.bookmarkIcon;
  const iconConfiguration = resolveBookmarkIconConfiguration(configuredIcon);
  const selectedIconName = selected ? iconConfiguration.activeIconName : iconConfiguration.iconName;
  const SelectedIcon = Icon[selectedIconName] as React.ComponentType<IconProps>;

  return (
    <SelectedIcon
      {...props}
      hasNoHitSlop
      strokeWidth={strokeWidth ?? HEADER_RIGHT_ICON_STROKE_WIDTH}
    />
  );
};
