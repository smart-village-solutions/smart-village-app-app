import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

const mockTileMount = jest.fn();

jest.mock('expo-router/react-navigation', () => ({
  useNavigation: () => ({}),
  useRoute: () => ({ name: 'Services' })
}));

jest.mock('../../src/AccessibilityProvider', () => ({
  AccessibilityContext: jest.requireActual('react').createContext({ textScaleMultiplier: 1 })
}));
jest.mock('../../src/ConfigurationsProvider', () => ({
  ConfigurationsContext: jest.requireActual('react').createContext({ appDesignSystem: {} })
}));
jest.mock('../../src/OrientationProvider', () => ({
  OrientationContext: jest.requireActual('react').createContext({ orientation: 'portrait' })
}));
jest.mock('../../src/ProfileProvider', () => ({
  ProfileContext: jest.requireActual('react').createContext({ currentUserData: {} })
}));
jest.mock('../../src/SettingsProvider', () => ({
  SettingsContext: jest.requireActual('react').createContext({ globalSettings: {} })
}));
jest.mock('../../src/config', () => ({
  consts: { MATOMO_TRACKING: { SCREEN_VIEW: {} } },
  normalize: (value: number) => value,
  texts: {}
}));
jest.mock('../../src/hooks', () => ({
  usePersonalizedTiles: (_enabled: boolean, data: unknown[]) => ({ tiles: data })
}));
jest.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({ colors: {} })
}));
jest.mock('../../src/components/DiagonalGradient', () => ({ DiagonalGradient: () => null }));
jest.mock('../../src/components/LoadingSpinner', () => ({ LoadingSpinner: () => null }));
jest.mock('../../src/components/Text', () => ({ RegularText: () => null }));
jest.mock('../../src/components/screens/DraggableGrid', () => ({ DraggableGrid: () => null }));
jest.mock('../../src/components/screens/ServiceTile', () => ({
  ServiceTile: ({ item, layoutColumns }: { item: { title: string }; layoutColumns: number }) => {
    const { useEffect, useRef } = jest.requireActual('react');
    const { Text } = jest.requireActual('react-native');
    const initialLayout = useRef({ title: item.title, columns: layoutColumns });

    useEffect(() => {
      mockTileMount(initialLayout.current.title, initialLayout.current.columns);
    }, []);

    return <Text>{`${item.title}:${layoutColumns}`}</Text>;
  }
}));

import { AccessibilityContext } from '../../src/AccessibilityProvider';
import { Service } from '../../src/components/screens/Service';
import { ServiceTile } from '../../src/components/screens/ServiceTile';
import { WrapperWrap } from '../../src/components/Wrapper';

const tiles = ['Administration', 'Appointments', 'Trees', 'Map', 'Family', 'Seniors'].map(
  (title) => ({ title })
);

const serviceAtScale = (textScaleMultiplier: number) => (
  <AccessibilityContext.Provider value={{ textScaleMultiplier } as never}>
    <Service data={tiles} staticJsonName="services" />
  </AccessibilityContext.Provider>
);

describe('Service layout changes', () => {
  beforeEach(() => mockTileMount.mockClear());

  it('centers the incomplete row with the same gap and no leading tile margin', () => {
    const tree = render(serviceAtScale(0.9));
    const rows = tree.UNSAFE_getAllByType(WrapperWrap);

    expect(rows).toHaveLength(2);
    expect(rows[1].props.center).toBe(true);
    expect(rows[1].props.spaceBetween).toBe(false);
    expect(rows[1].props.style.columnGap).toBe(rows[0].props.style.columnGap);
  });

  it('updates every tile with the measured width when its container is resized', () => {
    const tree = render(serviceAtScale(0.9));

    for (const width of [360, 480]) {
      fireEvent(tree.UNSAFE_getAllByType(WrapperWrap)[0], 'layout', {
        nativeEvent: { layout: { width } }
      });

      for (const tile of tree.UNSAFE_getAllByType(ServiceTile)) {
        expect(tile.props.gridWidth).toBe(width);
        expect(tile.props.gridGap).toBe(5);
      }
    }
  });

  it.each([
    [1.2, 0.9, 4],
    [0.9, 1.2, 2]
  ])(
    'recreates the last row when text scale changes from %s to %s',
    (initialScale, nextScale, columns) => {
      const tree = render(serviceAtScale(initialScale));
      mockTileMount.mockClear();

      tree.rerender(serviceAtScale(nextScale));

      for (const title of ['Family', 'Seniors']) {
        expect(tree.getByText(`${title}:${columns}`)).toBeTruthy();
        expect(mockTileMount).toHaveBeenCalledWith(title, columns);
      }
    }
  );
});
