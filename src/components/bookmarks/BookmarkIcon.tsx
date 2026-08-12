import React, { useContext } from 'react';

import { hasNamedIcon, Icon, type IconProps } from '../../config';
import { SettingsContext } from '../../SettingsProvider';
import { HEADER_RIGHT_ICON_STROKE_WIDTH } from '../headerIconConfig';

type BookmarkIconName = Exclude<keyof typeof Icon, 'NamedIcon'>;

export type BookmarkIconConfiguration =
  | string
  | {
      activeIconName?: string;
      default?: string;
      iconName?: string;
      selected?: string;
    };

export type ResolvedBookmarkIconConfiguration = {
  activeIconName: string;
  iconName: string;
};

const DEFAULT_BOOKMARK_ICONS: ResolvedBookmarkIconConfiguration = {
  activeIconName: 'HeartFilled',
  iconName: 'HeartEmpty'
};

const BOOKMARK_ICON_PRESETS: Record<string, ResolvedBookmarkIconConfiguration> = {
  bookmark: { activeIconName: 'BookmarkFilled', iconName: 'BookmarkEmpty' },
  heart: DEFAULT_BOOKMARK_ICONS
};

const registryIconName = (value: unknown): BookmarkIconName | undefined =>
  typeof value === 'string' &&
  value !== 'NamedIcon' &&
  typeof Icon[value as keyof typeof Icon] === 'function'
    ? (value as BookmarkIconName)
    : undefined;

const validIconName = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;

  const name = value.trim();

  return registryIconName(name) || (hasNamedIcon(name) ? name : undefined);
};

const resolveStringConfiguration = (value: string): ResolvedBookmarkIconConfiguration => {
  const normalizedValue = value.trim();
  const preset = BOOKMARK_ICON_PRESETS[normalizedValue.toLowerCase()];

  if (preset) return preset;

  const iconName = validIconName(normalizedValue);

  return iconName ? { activeIconName: iconName, iconName } : DEFAULT_BOOKMARK_ICONS;
};

const resolveObjectConfiguration = (
  iconConfiguration: Record<string, unknown>
): ResolvedBookmarkIconConfiguration => {
  const iconName =
    validIconName(iconConfiguration.iconName) ?? validIconName(iconConfiguration.default);
  const activeIconName =
    validIconName(iconConfiguration.activeIconName) ?? validIconName(iconConfiguration.selected);

  if (!iconName && !activeIconName) return DEFAULT_BOOKMARK_ICONS;

  const fallbackIconName = iconName ?? activeIconName ?? DEFAULT_BOOKMARK_ICONS.iconName;

  return {
    activeIconName: activeIconName ?? fallbackIconName,
    iconName: fallbackIconName
  };
};

export const resolveBookmarkIconConfiguration = (
  configuration?: unknown
): ResolvedBookmarkIconConfiguration => {
  if (typeof configuration === 'string') return resolveStringConfiguration(configuration);

  if (configuration && typeof configuration === 'object' && !Array.isArray(configuration))
    return resolveObjectConfiguration(configuration as Record<string, unknown>);

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
  const selectedRegistryIconName = registryIconName(selectedIconName);
  const SelectedIcon = selectedRegistryIconName
    ? (Icon[selectedRegistryIconName] as React.ComponentType<IconProps>)
    : undefined;

  const iconProps = {
    ...props,
    hasNoHitSlop: true,
    strokeWidth: strokeWidth ?? HEADER_RIGHT_ICON_STROKE_WIDTH
  };

  return SelectedIcon ? (
    <SelectedIcon {...iconProps} />
  ) : (
    <Icon.NamedIcon {...iconProps} name={selectedIconName} />
  );
};
