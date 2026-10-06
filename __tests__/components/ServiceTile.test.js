import React from 'react';
import { StyleSheet } from 'react-native';
import renderer from 'react-test-renderer';

import { OrientationContext } from '../../src/OrientationProvider';
import { Image } from '../../src/components/Image';
import { ServiceTile } from '../../src/components/screens/ServiceTile';

let mockInsets = { left: 62, right: 62, top: 0, bottom: 21 };

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => mockInsets
}));
jest.mock('expo-router/react-navigation', () => ({
  useNavigation: () => ({ push: jest.fn() }),
  useRoute: () => ({ name: 'Service' })
}));
jest.mock('../../src/config', () => ({
  colors: {},
  consts: { a11yLabel: { button: 'Button' } },
  // Deliberately frozen in landscape: tile sizing must not depend on these values.
  device: { width: 874, height: 402 },
  normalize: (size) => size,
  Icon: { NamedIcon: () => null }
}));
jest.mock('../../src/helpers', () => ({
  ...jest.requireActual('../../src/helpers/serviceTileStyle'),
  ...jest.requireActual('../../src/helpers/serviceTileLayout')
}));
jest.mock('../../src/components/Image', () => ({ Image: () => null }));
jest.mock('../../src/components/profile', () => ({ Badge: () => null }));
jest.mock('../../src/components/ServiceBox', () => ({ ServiceBox: 'ServiceBox' }));
jest.mock('../../src/components/Text', () => ({ BoldText: 'BoldText' }));

jest.mock('../../src/AccessibilityProvider', () => ({
  AccessibilityContext: jest
    .requireActual('react')
    .createContext({ textScaleMultiplier: 1, isReduceMotionEnabled: false })
}));

jest.mock('../../src/hooks/useTheme', () => ({ useTheme: () => ({ colors: {} }) }));
jest.mock('../../src/hooks/useThemeStyles', () => ({
  useThemeStyles: (createStyles) => createStyles({})
}));

describe('ServiceTile rotation', () => {
  let tree;
  const render = (orientation, width, height, props = {}) => {
    const element = (
      <OrientationContext.Provider value={{ orientation, dimensions: { width, height } }}>
        <ServiceTile
          draggableId="waste"
          item={{ tile: 'waste.png', title: 'Waste', routeName: 'WasteCollection' }}
          serviceTiles={{}}
          layoutColumns={orientation === 'landscape' ? 5 : 3}
          onToggleVisibility={jest.fn()}
          {...props}
        />
      </OrientationContext.Provider>
    );
    renderer.act(() => {
      if (tree) tree.update(element);
      else tree = renderer.create(element);
    });
    return StyleSheet.flatten(tree.root.findByType(Image).props.style);
  };

  afterEach(() => {
    renderer.act(() => tree.unmount());
    tree = undefined;
  });

  it('fits five landscape and three portrait tiles regardless of the startup orientation', () => {
    mockInsets = { left: 62, right: 62, top: 0, bottom: 21 };
    const landscape = render('landscape', 874, 402);
    expect(landscape.width).toBeCloseTo(137.4);
    expect(landscape.height).toBeCloseTo(137.4);

    mockInsets = { left: 0, right: 0, top: 62, bottom: 34 };
    const portrait = render('portrait', 402, 874);
    expect(portrait.width).toBeCloseTo(117.67);
    expect(portrait.height).toBeCloseTo(117.67);

    mockInsets = { left: 62, right: 62, top: 0, bottom: 21 };
    expect(render('landscape', 874, 402)).toEqual(landscape);
  });

  it('uses the measured content width while window dimensions lag behind rotation', () => {
    mockInsets = { left: 62, right: 62, top: 0, bottom: 21 };
    const landscape = render('landscape', 402, 874, { contentWidth: 718 });
    expect(landscape.width).toBeCloseTo(136.6);
    mockInsets = { left: 0, right: 0, top: 62, bottom: 34 };
    const portrait = render('portrait', 874, 402, { contentWidth: 370 });
    expect(portrait.width).toBeCloseTo(116.33);
  });

  it('preserves custom column counts and caps square tiles to their grid cells', () => {
    mockInsets = { left: 62, right: 62, top: 0, bottom: 21 };
    const style = render('landscape', 874, 402, {
      item: { tile: 'waste.png', numberOfTiles: { landscape: 4 } },
      tileSizeFactor: 1.5
    });
    expect(style.width).toBeCloseTo(180.5);
    expect(style.height).toBeCloseTo(180.5);
  });
});
