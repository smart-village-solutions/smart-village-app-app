import React from 'react';
import { fireEvent, render, act } from '@testing-library/react-native';
import { View } from 'react-native';
import type { LocationObjectCoords } from 'expo-location';

import { MapLibre } from '../../../src/components/map/MapLibre';
import type { LocationSettings } from '../../../src/types/LocationSettings';

const mockSetStop = jest.fn();
const mockLivePosition = jest.fn();
let mockLocationSettings: LocationSettings;
let mockMarkerImages: Record<string, { uri: string }>;
const device = { coords: { latitude: 52, longitude: 13 } };
const alternative = { coords: { latitude: 51, longitude: 9 } };

jest.mock('@maplibre/maplibre-react-native', () => {
  const ReactLocal = jest.requireActual('react');
  const { View: ViewLocal } = jest.requireActual('react-native');
  const container = ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <ViewLocal {...props}>{children}</ViewLocal>
  );
  return {
    Map: container,
    Camera: ReactLocal.forwardRef((props: Record<string, unknown>, ref: React.Ref<unknown>) => {
      ReactLocal.useImperativeHandle(ref, () => ({ setStop: mockSetStop }));
      return <ViewLocal testID="camera" {...props} />;
    }),
    GeoJSONSource: container,
    Layer: container,
    Images: () => null,
    ViewAnnotation: container,
    NativeUserLocation: () => <ViewLocal testID="native-location" />,
    useCurrentPosition: (options: unknown) => mockLivePosition(options)
  };
});
jest.mock('expo-router/js-tabs', () => ({ useBottomTabBarHeight: () => 0 }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, top: 0, left: 0, right: 0 })
}));
jest.mock('../../../src/SettingsProvider', () => ({
  SettingsContext: jest
    .requireActual('react')
    .createContext({ globalSettings: { settings: { locationService: {} } } })
}));
jest.mock('../../../src/hooks', () => ({
  useLocationSettings: () => ({ locationSettings: mockLocationSettings }),
  useMapFeatureConfig: () => ({
    markerImages: mockMarkerImages,
    loading: false,
    layerStyles: { singleIcon: { iconSize: 1, iconAnchor: 'bottom' } },
    zoomLevel: {}
  })
}));
jest.mock('../../../src/helpers', () => ({
  getBounds: jest.fn(),
  truncateText: (text: string) => text
}));
jest.mock('../../../src/config', () => ({
  consts: {
    MAP: { OWN_LOCATION_PIN: 'ownLocationPin', DEFAULT_PIN: 'defaultPin' },
    a11yLabel: { button: 'Button' }
  },
  texts: { components: { map: 'Karte' } },
  normalize: (n: number) => n,
  Icon: { GPS: () => null }
}));
jest.mock('../../../src/components/Text', () => ({
  BoldText: () => null,
  RegularText: () => null
}));
jest.mock('../../../src/components/LoadingSpinner', () => ({ LoadingSpinner: () => null }));

const referencePins = (screen: ReturnType<typeof render>) =>
  screen.UNSAFE_getAllByType(View).find((node) => node.props.id === 'new-pins')?.props.data
    .features || [];

beforeEach(() => {
  jest.clearAllMocks();
  mockMarkerImages = {
    ownLocationPin: { uri: 'https://example.org/own.png' },
    defaultPinActive: { uri: 'https://example.org/poi.png' }
  };
  mockLocationSettings = {
    locationService: true,
    alternativePosition: alternative as LocationSettings['alternativePosition']
  };
  mockLivePosition.mockReturnValue(device);
});

test('GPS uses the configured own icon, updates live and does not draw the saved alternative or blue puck', async () => {
  const screen = render(<MapLibre locations={[]} />);
  expect(screen.queryByTestId('native-location')).toBeNull();
  expect(referencePins(screen)).toMatchObject([
    { properties: { iconName: 'ownLocationPin' }, geometry: { coordinates: [13, 52] } }
  ]);
  mockLivePosition.mockReturnValue({ coords: { latitude: 53, longitude: 14 } });
  screen.rerender(<MapLibre locations={[]} />);
  expect(referencePins(screen)).toHaveLength(1);
  expect(referencePins(screen)[0].geometry.coordinates).toEqual([14, 53]);
  await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Karte Button' })));
  expect(mockSetStop).toHaveBeenLastCalledWith(expect.objectContaining({ center: [14, 53] }));
  expect(screen.getByTestId('camera').props.trackUserLocation).toBeUndefined();
});

