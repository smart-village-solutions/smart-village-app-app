import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

import { LocationOverview } from '../../src/components/map/LocationOverview';
import { klimaTalerMarkerId, offersToMapMarkers } from '../../src/klimaTaler/mapOffers';
import { openKlimaTaler } from '../../src/klimaTaler/entry';

const mockIdle = { phase: 'idle' };
jest.mock('../../src/klimaTaler/entry', () => ({
  openKlimaTaler: jest.fn().mockResolvedValue(undefined),
  klimaTalerEntry: {
    subscribe: () => () => undefined,
    getSnapshot: () => mockIdle
  }
}));

const location = {
  id: 1,
  name: 'Klima Café',
  image: '',
  address: 'Markt 1',
  postal_code: '32756',
  city: 'Detmold',
  type: 'cafe',
  icon_active: 'cafe-active',
  icon_inactive: 'cafe-inactive',
  latitude: 51.938,
  longitude: 8.879,
  distance_km: 0,
  offers: [
    {
      id: 10,
      title: 'Kaffee',
      cost: 2,
      remaining: 5,
      offer_type_id: 2 as const,
      image: null,
      deeplink: 'https://open.klima-taler.com/offers/10'
    },
    {
      id: 11,
      title: 'Kuchen',
      cost: 3,
      remaining: 4,
      offer_type_id: 2 as const,
      image: null,
      deeplink: 'https://open.klima-taler.com/offers/11'
    }
  ]
};
let mockEnabled = true;
let mockLocations = [location];
const mockToggle = jest.fn();
const mockRefetch = jest.fn();
const mockQueries = jest.fn();
const mockMap = jest.fn();
const mockSourceIcon = jest.fn();
jest.mock('../../src/klimaTaler/useMapOffers', () => ({
  useMapOffers: (eligible: boolean) => ({
    enabled: eligible && mockEnabled,
    visible: eligible && mockEnabled,
    configured: true,
    locations: eligible && mockEnabled ? mockLocations : [],
    loading: false,
    error: undefined,
    toggle: mockToggle
  })
}));
jest.mock('../../src/SettingsProvider', () => ({
  SettingsContext: jest
    .requireActual('react')
    .createContext({ globalSettings: { navigation: 'tab' } })
}));
jest.mock('../../src/NetworkProvider', () => ({
  NetworkContext: jest
    .requireActual('react')
    .createContext({ isConnected: true, isMainserverUp: true })
}));
jest.mock('../../src/OrientationProvider', () => ({
  OrientationContext: jest.requireActual('react').createContext({ orientation: 'portrait' })
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ left: 0, right: 0 })
}));
jest.mock('../../src/hooks', () => ({ useLocationSettings: () => ({ locationSettings: {} }) }));
jest.mock('../../src/queries', () => ({
  QUERY_TYPES: {
    POINTS_OF_INTEREST: 'pois',
    POINT_OF_INTEREST: 'poi',
    CATEGORIES_FILTER: 'categories'
  },
  getQuery: (type: string) => type
}));
jest.mock('react-apollo', () => ({
  useQuery: (query: string, options: unknown) => {
    mockQueries(query, options);
    if (query === 'pois')
      return {
        data: {
          pois: [
            {
              id: '1',
              title: 'Our POI',
              addresses: [{ geoLocation: { latitude: 51.94, longitude: 8.88 } }]
            }
          ]
        },
        loading: false,
        refetch: mockRefetch
      };
    if (query === 'poi') return { data: { poi: { id: '1', title: 'Our POI' } }, loading: false };
    return {
      data: {
        categories: [
          { id: '1', name: 'Kultur' },
          { id: '2', name: 'Freizeit' }
        ]
      },
      loading: false
    };
  }
}));
jest.mock('../../src/helpers', () => ({
  graphqlFetchPolicy: () => 'cache-first',
  isOpen: () => ({ open: true }),
  geoLocationFilteredListItem: ({ listItem }: { listItem: unknown }) => listItem,
  parseListItemsFromQuery: (_: unknown, data: { poi: unknown }) => data.poi
}));
jest.mock('../../src/config', () => ({
  consts: { MAP: { DEFAULT_PIN: 'defaultPin' }, a11yLabel: { button: 'Button' } },
  normalize: (value: number) => value,
  device: { height: 900 },
  Icon: {
    NamedIcon: (props: unknown) => {
      mockSourceIcon(props);
      return null;
    }
  },
  IconUrl: () => null
}));
jest.mock('../../src/config/icons/Icon', () => ({ Icon: { NamedIcon: () => null } }));
jest.mock('../../src/components/screens/AvailableVehicles', () => ({
  fetchAvailableVehicles: jest.fn()
}));
jest.mock('../../src/components/map/MapLibre', () => ({
  MapLibre: (props: unknown) => {
    mockMap(props);
    return null;
  }
}));
jest.mock('../../src/components/TextListItem', () => ({
  TextListItem: ({ item }: { item: { title: string; onPress?: () => void } }) => {
    const React = jest.requireActual('react');
    const { Text } = jest.requireActual('react-native');
    return React.createElement(
      Text,
      { onPress: item.onPress, accessibilityRole: 'button' },
      item.title
    );
  }
}));

const rawProps = {
  navigation: { navigate: jest.fn() },
  queryVariables: {},
  route: { params: { includeKlimaTaler: true } }
};
const props = rawProps as unknown as React.ComponentProps<typeof LocationOverview>;
beforeEach(() => {
  jest.clearAllMocks();
  mockEnabled = true;
  mockLocations = [location];
});

