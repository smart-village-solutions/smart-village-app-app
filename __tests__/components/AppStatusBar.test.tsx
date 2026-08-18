import React from 'react';
import { StatusBar } from 'react-native';
import renderer from 'react-test-renderer';

import { AppStatusBar, resolveStatusBarStyle } from '../../src/components/AppStatusBar';
import { darkColors, lightColors } from '../../src/config/colors';
import { ThemeContext } from '../../src/ThemeContext';

const renderStatusBar = (
  backgroundColor: string,
  mode: 'dark' | 'light',
  barStyle?: 'dark-content' | 'light-content'
) => {
  const colors = mode === 'dark' ? darkColors : lightColors;
  let tree: renderer.ReactTestRenderer;

  renderer.act(() => {
    tree = renderer.create(
      <ThemeContext.Provider value={{ colors, isDark: mode === 'dark', mode }}>
        <AppStatusBar backgroundColor={backgroundColor} barStyle={barStyle} />
      </ThemeContext.Provider>
    );
  });

  return tree!;
};

describe('AppStatusBar', () => {
  it.each([
    ['#FFFFFF', 'dark-content'],
    ['#121212', 'light-content'],
    ['rgb(255, 255, 255)', 'dark-content'],
    ['rgb(0, 0, 0)', 'light-content']
  ] as const)('selects readable content for %s', (backgroundColor, expectedStyle) => {
    expect(resolveStatusBarStyle(backgroundColor, 'light-content')).toBe(expectedStyle);
  });

  it('uses the actual surface instead of the global theme mode', () => {
    const lightSurfaceInDarkMode = renderStatusBar('#FFFFFF', 'dark');
    const darkSurfaceInLightMode = renderStatusBar('#121212', 'light');

    expect(lightSurfaceInDarkMode.root.findByType(StatusBar).props.barStyle).toBe('dark-content');
    expect(darkSurfaceInLightMode.root.findByType(StatusBar).props.barStyle).toBe('light-content');
  });

  it('allows an explicit style override for custom surfaces', () => {
    const tree = renderStatusBar('#FFFFFF', 'light', 'light-content');

    expect(tree.root.findByType(StatusBar).props.barStyle).toBe('light-content');
  });

  it('falls back to the theme when the surface cannot be analyzed', () => {
    const tree = renderStatusBar('transparent', 'dark');

    expect(tree.root.findByType(StatusBar).props.barStyle).toBe('light-content');
  });
});
