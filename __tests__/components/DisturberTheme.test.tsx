import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import renderer from 'react-test-renderer';

import { ThemeContext } from '../../src/ThemeContext';
import { Disturber } from '../../src/components/Disturber';
import { ImagesCarousel } from '../../src/components/ImagesCarousel';
import { Wrapper, WrapperHorizontal } from '../../src/components/Wrapper';
import { Icon } from '../../src/config';
import { themePalettes } from '../../src/config/colors';
import { addToStore, readFromStore } from '../../src/helpers';
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
const disturberElement = (mode: 'light' | 'dark') => (
  <ThemeContext.Provider value={{ mode, isDark: mode === 'dark', colors: themePalettes[mode] }}>
    <Disturber navigation={navigation as never} publicJsonFile="disturber" />
  </ThemeContext.Provider>
);
const renderDisturber = async (mode: 'light' | 'dark' = 'light') => {
  let tree!: renderer.ReactTestRenderer;
  await renderer.act(async () => {
    tree = renderer.create(disturberElement(mode));
  });
  return tree;
};
const background = (tree: renderer.ReactTestRenderer) =>
  tree.root
    .findAllByType(View)
    .map((view) => StyleSheet.flatten(view.props.style)?.backgroundColor)
    .find((color) => color !== undefined);

