import type { StackHeaderProps } from 'expo-router/build/react-navigation/stack';
import React from 'react';
import renderer from 'react-test-renderer';
import { StyleSheet } from 'react-native';

jest.mock('expo-router/build/react-navigation/stack', () => {
  const ReactLocal = jest.requireActual('react');
  return {
    Header: ({ options }: StackHeaderProps) =>
      ReactLocal.createElement(
        'mock-header',
        { options },
        options.headerBackground?.({ style: {} }),
        options.headerRight?.({ tintColor: options.headerTintColor, canGoBack: false })
      )
  };
});

jest.mock('../../src/components/AppStatusBar', () => ({
  AppStatusBar: (props: object) =>
    jest.requireActual('react').createElement('mock-status-bar', props)
}));

jest.mock('../../src/components/DiagonalGradient', () => ({
  DiagonalGradient: ({ children, ...props }: { children?: React.ReactNode }) =>
    jest.requireActual('react').createElement('mock-background', props, children)
}));

import { NavigationHeader } from '../../src/components/NavigationHeader';
import type { HeaderAppearanceConfig } from '../../src/components/NavigationHeader';
import { HeaderIcon } from '../../src/components/HeaderIcon';
import { darkColors, lightColors } from '../../src/config/colors';
import { useHeaderForeground } from '../../src/hooks/useHeaderForeground';
import { useTheme } from '../../src/hooks/useTheme';
import { ThemeContext } from '../../src/ThemeContext';
import type { ThemeColorPalette } from '../../src/types/Theme';

const ActionIcon = (props: object) => React.createElement('mock-action-icon', props);
const ScreenActions = () => {
  const foreground = useHeaderForeground();
  const { colors } = useTheme();
  return (
    <>
      {React.createElement('mock-header-action', { foreground, surface: colors.surface })}
      <HeaderIcon icon={ActionIcon} />
    </>
  );
};

const createHeader = (
  colors: ThemeColorPalette,
  appearance: HeaderAppearanceConfig = {},
  options: StackHeaderProps['options'] = {}
) => (
  <ThemeContext.Provider value={{ colors, isDark: colors === darkColors, mode: 'light' }}>
    <NavigationHeader
      {...({ options: { headerRight: () => <ScreenActions />, ...options } } as StackHeaderProps)}
      {...appearance}
    />
  </ThemeContext.Provider>
);

const renderHeader = (...args: Parameters<typeof createHeader>) => {
  let tree: renderer.ReactTestRenderer;
  renderer.act(() => {
    tree = renderer.create(createHeader(...args));
  });
  return tree!;
};

const expectForeground = (tree: renderer.ReactTestRenderer, color: string) => {
  const { options } = tree.root.findByType('mock-header' as never).props;
  expect(options.headerTintColor).toBe(color);
  expect(StyleSheet.flatten(options.headerTitleStyle).color).toBe(color);
  expect(StyleSheet.flatten(options.headerBackTitleStyle).color).toBe(color);
  expect(tree.root.findByType('mock-header-action' as never).props.foreground).toBe(color);
  expect(tree.root.findByType('mock-action-icon' as never).props.color).toBe(color);
};

describe('NavigationHeader shared appearance', () => {
  it.each([lightColors, darkColors])(
    'keeps regular headers on their theme surface (%j)',
    (colors: ThemeColorPalette) => {
      const tree = renderHeader(colors);
      expectForeground(tree, colors.text);
      expect(tree.root.findByType('mock-background' as never).props.colors).toEqual([
        colors.surface,
        colors.surface
      ]);
    }
  );

  it.each([lightColors, darkColors])(
    'uses onPrimary for branded headers (%j)',
    (colors: ThemeColorPalette) => {
      const tree = renderHeader(colors, { headerBackgroundColor: (palette) => palette.primary });
      expectForeground(tree, colors.onPrimary);
      expect(tree.root.findByType('mock-header-action' as never).props.surface).toBe(
        colors.surface
      );
    }
  );

  it('updates title and screen-installed actions together after a theme switch', () => {
    const config = { headerBackgroundColor: (colors: ThemeColorPalette) => colors.primary };
    const tree = renderHeader(lightColors, config);
    expectForeground(tree, lightColors.onPrimary);
    renderer.act(() => tree.update(createHeader(darkColors, config)));
    expectForeground(tree, darkColors.onPrimary);
  });

  it('resolves custom backgrounds and respects one explicit tint for every control', () => {
    const tree = renderHeader(
      lightColors,
      { headerBackgroundColor: '#000000' },
      { headerTitleStyle: { color: '#FF0000' } }
    );
    expectForeground(tree, '#FFFFFF');
    expect(tree.root.findByType('mock-status-bar' as never).props.barStyle).toBe('light-content');

    renderer.act(() =>
      tree.update(
        createHeader(
          lightColors,
          { headerBackgroundColor: '#000000' },
          { headerTintColor: '#ABCDEF' }
        )
      )
    );
    expectForeground(tree, '#ABCDEF');
  });

  it('supports backgrounds configured through native headerStyle', () => {
    const tree = renderHeader(lightColors, {}, { headerStyle: { backgroundColor: '#000000' } });
    expectForeground(tree, '#FFFFFF');
    expect(tree.root.findByType('mock-status-bar' as never).props.backgroundColor).toBe('#000000');
  });

  it('keeps explicit status bar styles and custom image backgrounds', () => {
    const tree = renderHeader(lightColors, { headerStatusBarStyle: 'light-content' });
    expect(tree.root.findByType('mock-status-bar' as never).props.barStyle).toBe('light-content');

    const imageHeader = renderHeader(
      lightColors,
      {},
      {
        headerTintColor: '#FFFFFF',
        headerBackground: () => React.createElement('mock-image-background')
      }
    );
    expectForeground(imageHeader, '#FFFFFF');
    expect(imageHeader.root.findByType('mock-image-background' as never)).toBeTruthy();
  });
});