test('switching GPS off and on switches the reference without deleting the saved alternative', () => {
  const screen = render(<MapLibre locations={[]} />);
  mockLocationSettings = { ...mockLocationSettings, locationService: false };
  screen.rerender(<MapLibre locations={[]} />);
  expect(mockLivePosition).toHaveBeenLastCalledWith({ enabled: false });
  expect(referencePins(screen)).toMatchObject([
    { properties: { iconName: 'ownLocationPin' }, geometry: { coordinates: [9, 51] } }
  ]);
  mockLocationSettings = { ...mockLocationSettings, locationService: true };
  mockLivePosition.mockReturnValue(undefined);
  screen.rerender(<MapLibre locations={[]} />);
  expect(referencePins(screen)).toEqual([]);
  expect(mockLocationSettings.alternativePosition).toBe(alternative);
});

test('the configured default is used when GPS is off and no manual position is saved', () => {
  mockLocationSettings = {
    locationService: false,
    defaultAlternativePosition: alternative as LocationSettings['defaultAlternativePosition']
  };
  const screen = render(<MapLibre locations={[]} />);
  expect(referencePins(screen)[0].geometry.coordinates).toEqual([9, 51]);
});

test('content location selection retains its own active pin; alternative-location editing explicitly uses the own icon', () => {
  const selectedPosition = alternative.coords as LocationObjectCoords;
  const screen = render(
    <MapLibre locations={[]} selectedPosition={selectedPosition} setPinEnabled />
  );
  expect(
    referencePins(screen).find(
      (pin: GeoJSON.Feature<GeoJSON.Point>) => pin.properties?.id === 'selected-position-pin'
    ).properties.iconName
  ).toBe('defaultPinActive');
  screen.rerender(
    <MapLibre
      locations={[]}
      selectedPosition={selectedPosition}
      setPinEnabled
      selectedPositionIsOwnLocation
    />
  );
  expect(
    referencePins(screen).find(
      (pin: GeoJSON.Feature<GeoJSON.Point>) => pin.properties?.id === 'selected-position-pin'
    ).properties.iconName
  ).toBe('ownLocationPin');
});

test('instances without a custom own icon retain the native GPS display', () => {
  mockMarkerImages = {};
  const screen = render(<MapLibre locations={[]} />);
  expect(screen.getByTestId('native-location')).toBeTruthy();
  expect(mockLivePosition).toHaveBeenLastCalledWith({ enabled: false });
});

test('instances without a custom own icon retain their alternative-location marker', () => {
  mockMarkerImages = {};
  mockLocationSettings.locationService = false;
  const screen = render(<MapLibre locations={[]} />);
  expect(referencePins(screen)).toMatchObject([
    { properties: { iconName: 'defaultPinActive' }, geometry: { coordinates: [9, 51] } }
  ]);
});

test('an explicit location-display opt-out hides GPS and fallback markers', () => {
  const screen = render(<MapLibre locations={[]} showsUserLocation={false} />);
  expect(screen.queryByTestId('native-location')).toBeNull();
  expect(referencePins(screen)).toEqual([]);
  expect(mockLivePosition).toHaveBeenLastCalledWith({ enabled: false });
  mockLocationSettings.locationService = false;
  screen.rerender(<MapLibre locations={[]} showsUserLocation={false} />);
  expect(referencePins(screen)).toEqual([]);
});

test('the location button centers the alternative without starting GPS tracking', async () => {
  mockLocationSettings.locationService = false;
  const screen = render(<MapLibre locations={[]} />);
  await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Karte Button' })));
  expect(mockSetStop).toHaveBeenLastCalledWith(expect.objectContaining({ center: [9, 51] }));
  expect(screen.getByTestId('camera').props.trackUserLocation).toBeUndefined();
});