describe('Disturber theme overrides', () => {
  beforeEach(() => {
    mockData = [item];
    jest.clearAllMocks();
    jest.mocked(readFromStore).mockResolvedValue(null);
  });

  it('updates colors and nested pictures when the theme changes, preserving navigation and source data', async () => {
    const tree = await renderDisturber('light');
    expect(background(tree)).toBe('#E5BFF7');
    expect(tree.root.findByType(ImagesCarousel).props.data[0].picture.uri).toBe('light.png');

    await renderer.act(async () => {
      tree.update(disturberElement('dark'));
    });
    expect(background(tree)).toBe('#302238');
    expect(tree.root.findByType(ImagesCarousel).props.data[0].picture).toEqual({
      uri: 'dark.png',
      routeName: 'Web',
      params: { webUrl: 'https://example.com' }
    });
    expect(item.pictures[0].picture.uri).toBe('light.png');

    await renderer.act(async () => {
      tree.update(disturberElement('light'));
    });
    expect(background(tree)).toBe('#E5BFF7');

    await renderer.act(async () => {
      tree.root.findByType(TouchableOpacity).props.onPress();
    });
    expect(addToStore).toHaveBeenCalledWith('disturber', '1');
    await renderer.act(async () => {
      tree.update(disturberElement('dark'));
    });
    expect(tree.toJSON()).toBeNull();
  });

  it.each(['light', 'dark'] as const)('keeps the close icon readable in %s mode', async (mode) => {
    const tree = await renderDisturber(mode);
    const buttonStyle = StyleSheet.flatten(tree.root.findByType(TouchableOpacity).props.style);
    const iconColor = tree.root.findByType(Icon.Close).props.color;

    expect(buttonStyle.opacity ?? 1).toBe(1);
    expect(getContrastRatio(iconColor, buttonStyle.backgroundColor)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps legacy content unchanged in dark mode when no overrides are configured', async () => {
    mockData = [{ id: 2, backgroundColor: '#E5BFF7' }];
    const tree = await renderDisturber('dark');
    expect(background(tree)).toBe('#E5BFF7');
  });
});

describe('Disturber layout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(readFromStore).mockResolvedValue(null);
  });

  it('keeps the standard 16 inset and omits absent description and button sections', async () => {
    mockData = [{ id: 1, headline: 'New', title: 'Welcome' }];
    const tree = await renderDisturber();
    const wrappers = tree.root.findAllByType(Wrapper);

    expect(wrappers).toHaveLength(3);
    expect(StyleSheet.flatten(tree.root.findAllByType(View)[0].props.style)).toEqual({
      paddingBottom: 16,
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 16
    });
    expect(wrappers[1].props.noPaddingTop).toBeUndefined();
    expect(wrappers[2].props.noPaddingTop).toBe(true);
  });

  it.each([
    { title: 'Title' },
    { description: 'Description' },
    { button: { title: 'Open', navigationTo: 'Web', params: { webUrl: 'https://example.com' } } }
  ])('retains top padding when the first visible content is %j', async (content) => {
    mockData = [{ id: 1, ...content }];
    const tree = await renderDisturber();
    const wrappers = tree.root.findAllByType(Wrapper);

    expect(wrappers).toHaveLength(2);
    expect(wrappers[1].props.noPaddingTop).toBe(false);
    expect(wrappers[1].props.style).toMatchObject({ paddingTop: 48 });
  });

  it.each(['light', 'dark'] as const)(
    'keeps a long image-less headline clear of the close control in %s mode',
    async (mode) => {
      mockData = [
        {
          id: 1,
          headline: 'A long municipal announcement that needs several lines on a narrow screen',
          title: 'Welcome'
        }
      ];
      const tree = await renderDisturber(mode);
      const wrappers = tree.root.findAllByType(Wrapper);
      const headlineStyle = StyleSheet.flatten(wrappers[1].findAllByType(View)[0].props.style);
      const innerStyle = StyleSheet.flatten(
        wrappers[1].findByType(WrapperHorizontal).findByType(View).props.style
      );
      const closeStyle = StyleSheet.flatten(tree.root.findByType(TouchableOpacity).props.style);

      expect(headlineStyle.paddingRight + innerStyle.paddingRight).toBeGreaterThanOrEqual(
        closeStyle.right + closeStyle.width + 16
      );
      expect(headlineStyle.paddingLeft).toBe(headlineStyle.paddingRight);
      expect(headlineStyle.paddingTop).toBe(16);
      expect(wrappers[2].props.noPaddingTop).toBe(true);
      expect(wrappers[2].props.style).toBeUndefined();
    }
  );

  it.each([{ pictures: [{ picture: { uri: 'image.png' } }] }, { showButtonToClose: false }])(
    'keeps standard headline insets when close clearance is unnecessary: %j',
    async (options) => {
      mockData = [{ id: 1, headline: 'Announcement', ...options }];
      const tree = await renderDisturber();

      expect(tree.root.findAllByType(Wrapper)[1].props.style).toBeUndefined();
    }
  );

  it('uses standard text padding when no close button needs space', async () => {
    mockData = [{ id: 1, title: 'Welcome', showButtonToClose: false }];
    const tree = await renderDisturber();

    expect(tree.root.findAllByType(Wrapper)[1].props.style).toBeUndefined();
    expect(tree.root.findAllByType(TouchableOpacity)).toHaveLength(0);
  });

  it('preserves image-only cards without an empty content section', async () => {
    mockData = [{ id: 1, pictures: [{ picture: { uri: 'image.png' } }] }];
    const tree = await renderDisturber();

    expect(tree.root.findAllByType(Wrapper)).toHaveLength(1);
    expect(tree.root.findByType(ImagesCarousel).props.data).toEqual(
      (mockData[0] as { pictures: unknown[] }).pictures
    );
    expect(
      StyleSheet.flatten(tree.root.findByType(ImagesCarousel).parent!.props.style)
    ).toMatchObject({
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8
    });
  });

  it('removes its outer spacing when dismissed', async () => {
    mockData = [{ id: 1, title: 'Welcome' }];
    const tree = await renderDisturber();

    await renderer.act(async () => {
      tree.root.findByType(TouchableOpacity).props.onPress();
    });
    expect(tree.toJSON()).toBeNull();
  });

  it('occupies no space when already dismissed or when no active content exists', async () => {
    mockData = [{ id: 1, title: 'Welcome' }];
    jest.mocked(readFromStore).mockResolvedValue('1');
    const dismissed = await renderDisturber();
    expect(dismissed.toJSON()).toBeNull();

    mockData = [];
    const empty = await renderDisturber();
    expect(empty.toJSON()).toBeNull();
  });
});
