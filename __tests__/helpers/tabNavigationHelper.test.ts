import { resolveTabBarColors } from '../../src/helpers/tabNavigationHelper';
import { TabBarColorConfig, TabNavigationStaticContent } from '../../src/types';

const lightDefaults: TabBarColorConfig = {
  activeBackgroundColor: '#ffffff',
  activeTintColor: '#006600',
  inactiveBackgroundColor: '#ffffff',
  inactiveTintColor: '#333333'
};

const darkDefaults: TabBarColorConfig = {
  activeBackgroundColor: '#222222',
  activeTintColor: '#88dd88',
  inactiveBackgroundColor: '#222222',
  inactiveTintColor: '#eeeeee'
};

const legacyStaticContent: TabNavigationStaticContent = {
  activeBackgroundColor: '#fafafa',
  activeTintColor: '#005a8d',
  inactiveBackgroundColor: '#fafafa',
  inactiveTintColor: '#666666',
  tabConfigs: []
};

describe('resolveTabBarColors', () => {
  it('keeps root-level static content colors as light-mode configuration', () => {
    expect(resolveTabBarColors(lightDefaults, legacyStaticContent, 'light')).toEqual({
      activeBackgroundColor: '#fafafa',
      activeTintColor: '#005a8d',
      inactiveBackgroundColor: '#fafafa',
      inactiveTintColor: '#666666'
    });
  });

  it('uses semantic palette defaults in dark mode instead of legacy light colors', () => {
    expect(resolveTabBarColors(darkDefaults, legacyStaticContent, 'dark')).toEqual(darkDefaults);
  });

  it('applies per-mode static content overrides over semantic defaults', () => {
    const staticContent: TabNavigationStaticContent = {
      ...legacyStaticContent,
      themeColors: {
        dark: {
          activeTintColor: '#ffcc00',
          inactiveBackgroundColor: '#101820'
        }
      }
    };

    expect(resolveTabBarColors(darkDefaults, staticContent, 'dark')).toEqual({
      ...darkDefaults,
      activeTintColor: '#ffcc00',
      inactiveBackgroundColor: '#101820'
    });
  });
});