test('widget map shows only external POIs and skips backend reads', () => {
  render(<LocationOverview {...props} />);
  const map = mockMap.mock.calls[mockMap.mock.calls.length - 1][0];
  expect(map.locations.map((item: { id: string }) => item.id)).toEqual(['klima-taler:1']);
  expect(map.locations[0].position).toEqual({ latitude: 51.938, longitude: 8.879 });
  expect(offersToMapMarkers([location], 'defaultPin')[0].iconName).toBe('defaultPin');
  expect(mockSourceIcon).toHaveBeenCalledWith(expect.objectContaining({ name: 'leaf' }));
  expect(mockQueries.mock.calls.find(([query]) => query === 'pois')[1].skip).toBe(true);
});

test('external selection uses feed data and never queries the backend with its ID', () => {
  const screen = render(<LocationOverview {...props} />);
  act(() =>
    mockMap.mock.calls[mockMap.mock.calls.length - 1][0].onMarkerPress(klimaTalerMarkerId(1))
  );
  expect(screen.getByText('Klima Café')).toBeTruthy();
  expect(screen.queryByText('Our POI')).toBeNull();
  const requests = mockQueries.mock.calls.filter(([query]) => query === 'poi');
  expect(requests[requests.length - 1][1].skip).toBe(true);
  fireEvent.press(screen.getByText('Klima Café'));
  expect(screen.getByText('Kaffee')).toBeTruthy();
  expect(screen.getByText('Kuchen')).toBeTruthy();
});

test('normal POI selection still uses the existing backend preview', () => {
  const screen = render(<LocationOverview {...props} route={{ ...props.route, params: {} }} />);
  act(() => mockMap.mock.calls[mockMap.mock.calls.length - 1][0].onMarkerPress('1'));
  expect(screen.getByText('Our POI')).toBeTruthy();
  const requests = mockQueries.mock.calls.filter(([query]) => query === 'poi');
  expect(requests[requests.length - 1][1]).toMatchObject({ variables: { id: '1' }, skip: false });
});

test('source chip does not alter backend category filters; disabling the module removes external pins and preview', () => {
  const screen = render(<LocationOverview {...props} />);
  fireEvent.press(screen.getByRole('button', { name: /Klima-Taler/ }));
  expect(mockToggle).toHaveBeenCalledTimes(1);
  expect(mockRefetch).not.toHaveBeenCalled();
  act(() =>
    mockMap.mock.calls[mockMap.mock.calls.length - 1][0].onMarkerPress(klimaTalerMarkerId(1))
  );
  mockEnabled = false;
  screen.rerender(<LocationOverview {...props} />);
  expect(screen.queryByText('Klima Café')).toBeNull();
  expect(mockMap.mock.calls[mockMap.mock.calls.length - 1][0].locations).toHaveLength(0);
});

test('an empty external feed does not fall back to unrelated backend POIs', () => {
  mockLocations = [];
  render(<LocationOverview {...props} />);
  expect(
    mockMap.mock.calls[mockMap.mock.calls.length - 1][0].locations.map(
      (item: { id: string }) => item.id
    )
  ).toEqual([]);
});

test('backend category chips still refetch only backend categories beside the source chip', () => {
  const screen = render(
    <LocationOverview
      {...props}
      route={{ ...props.route, params: {} }}
      queryVariables={{ categoryIds: ['1', '2'] }}
    />
  );
  mockRefetch.mockClear();
  expect(screen.queryByRole('button', { name: /Klima-Taler/ })).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Kultur Button' }));
  expect(mockRefetch).toHaveBeenCalledWith({ limit: undefined, categoryIds: ['2'] });
});

test('ordinary POI maps do not add the external source', () => {
  const screen = render(<LocationOverview {...props} route={{ ...props.route, params: {} }} />);
  expect(screen.queryByRole('button', { name: /Klima-Taler/ })).toBeNull();
  expect(mockMap.mock.calls[mockMap.mock.calls.length - 1][0].locations).toHaveLength(1);
});

test('single-offer preview opens the offer ID, never the location ID or backend detail', () => {
  mockLocations = [{ ...location, offers: [location.offers[0]] }];
  const screen = render(<LocationOverview {...props} />);
  act(() =>
    mockMap.mock.calls[mockMap.mock.calls.length - 1][0].onMarkerPress(klimaTalerMarkerId(1))
  );
  expect(openKlimaTaler).not.toHaveBeenCalled();
  fireEvent.press(screen.getByText('Klima Café'));
  expect(openKlimaTaler).toHaveBeenCalledWith(10);
  expect(rawProps.navigation.navigate).not.toHaveBeenCalled();
  expect(screen.queryByText('Markt 1 32756 Detmold')).toBeNull();
});

test('multiple offers require an explicit selection and retain the map preview on return', () => {
  const screen = render(<LocationOverview {...props} />);
  act(() =>
    mockMap.mock.calls[mockMap.mock.calls.length - 1][0].onMarkerPress(klimaTalerMarkerId(1))
  );
  fireEvent.press(screen.getByText('Klima Café'));
  expect(openKlimaTaler).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Kuchen, Angebot in Klima-Taler öffnen' }));
  expect(openKlimaTaler).toHaveBeenCalledWith(11);
  screen.rerender(<LocationOverview {...props} />);
  expect(screen.getByText('Klima Café')).toBeTruthy();
});
