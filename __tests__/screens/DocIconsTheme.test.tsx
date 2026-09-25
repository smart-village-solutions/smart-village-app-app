import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import renderer from 'react-test-renderer';

import { darkColors, lightColors } from '../../src/config/colors';
import { DocIconsScreen } from '../../src/screens/doc/DocIconsScreen';
import { ThemeContext } from '../../src/ThemeContext';

jest.mock('../../src/components', () => {
  const { Text } = jest.requireActual('react-native');

  return {
    BoldText: ({ children, ...props }: { children: React.ReactNode }) => (
      <Text {...props}>{children}</Text>
    ),
    RegularText: ({ children, ...props }: { children: React.ReactNode }) => (
      <Text {...props}>{children}</Text>
    )
  };
});

jest.mock('../../src/config', () => {
  const { View } = jest.requireActual('react-native');

  return { Icon: { NamedIcon: () => <View /> }, normalize: (value: number) => value };
});

jest.mock('../../src/config/icons/mappings', () => ({
  iconMappings: { tabler: { location: 'map-pin' } }
}));

const renderWithTheme = (colors: typeof lightColors, isDark: boolean) => {
  let tree: renderer.ReactTestRenderer;

  renderer.act(() => {
    tree = renderer.create(
      <ThemeContext.Provider value={{ colors, isDark, mode: isDark ? 'dark' : 'light' }}>
        <DocIconsScreen />
      </ThemeContext.Provider>
    );
  });

  return tree!;
};

describe('DocIconsScreen theme', () => {
  it('changes its page surface and section header with the active palette', () => {
    const lightTree = renderWithTheme(lightColors, false);
    const darkTree = renderWithTheme(darkColors, true);

    const backgroundColors = (tree: renderer.ReactTestRenderer) =>
      tree.root
        .findAllByType(View)
        .map((view) => StyleSheet.flatten(view.props.style)?.backgroundColor);

    expect(backgroundColors(lightTree)).toContain(lightColors.primary);
    expect(backgroundColors(darkTree)).toContain(darkColors.primary);
    expect(StyleSheet.flatten(lightTree.root.findByType(ScrollView).props.style)).toMatchObject({
      backgroundColor: lightColors.surface
    });
    expect(StyleSheet.flatten(darkTree.root.findByType(ScrollView).props.style)).toMatchObject({
      backgroundColor: darkColors.surface
    });
  });
});
