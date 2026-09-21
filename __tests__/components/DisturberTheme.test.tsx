import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import renderer from 'react-test-renderer';

import { ThemeContext } from '../../src/ThemeContext';
import { Disturber } from '../../src/components/Disturber';
import { ImagesCarousel } from '../../src/components/ImagesCarousel';
import { Icon } from '../../src/config';
import { themePalettes } from '../../src/config/colors';
import { addToStore } from '../../src/helpers';
import { getContrastRatio } from '../../src/helpers/themeHelper';

jest.mock('../../src/config', () => ({
  Icon: { Close: () => null },
  normalize: (value: number) => value,
  texts: { accessibilityLabels: { actions: { close: 'Close' } } }
}));

jest.mock('../../src/helpers', () => ({
  ...jest.requireActual('../../src/helpers/appDesignSystemHelper'),
  addToStore: jest.fn(),
  findClosestItem: (items: unknown[]) => items[0],
  isActive: () => true,
  readFromStore: jest.fn().mockResolvedValue(null)
}));

jest.mock('../../src/hooks', () => ({
  useHomeRefresh: jest.fn(),
  useStaticContent: () => ({ data: mockData, refetch: jest.fn() })
}));

jest.mock('../../src/components/ImagesCarousel', () => ({ ImagesCarousel: () => null }));
jest.mock('../../src/components/Button', () => ({ Button: () => null }));
jest.mock('../../src/components/Text', () => ({
  HeadlineText: () => null,
  RegularText: () => null
}));
jest.mock('../../src/components/Wrapper', () => ({
  Wrapper: ({ children }: { children: React.ReactNode }) => children,
  WrapperHorizontal: ({ children }: { children: React.ReactNode }) => children
}));

const item = {
  id: 1,
  backgroundColor: '#E5BFF7',
  dark: { backgroundColor: '#302238' },
  pictures: [
    {
      picture: {
        uri: 'light.png',
        routeName: 'Web',
        params: { webUrl: 'https://example.com' },
        dark: { uri: 'dark.png' }
      }
    }
  ]
};
let mockData: object[];
const navigation = { navigate: jest.fn() };
const renderDisturber = (mode: 'light' | 'dark') => (
  <ThemeContext.Provider value={{ mode, isDark: mode === 'dark', colors: themePalettes[mode] }}>
    <Disturber navigation={navigation as never} publicJsonFile="disturber" />
  </ThemeContext.Provider>
);
const background = (tree: renderer.ReactTestRenderer) =>
  StyleSheet.flatten(tree.root.findAllByType(View)[0].props.style).backgroundColor;

describe('Disturber theme overrides', () => {
  beforeEach(() => {
    mockData = [item];
    jest.clearAllMocks();
  });

  it('updates colors and nested pictures when the theme changes, preserving navigation and source data', async () => {
    let tree: renderer.ReactTestRenderer;
    await renderer.act(async () => {
      tree = renderer.create(renderDisturber('light'));
    });
    expect(background(tree!)).toBe('#E5BFF7');
    expect(tree!.root.findByType(ImagesCarousel).props.data[0].picture.uri).toBe('light.png');

    await renderer.act(async () => {
      tree!.update(renderDisturber('dark'));
    });
    expect(background(tree!)).toBe('#302238');
    expect(tree!.root.findByType(ImagesCarousel).props.data[0].picture).toEqual({
      uri: 'dark.png',
      routeName: 'Web',
      params: { webUrl: 'https://example.com' }
    });
    expect(item.pictures[0].picture.uri).toBe('light.png');

    await renderer.act(async () => {
      tree!.update(renderDisturber('light'));
    });
    expect(background(tree!)).toBe('#E5BFF7');

    await renderer.act(async () => {
      tree!.root.findByType(TouchableOpacity).props.onPress();
    });
    expect(addToStore).toHaveBeenCalledWith('disturber', '1');
    await renderer.act(async () => {
      tree!.update(renderDisturber('dark'));
    });
    expect(tree!.toJSON()).toBeNull();
  });

  it.each(['light', 'dark'] as const)('keeps the close icon readable in %s mode', async (mode) => {
    let tree: renderer.ReactTestRenderer;
    await renderer.act(async () => {
      tree = renderer.create(renderDisturber(mode));
    });
    const buttonStyle = StyleSheet.flatten(tree!.root.findByType(TouchableOpacity).props.style);
    const iconColor = tree!.root.findByType(Icon.Close).props.color;

    expect(buttonStyle.opacity ?? 1).toBe(1);
    expect(getContrastRatio(iconColor, buttonStyle.backgroundColor)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps legacy content unchanged in dark mode when no overrides are configured', async () => {
    mockData = [{ id: 2, backgroundColor: '#E5BFF7' }];
    let tree: renderer.ReactTestRenderer;
    await renderer.act(async () => {
      tree = renderer.create(renderDisturber('dark'));
    });
    expect(background(tree!)).toBe('#E5BFF7');
  });
});
