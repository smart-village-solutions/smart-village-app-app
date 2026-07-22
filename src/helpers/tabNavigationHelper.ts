import type { ResolvedThemeMode, TabBarColorConfig, TabNavigationStaticContent } from '../types';

const COLOR_KEYS: Array<keyof TabBarColorConfig> = [
  'activeBackgroundColor',
  'activeTintColor',
  'inactiveBackgroundColor',
  'inactiveTintColor'
];

const getValidColors = (values?: Partial<TabBarColorConfig>) =>
  COLOR_KEYS.reduce((colors, key) => {
    if (typeof values?.[key] === 'string') {
      colors[key] = values[key];
    }

    return colors;
  }, {} as Partial<TabBarColorConfig>);

export const resolveTabBarColors = (
  defaults: TabBarColorConfig,
  staticContent: TabNavigationStaticContent | undefined,
  mode: ResolvedThemeMode
): TabBarColorConfig => ({
  ...defaults,
  // Root-level colors predate theming and remain light-mode configuration for
  // backwards compatibility. Dark mode falls back to its semantic palette.
  ...(mode === 'light' ? getValidColors(staticContent) : {}),
  ...getValidColors(staticContent?.themeColors?.[mode])
});
