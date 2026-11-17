/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import { Camera, Map } from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import React from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { SueReportLocation } from '../../src/components/SUE/report/SueReportLocation';
import { useSueReportLocation } from '../../src/hooks/useSueReportLocation';

const mockReverseGeocode = jest.fn();
let mockUseRealReverse = false;
let mockHasCachedGps = true;
const gps = { latitude: 54.39, longitude: 10.17 };
let mockSelection: ReturnType<typeof useSueReportLocation>;
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
  getForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn()
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
  usePosition: () => ({ position: mockHasCachedGps ? { coords: gps } : undefined }),
  useLastKnownPosition: () => ({}),
  useReverseGeocode: () =>
    mockUseRealReverse
      ? jest.requireActual('../../src/hooks/reverseGeocode').useReverseGeocode()
      : mockReverseGeocode,
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

function ReportMap({ confirmed = false }: { confirmed?: boolean }) {
  const [isFullscreenMap, setIsFullscreenMap] = React.useState(false);
  const address = React.useRef({
    street: 'Koloniestraße',
    houseNumber: '2',
    city: 'Kiel',
    postalCode: '24159'
  });
  const getAddress = React.useCallback(() => address.current, []);
  const selection = useSueReportLocation(getAddress);
  React.useEffect(() => {
    mockSelection = selection;
  });
  const { setSelectedPosition } = selection;
  React.useEffect(() => {
    if (confirmed) setSelectedPosition(pin);
  }, [confirmed, setSelectedPosition]);
  return (
    <SueReportLocation
      {...selection}
      areaServiceData={{ postalCodes: ['24159'] }}
      configuration={{ geoMap: { clusterDistance: 0, clusterThreshold: 0 } }}
      control={{}}
      errorMessage=""
      isFullscreenMap={isFullscreenMap}
      resolveManualLocation={jest.fn()}
      setIsFullscreenMap={setIsFullscreenMap}
      setShowCoordinatesFromImageAlert={jest.fn()}
      setUpdateRegionFromImage={jest.fn()}
      setValue={(key, value) => {
        address.current[key] = value;
      }}
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

it.each(['empty', 'timeout', 'outside', 'cancelled'])(
  'keeps a confirmed address and pin when a map lookup fails (%s)',
  async (failure) => {
    jest.useFakeTimers();
    mockUseRealReverse = true;
    const fetchSpy = jest.spyOn(global, 'fetch');
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    let tree: renderer.ReactTestRenderer | undefined;
    try {
      if (failure === 'timeout' || failure === 'cancelled')
        fetchSpy.mockReturnValue(new Promise(() => {}));
      else
        fetchSpy.mockResolvedValue({
          ok: true,
          json: async () =>
            failure === 'empty' ? {} : { address: { city: 'Augsburg', postcode: '86199' } }
        } as Response);
      await act(async () => {
        tree = renderer.create(<ReportMap confirmed />);
      });
      const root = tree?.root;
      if (!root) throw new Error('Map did not render');
      act(() => {
        root
          .findByType(Map)
          .props.onPress({ nativeEvent: { lngLat: [gps.longitude, gps.latitude] } });
      });
      if (failure === 'cancelled') {
        await act(async () => {
          await jest.advanceTimersByTimeAsync(50);
          mockSelection.cancelLocationUpdate();
        });
      }
      await act(async () => jest.advanceTimersByTimeAsync(10_050));
      const report = root.findByType(SueReportLocation).props;
      expect(report.selectedPosition).toEqual(pin);
      expect(
        mockSelection.getConfirmedLocation({
          street: 'Koloniestraße',
          houseNumber: '2',
          city: 'Kiel',
          postalCode: '24159'
        })?.position
      ).toEqual(pin);
      if (failure === 'cancelled') expect(alertSpy).not.toHaveBeenCalled();
      else expect(alertSpy).toHaveBeenCalled();
    } finally {
      if (tree) act(() => tree?.unmount());
      fetchSpy.mockRestore();
      alertSpy.mockRestore();
      mockUseRealReverse = false;
      jest.useRealTimers();
    }
  }
);

it('releases a stalled uncached GPS acquisition without applying its late result', async () => {
  jest.useFakeTimers();
  mockHasCachedGps = false;
  let completeGps: (value: unknown) => void = () => {};
  (Location.getCurrentPositionAsync as jest.Mock).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        completeGps = resolve;
      })
  );
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  let tree: renderer.ReactTestRenderer | undefined;
  try {
    act(() => {
      tree = renderer.create(<ReportMap confirmed />);
    });
    const root = tree?.root;
    if (!root) throw new Error('Map did not render');
    const [myLocation, maximize] = root.findAllByType(TouchableOpacity);
    act(() => maximize.props.onPress());
    await act(async () => {
      void myLocation.props.onPress();
    });
    await act(async () => jest.advanceTimersByTimeAsync(10_000));
    const report = root.findByType(SueReportLocation).props;
    expect(mockSelection.isLocationPending()).toBe(false);
    expect(report.selectedPosition).toEqual(pin);
    await act(async () => completeGps({ coords: gps }));
    expect(root.findByType(SueReportLocation).props.selectedPosition).toEqual(pin);
    expect(root.findByType(Camera).props.trackUserLocation).toBeUndefined();
  } finally {
    if (tree) act(() => tree?.unmount());
    alertSpy.mockRestore();
    mockHasCachedGps = true;
    jest.useRealTimers();
  }
});

