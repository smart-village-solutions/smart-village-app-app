import React from 'react';
import { View } from 'react-native';
import renderer from 'react-test-renderer';

import { AccessibilityContext } from '../../src/AccessibilityProvider';
import { OrientationContext } from '../../src/OrientationProvider';
import { Service } from '../../src/components/screens/Service';
import { ServiceTile } from '../../src/components/screens/ServiceTile';

jest.mock('expo-router/react-navigation', () => ({
  useNavigation: () => ({}),
  useRoute: () => ({ name: 'Service' })
}));
jest.mock('../../src/config', () => ({
  colors: {},
  consts: { MATOMO_TRACKING: {}, UMLAUT_REGEX: /[äöüß]/g },
  normalize: (size) => size,
  texts: {}
}));
jest.mock('../../src/ConfigurationsProvider', () => ({
  ConfigurationsContext: jest.requireActual('react').createContext({ appDesignSystem: {} })
}));
jest.mock('../../src/SettingsProvider', () => ({
  SettingsContext: jest.requireActual('react').createContext({ globalSettings: {} })
}));
jest.mock('../../src/types', () => ({
  ScreenName: {
    Profile: 'Profile',
    ProfileContent: 'ProfileContent',
    ProfileCreateContentHome: 'ProfileCreateContentHome'
  }
}));
jest.mock('../../src/hooks', () => ({
  usePersonalizedTiles: () => ({
    tiles: Array.from({ length: 10 }, (_, index) => ({ title: `Tile ${index}` }))
  })
}));
jest.mock('../../src/components/DiagonalGradient', () => ({ DiagonalGradient: 'Gradient' }));
jest.mock('../../src/components/LoadingSpinner', () => ({ LoadingSpinner: () => null }));
jest.mock('../../src/components/Text', () => ({ RegularText: 'Text' }));
jest.mock('../../src/components/Wrapper', () => ({ WrapperWrap: 'Row' }));
jest.mock('../../src/components/screens/DraggableGrid', () => ({ DraggableGrid: 'Grid' }));
jest.mock('../../src/components/screens/ServiceTile', () => ({ ServiceTile: () => null }));

jest.mock('../../src/AccessibilityProvider', () => ({
  AccessibilityContext: jest
    .requireActual('react')
    .createContext({ textScaleMultiplier: 1, isReduceMotionEnabled: false })
}));

jest.mock('../../src/hooks/useTheme', () => ({ useTheme: () => ({ colors: {} }) }));
jest.mock('../../src/hooks/useThemeStyles', () => ({
  useThemeStyles: (createStyles) => createStyles({})
}));

jest.mock('../../src/ProfileProvider', () => ({
  ProfileContext: jest.requireActual('react').createContext({})
}));

it('lays out five or three columns using the width actually available inside the safe area', () => {
  let tree;
  const render = (orientation, textScaleMultiplier = 1, rowHorizontalPadding = 0) => (
    <AccessibilityContext.Provider value={{ textScaleMultiplier }}>
      <OrientationContext.Provider value={{ orientation }}>
        <Service
          data={[]}
          isEditMode={false}
          staticJsonName="serviceTiles"
          rowHorizontalPadding={rowHorizontalPadding}
        />
      </OrientationContext.Provider>
    </AccessibilityContext.Provider>
  );
  renderer.act(() => {
    tree = renderer.create(render('landscape'));
  });
  renderer.act(() => {
    tree.root.findByType(View).props.onLayout({ nativeEvent: { layout: { width: 718 } } });
  });
  expect(tree.root.findAllByType('Row')).toHaveLength(2);
  expect(
    tree.root.findAllByType(ServiceTile).every((tile) => tile.props.contentWidth === 718)
  ).toBe(true);
  renderer.act(() => tree.update(render('portrait')));
  renderer.act(() => {
    tree.root.findByType(View).props.onLayout({ nativeEvent: { layout: { width: 370 } } });
  });
  expect(tree.root.findAllByType('Row')).toHaveLength(4);
  expect(
    tree.root.findAllByType(ServiceTile).every((tile) => tile.props.contentWidth === 370)
  ).toBe(true);
  renderer.act(() => tree.update(render('portrait', 1.3, 8)));
  expect(tree.root.findAllByType('Row')).toHaveLength(5);
  expect(
    tree.root
      .findAllByType(ServiceTile)
      .every((tile) => tile.props.contentWidth === 354 && tile.props.layoutColumns === 2)
  ).toBe(true);
  renderer.act(() => tree.unmount());
});
