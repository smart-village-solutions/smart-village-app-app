/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import { Camera, Map } from '@maplibre/maplibre-react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { SueReportLocation } from '../../src/components/SUE/report/SueReportLocation';
import { useSueReportLocation } from '../../src/hooks/useSueReportLocation';

const mockReverseGeocode = jest.fn();
const gps = { latitude: 54.39, longitude: 10.17 };
const pin = { latitude: 54.36, longitude: 10.13 };

jest.mock('@maplibre/maplibre-react-native', () => {
  const react = require('react');
  return Object.fromEntries(
    ['Camera', 'Map', 'NativeUserLocation'].map((name) => [
      name,
      ({ children, ...props }) => react.createElement(name, props, children)
    ])
  );
});
jest.mock('expo-router/js-tabs', () => ({ useBottomTabBarHeight: () => 0 }));
jest.mock('expo-router/react-navigation', () => ({ useNavigation: () => ({}) }));
jest.mock('expo-location', () => ({
  PermissionStatus: { GRANTED: 'granted' },
  getForegroundPermissionsAsync: async () => ({ status: 'granted' })
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 })
}));
jest.mock('react-native-reanimated', () => ({ View: () => null }));
jest.mock('react-query', () => ({ useQuery: () => ({}) }));
jest.mock('../../src/ConfigurationsProvider', () => ({
  ConfigurationsContext: require('react').createContext({})
}));
jest.mock('../../src/SettingsProvider', () => ({
  SettingsContext: require('react').createContext({ globalSettings: {} })
}));
jest.mock('../../src/config', () => ({
  consts: jest.requireActual('../../src/config/consts').consts,
  texts: jest.requireActual('../../src/config/texts').texts,
  SUE_STATUS: jest.requireActual('../../src/config/sue/constants').SUE_STATUS,
  device: { width: 390, height: 844 },
  normalize: (value: number) => value,
  Icon: { GPS: () => null, ExpandMap: () => null, CondenseMap: () => null }
}));
jest.mock('../../src/helpers', () => ({ parseListItemsFromQuery: () => [] }));
jest.mock('../../src/hooks', () => ({
  useLocationSettings: () => ({ locationSettings: { locationService: true } }),
  useMapFeatureConfig: () => ({}),
  usePosition: () => ({ position: { coords: gps } }),
  useLastKnownPosition: () => ({}),
  useReverseGeocode: () => mockReverseGeocode,
  useSystemPermission: () => ({ status: 'granted' })
}));
jest.mock('../../src/hooks/useTheme', () => ({ useTheme: () => ({ colors: {} }) }));
jest.mock('../../src/hooks/useThemeStyles', () => ({ useThemeStyles: () => ({}) }));
jest.mock('../../src/queries', () => ({ QUERY_TYPES: { SUE: {} } }));
jest.mock('../../src/screens/SettingsScreen', () => ({}));
jest.mock('../../src/screens/SUE/SueMapScreen', () => ({ mapToMapMarkers: () => [] }));
jest.mock('../../src/components/Wrapper', () => ({ Wrapper: ({ children }) => children }));
jest.mock('../../src/components/Text', () => ({ RegularText: () => null, BoldText: () => null }));
jest.mock('../../src/components/Button', () => ({ Button: () => null }));
jest.mock('../../src/components/form', () => ({ Input: () => null }));
jest.mock('../../src/components/map', () =>
  jest.requireActual('../../src/components/map/MapLibre')
);

function ReportMap() {
  const [isFullscreenMap, setIsFullscreenMap] = React.useState(false);
  const selection = useSueReportLocation(() => ({
    street: '',
    houseNumber: '',
    city: '',
    postalCode: ''
  }));
  return (
    <SueReportLocation
      {...selection}
      configuration={{ geoMap: { clusterDistance: 0, clusterThreshold: 0 } }}
      control={{}}
      errorMessage=""
      isFullscreenMap={isFullscreenMap}
      resolveManualLocation={jest.fn()}
      setIsFullscreenMap={setIsFullscreenMap}
      setShowCoordinatesFromImageAlert={jest.fn()}
      setUpdateRegionFromImage={jest.fn()}
      setValue={jest.fn()}
      updateRegionFromImage={false}
    />
  );
}

it.each([true, false])(
  'follows GPS only if its fullscreen lookup is current (superseded: %s)',
  async (superseded) => {
    jest.useFakeTimers();
    let tree: renderer.ReactTestRenderer | undefined;
    try {
      let completeGps: () => void = () => {};
      mockReverseGeocode
        .mockReset()
        .mockImplementationOnce(
          ({ isLatestRequest }) =>
            new Promise((resolve) => {
              completeGps = () => resolve({ isWithinArea: isLatestRequest() });
            })
        )
        .mockResolvedValueOnce({ isWithinArea: true });
      act(() => {
        tree = renderer.create(<ReportMap />);
      });

      const root = tree?.root;
      if (!root) throw new Error('Report map did not render');

      const [myLocation, maximize] = root.findAllByType(TouchableOpacity);
      act(() => maximize.props.onPress());
      await act(async () => {
        void myLocation.props.onPress();
      });
      expect(mockReverseGeocode).toHaveBeenCalledTimes(1);

      if (superseded) {
        await act(async () => {
          root.findByType(Map).props.onPress({
            nativeEvent: { lngLat: [pin.longitude, pin.latitude] }
          });
          await jest.advanceTimersByTimeAsync(50);
        });
      }

      await act(async () => completeGps());
      expect(root.findByType(Camera).props.trackUserLocation).toBe(
        superseded ? undefined : 'default'
      );
      expect(root.findByType(SueReportLocation).props.selectedPosition).toEqual(
        superseded ? pin : gps
      );
    } finally {
      if (tree) act(() => tree?.unmount());
      jest.useRealTimers();
    }
  }
);