it.each(['outside', 'timeout'])(
  'does not track a rejected cached GPS position (%s)',
  async (reason) => {
    mockUseRealReverse = true;
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ address: { city: 'Augsburg', postcode: '86199' } })
    } as Response);
    if (reason === 'timeout') fetchSpy.mockRejectedValue(new Error('Timeout'));
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    let tree: renderer.ReactTestRenderer | undefined;
    try {
      await act(async () => {
        tree = renderer.create(<ReportMap confirmed />);
      });
      const root = tree?.root;
      if (!root) throw new Error('Map did not render');
      const [myLocation, maximize] = root.findAllByType(TouchableOpacity);
      act(() => maximize.props.onPress());
      await act(async () => myLocation.props.onPress());
      expect(root.findByType(Camera).props.trackUserLocation).toBeUndefined();
      expect(root.findByType(SueReportLocation).props.selectedPosition).toEqual(pin);
    } finally {
      if (tree) act(() => tree?.unmount());
      fetchSpy.mockRestore();
      alertSpy.mockRestore();
      mockUseRealReverse = false;
    }
  }
);

it.each(['pedestrian', 'residential', 'footway', 'cycleway', 'path'])(
  'confirms the precise map pin with a street under %s',
  async (road) => {
    mockUseRealReverse = true;
    jest.useFakeTimers();
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        address: { [road]: 'Koloniestraße', house_number: '2', city: 'Kiel', postcode: '24159' }
      })
    } as Response);
    let tree: renderer.ReactTestRenderer | undefined;
    try {
      await act(async () => {
        tree = renderer.create(<ReportMap />);
      });
      const root = tree?.root;
      if (!root) throw new Error('Map did not render');
      await act(async () => {
        root
          .findByType(Map)
          .props.onPress({ nativeEvent: { lngLat: [pin.longitude, pin.latitude] } });
        await jest.advanceTimersByTimeAsync(50);
      });
      expect(
        mockSelection.getConfirmedLocation({
          street: 'Koloniestraße',
          houseNumber: '2',
          city: 'Kiel',
          postalCode: '24159'
        })?.position
      ).toEqual(pin);
    } finally {
      if (tree) act(() => tree?.unmount());
      fetchSpy.mockRestore();
      mockUseRealReverse = false;
      jest.useRealTimers();
    }
  }
);
