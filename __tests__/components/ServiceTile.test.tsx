import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 })
}));

jest.mock('expo-router/react-navigation', () => ({
  useNavigation: () => ({}),
  useRoute: () => ({ name: 'Services' })
}));
jest.mock('../../src/AccessibilityProvider', () => ({
  AccessibilityContext: jest.requireActual('react').createContext({ textScaleMultiplier: 1 })
}));
jest.mock('../../src/OrientationProvider', () => ({
  OrientationContext: jest.requireActual('react').createContext({
    orientation: 'portrait',
    dimensions: { width: 402, height: 874 }
  })
}));
jest.mock('../../src/config', () => ({
  consts: { a11yLabel: { button: 'button' } },
  normalize: (value: number) => value,
  Icon: { NamedIcon: () => null }
}));
jest.mock('../../src/helpers', () => ({
  ...jest.requireActual('../../src/helpers/serviceTileStyle'),
  ...jest.requireActual('../../src/helpers/serviceTileLayout')
}));
jest.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({ colors: {} })
}));
jest.mock('../../src/components/Image', () => ({ Image: () => null }));
jest.mock('../../src/components/profile', () => ({ Badge: () => null }));
jest.mock('../../src/components/Text', () => ({ BoldText: () => null }));

import { Image } from '../../src/components/Image';
import { ServiceTile } from '../../src/components/screens/ServiceTile';

const tile = (tileSizeFactor = 1, tileStyle = { backgroundColor: '#63C3EF', borderRadius: 8 }) => (
  <ServiceTile
    draggableId="wohnen"
    item={{ tile: 'https://example.com/wohnen.png', accessibilityLabel: 'Wohnen' } as never}
    onToggleVisibility={jest.fn()}
    serviceTiles={{ tileStyle }}
    tileSizeFactor={tileSizeFactor}
  />
);

const imageSize = (tree: ReturnType<typeof render>) =>
  StyleSheet.flatten(tree.UNSAFE_getByType(Image).props.style);

const layout = (tree: ReturnType<typeof render>, width: number) =>
  fireEvent(tree.UNSAFE_getByType(TouchableOpacity), 'layout', {
    nativeEvent: { layout: { width, height: width } }
  });

describe('image tile sizing', () => {
  it('keeps the same inset in full and incomplete rows and after resizing', () => {
    const tree = render(tile());

    for (const width of [119.67, 123.33, 180, 90]) {
      layout(tree, width);
      const image = imageSize(tree);
      expect((width - image.width) / 2).toBeCloseTo(1);
      expect(image.height).toBe(image.width);
    }
  });

  it('preserves the configured tile size factor and bounds oversized images', () => {
    const tree = render(tile(0.8));
    layout(tree, 120);
    expect(imageSize(tree).width).toBeCloseTo(118 * 0.8);

    tree.rerender(tile(2));
    expect(imageSize(tree).width).toBe(120);
    layout(tree, 0);
    expect(imageSize(tree).width).toBe(0);
  });

  it('preserves the default layout for image tiles without a configured background', () => {
    const tree = render(tile(1, {} as never));
    expect(tree.UNSAFE_getByType(TouchableOpacity).props.onLayout).toBeUndefined();
    expect(imageSize(tree).width).toBeCloseTo((402 - 28) / 3 - 7);
  });
});
