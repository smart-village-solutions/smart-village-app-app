import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { LocationOverview } from '../../src/components/map/LocationOverview';
import { MapPreview } from '../../src/components/map/MapPreview';
import { klimaTalerMarkerId, offersToMapMarkers } from '../../src/klimaTaler/mapOffers';
import { openKlimaTaler } from '../../src/klimaTaler/entry';

let mockEntryState = { phase: 'idle' };
const mockEntryListeners = new Set<() => void>();
jest.mock('../../src/klimaTaler/entry', () => ({
  openKlimaTaler: jest.fn().mockResolvedValue(undefined),
  klimaTalerEntry: {
    subscribe: (listener: () => void) => {
      mockEntryListeners.add(listener);
      return () => {
        mockEntryListeners.delete(listener);
      };
    },
    getSnapshot: () => mockEntryState
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
let mockOffersError: Error | undefined;
let mockLocations = [location];
const mockToggle = jest.fn();
const mockRefetch = jest.fn();
const mockQueries = jest.fn();
const mockMap = jest.fn();
const mockMapMount = jest.fn();
const mockMapUnmount = jest.fn();
let mockPoiLoading = false;
let mockPoiDataAvailable = true;
const mockDefaultPois = [
  {
    id: '1',
    title: 'Our POI',
    addresses: [{ geoLocation: { latitude: 51.94, longitude: 8.88 } }]
  }
];
let mockPois = mockDefaultPois;
const mockPreviewRows = jest.fn();
const mockSourceIcon = jest.fn();
const mockIconUrl = jest.fn();
jest.mock('../../src/klimaTaler/useMapOffers', () => ({
  useMapOffers: (eligible: boolean) => ({
    enabled: eligible && mockEnabled,
    visible: eligible && mockEnabled,
    configured: true,
    locations: eligible && mockEnabled ? mockLocations : [],
    loading: false,
    error: mockOffersError,
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
jest.mock('../../src/queries/categories', () => ({ GET_MAP_POI_CATEGORIES: 'allPoiCategories' }));
jest.mock('react-apollo', () => ({
  useQuery: (query: string, options: unknown) => {
    mockQueries(query, options);
    if (query === 'pois')
      return {
        data: mockPoiDataAvailable ? { pois: mockPois } : undefined,
        loading: mockPoiLoading,
        refetch: mockRefetch
      };
    if (query === 'allPoiCategories')
      return {
        data: {
          categories: [
            { id: '1', name: 'Kultur', pointsOfInterestTreeCount: 3 },
            { id: '2', name: 'Freizeit', pointsOfInterestTreeCount: 2 },
            { id: '6013', name: 'Klima-Taler', pointsOfInterestTreeCount: 0 },
            { id: '999', name: 'News only', pointsOfInterestTreeCount: 0 }
          ]
        },
        loading: false
      };
    if (query === 'poi') return { data: { poi: { id: '1', title: 'Our POI' } }, loading: false };
    return {
      data: {
        categories: [
          { id: '1', name: 'Kultur' },
          { id: '2', name: 'Freizeit', iconName: 'unsupported-icon' }
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
  IconUrl: (props: unknown) => {
    mockIconUrl(props);
    return null;
  }
}));
jest.mock('../../src/config/icons/Icon', () => ({ Icon: { NamedIcon: () => null } }));
jest.mock('../../src/components/screens/AvailableVehicles', () => ({
  fetchAvailableVehicles: jest.fn()
}));
jest.mock('../../src/components/map/MapLibre', () => ({
  MapLibre: (props: unknown) => {
    jest.requireActual('react').useEffect(() => {
      mockMapMount();
      return () => mockMapUnmount();
    }, []);
    mockMap(props);
    return null;
  }
}));
jest.mock('../../src/components/TextListItem', () => ({
  TextListItem: (props: {
    item: { title: string; accessibilityLabel?: string; onPress?: () => void };
  }) => {
    mockPreviewRows(props);
    const { item } = props;
    const React = jest.requireActual('react');
    const { Text } = jest.requireActual('react-native');
    return React.createElement(
      Text,
      {
        onPress: item.onPress,
        accessibilityRole: 'button',
        accessibilityLabel: item.accessibilityLabel
      },
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
  mockEntryState = { phase: 'idle' };
  mockEntryListeners.clear();
  mockEnabled = true;
  mockOffersError = undefined;
  mockLocations = [location];
  mockPoiLoading = false;
  mockPoiDataAvailable = true;
  mockPois = mockDefaultPois;
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

test('category chips omit missing icons and suppress placeholders for unavailable SVGs', () => {
  render(
    <LocationOverview
      {...props}
      route={{ ...props.route, params: {} }}
      queryVariables={{ categoryIds: ['1', '2'] }}
    />
  );
  expect(mockIconUrl).toHaveBeenCalled();
  expect(
    mockIconUrl.mock.calls.every(
      ([icon]) => icon.iconName === 'unsupported-icon' && icon.fallback === null
    )
  ).toBe(true);
});

test.each([false, true])(
  'ordinary category maps preserve existing scope when KT is enabled=%s',
  (enabled) => {
    mockEnabled = enabled;
    const queryVariables = { categoryIds: ['1', '2'], dataProviderId: '42' };
    const screen = render(
      <LocationOverview
        {...props}
        route={{ ...props.route, params: {} }}
        queryVariables={queryVariables}
      />
    );
    expect(mockQueries.mock.calls.find(([query]) => query === 'pois')[1]).toMatchObject({
      skip: false,
      variables: queryVariables
    });
    expect(mockQueries).toHaveBeenCalledWith(
      'categories',
      expect.objectContaining({ variables: { ids: ['1', '2'] }, skip: false })
    );
    expect(mockQueries.mock.calls.some(([query]) => query === 'allPoiCategories')).toBe(false);
    expect(
      screen.getByRole('button', { name: 'Kultur Button' }).props.accessibilityState.selected
    ).toBe(true);
    expect(
      screen.getByRole('button', { name: 'Freizeit Button' }).props.accessibilityState.selected
    ).toBe(true);
    expect(screen.queryByRole('button', { name: /Klima-Taler/ })).toBeNull();
    expect(mockMap.mock.calls.at(-1)[0].locations.map((item: { id: string }) => item.id)).toEqual([
      '1'
    ]);
    mockRefetch.mockClear();
    fireEvent.press(screen.getByRole('button', { name: 'Kultur Button' }));
    expect(mockRefetch).toHaveBeenCalledWith({ limit: undefined, categoryIds: ['2'] });
    expect(openKlimaTaler).not.toHaveBeenCalled();
  }
);

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

test.each([
  { single: true, stale: false },
  { single: true, stale: true },
  { single: false, stale: false },
  { single: false, stale: true }
])('opening a provider offer keeps preview content stable: %p', ({ single, stale }) => {
  mockOffersError = stale ? new Error('Temporary feed failure') : undefined;
  mockLocations = [{ ...location, offers: single ? [location.offers[0]] : location.offers }];
  const announce = jest
    .spyOn(AccessibilityInfo, 'announceForAccessibility')
    .mockImplementation(() => undefined);
  try {
    const screen = render(<LocationOverview {...props} />);
    act(() => mockMap.mock.calls.at(-1)[0].onMarkerPress(klimaTalerMarkerId(1)));
    // Cover both a single-offer card and the intentionally expanded offer chooser.
    if (!single) fireEvent.press(screen.getByText('Klima Café'));
    const preview = () => screen.UNSAFE_getByType(MapPreview);
    const layoutContent = () =>
      React.Children.toArray(preview().props.children).map((child) =>
        React.isValidElement(child) ? child.type : child
      );
    const content = layoutContent();
    const item = preview().props.item;
    fireEvent.press(screen.getByText(single ? 'Klima Café' : 'Kuchen'));
    expect(openKlimaTaler).toHaveBeenCalledWith(single ? 10 : 11);
    act(() => {
      mockEntryState = { phase: 'opening' };
      mockEntryListeners.forEach((listener) => listener());
    });
    expect(layoutContent()).toEqual(content);
    expect(preview().props.item).toMatchObject({
      title: item.title,
      subtitle: item.subtitle,
      picture: item.picture
    });
    expect(preview().props.disabled).toBe(true);
    expect(screen.queryByText('Klima-Taler wird geöffnet …')).toBeNull();
    expect(announce).toHaveBeenCalledWith('Klima-Taler wird geöffnet …');
    fireEvent.press(screen.getByText(single ? 'Klima Café' : 'Kuchen'));
    expect(openKlimaTaler).toHaveBeenCalledTimes(1);
    act(() => {
      mockEntryState = { phase: 'error' };
      mockEntryListeners.forEach((listener) => listener());
    });
    expect(layoutContent()).toEqual(content);
    fireEvent.press(screen.getByText(single ? 'Klima Café' : 'Kuchen'));
    expect(openKlimaTaler).toHaveBeenCalledTimes(2);
  } finally {
    announce.mockRestore();
  }
});

test('multiple offers require an explicit selection and retain the map preview on return', () => {
  const screen = render(<LocationOverview {...props} />);
  act(() =>
    mockMap.mock.calls[mockMap.mock.calls.length - 1][0].onMarkerPress(klimaTalerMarkerId(1))
  );
  fireEvent.press(screen.getByText('Klima Café'));
  expect(openKlimaTaler).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: /Kuchen, .*Angebot in Klima-Taler öffnen/ }));
  expect(openKlimaTaler).toHaveBeenCalledWith(11);
  screen.rerender(<LocationOverview {...props} />);
  expect(screen.getByText('Klima Café')).toBeTruthy();
});

test.each([0, 9, 10, 11, 50])(
  'offer rows show their image and cap availability at 10+ (%i)',
  (remaining) => {
    mockLocations = [
      {
        ...location,
        offers: [
          { ...location.offers[0], remaining, image: 'https://example.org/coffee.jpg' },
          location.offers[1]
        ]
      }
    ];
    const screen = render(<LocationOverview {...props} />);
    act(() =>
      mockMap.mock.calls[mockMap.mock.calls.length - 1][0].onMarkerPress(klimaTalerMarkerId(1))
    );
    fireEvent.press(screen.getByText('Klima Café'));
    const row = mockPreviewRows.mock.calls.map(([p]) => p).find((p) => p.item.title === 'Kaffee');
    expect(row.item.picture).toEqual({ url: 'https://example.org/coffee.jpg' });
    expect(row.leftImage).toBe(true);
    expect(row.item.subtitle).toBe(
      `2 Klima-Taler · ${remaining > 10 ? '10+' : remaining} verfügbar`
    );
    fireEvent.press(screen.getByText('Kaffee'));
    expect(openKlimaTaler).toHaveBeenCalledWith(10);
  }
);

test('single-offer preview prefers the offer image and falls back to the partner image', () => {
  mockLocations = [
    {
      ...location,
      image: 'https://example.org/partner.jpg',
      offers: [{ ...location.offers[0], image: 'https://example.org/offer.jpg', remaining: 50 }]
    }
  ];
  const screen = render(<LocationOverview {...props} />);
  act(() =>
    mockMap.mock.calls[mockMap.mock.calls.length - 1][0].onMarkerPress(klimaTalerMarkerId(1))
  );
  expect(mockPreviewRows.mock.calls.at(-1)?.[0].item).toMatchObject({
    picture: { url: 'https://example.org/offer.jpg' },
    subtitle: 'Kaffee\n2 Klima-Taler · 10+ verfügbar'
  });
  mockLocations = [{ ...mockLocations[0], offers: [{ ...location.offers[0], image: null }] }];
  screen.rerender(<LocationOverview {...props} />);
  expect(mockPreviewRows.mock.calls.at(-1)?.[0].item.picture).toEqual({
    url: 'https://example.org/partner.jpg'
  });
});

test('imported KT mode reads filtered Mainserver POIs and uses the ordinary backend preview', () => {
  const screen = render(
    <LocationOverview
      {...props}
      route={{ ...props.route, params: { includeKlimaTaler: false } }}
      queryVariables={{ dataProviderId: '601', categoryId: '6013' }}
    />
  );
  expect(mockQueries.mock.calls.find(([query]) => query === 'pois')[1]).toMatchObject({
    skip: false,
    variables: { dataProviderId: '601', categoryId: '6013' }
  });
  const map = mockMap.mock.calls.at(-1)[0];
  expect(map.locations.map((item: { id: string }) => item.id)).toEqual(['1']);
  act(() => map.onMarkerPress('1'));
  expect(screen.getByText('Our POI')).toBeTruthy();
  expect(screen.queryByText('Klima Café')).toBeNull();
  expect(openKlimaTaler).not.toHaveBeenCalled();
});

test('widget map exposes other POI categories with only KT initially selected', () => {
  const screen = render(
    <LocationOverview
      {...props}
      route={{ ...props.route, params: { includeKlimaTaler: false, showAllPoiCategories: true } }}
      queryVariables={{ categoryIds: ['6013'] }}
    />
  );
  expect(mockQueries.mock.calls.find(([q]) => q === 'pois')[1]).toMatchObject({
    skip: false,
    variables: { categoryIds: ['6013'] }
  });
  expect(mockQueries.mock.calls.find(([q]) => q === 'pois')[1].variables).not.toHaveProperty(
    'dataProviderId'
  );
  expect(mockQueries.mock.calls.find(([q]) => q === 'allPoiCategories')[1]).toMatchObject({
    skip: false,
    variables: {}
  });
  expect(
    screen.getByRole('button', { name: 'Klima-Taler Button' }).props.accessibilityState.selected
  ).toBe(true);
  expect(
    screen.getByRole('button', { name: 'Kultur Button' }).props.accessibilityState.selected
  ).toBe(false);
  expect(screen.getByRole('button', { name: 'Freizeit Button' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'News only Button' })).toBeNull();
  expect(screen.getAllByRole('button')[0].props.accessibilityLabel).toBe('Klima-Taler Button');
  mockRefetch.mockClear();
  fireEvent.press(screen.getByRole('button', { name: 'Kultur Button' }));
  expect(
    mockQueries.mock.calls.filter(([q]) => q === 'pois').at(-1)[1].variables.categoryIds
  ).toEqual(['6013', '1']);
  fireEvent.press(screen.getByRole('button', { name: 'Klima-Taler Button' }));
  expect(
    mockQueries.mock.calls.filter(([q]) => q === 'pois').at(-1)[1].variables.categoryIds
  ).toEqual(['1']);
  fireEvent.press(screen.getByRole('button', { name: 'Kultur Button' }));
  expect(
    mockQueries.mock.calls.filter(([q]) => q === 'pois').at(-1)[1].variables.categoryIds
  ).toEqual([]);
  expect(mockRefetch).not.toHaveBeenCalled();
  expect(openKlimaTaler).not.toHaveBeenCalled();
});

test('widget map waits for the first POI result before mounting the map', () => {
  mockPoiLoading = true;
  mockPoiDataAvailable = false;
  const screen = render(
    <LocationOverview
      {...props}
      route={{ ...props.route, params: { showAllPoiCategories: true } }}
      queryVariables={{ categoryIds: ['6013'] }}
    />
  );
  expect(mockMapMount).not.toHaveBeenCalled();
  expect(screen.getByRole('progressbar')).toBeTruthy();
});

test.each([
  { name: 'empty', pois: [] },
  { name: 'populated', pois: mockDefaultPois }
])(
  'widget category changes preserve the mounted map through loading and $name results',
  ({ pois: nextPois }) => {
    const mapProps = {
      ...props,
      route: { ...props.route, params: { showAllPoiCategories: true } },
      queryVariables: { categoryIds: ['6013'] }
    };
    const screen = render(<LocationOverview {...mapProps} />);
    expect(mockMapMount).toHaveBeenCalledTimes(1);

    mockPoiLoading = true;
    fireEvent.press(screen.getByRole('button', { name: 'Kultur Button' }));
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Kultur Button' }).props.accessibilityState.selected
    ).toBe(true);
    expect(mockMapUnmount).not.toHaveBeenCalled();
    expect(mockMapMount).toHaveBeenCalledTimes(1);

    mockPoiLoading = false;
    mockPois = nextPois;
    screen.rerender(<LocationOverview {...mapProps} />);
    expect(mockMap.mock.calls.at(-1)[0].locations).toHaveLength(nextPois.length);
    expect(mockMapUnmount).not.toHaveBeenCalled();
    expect(mockMapMount).toHaveBeenCalledTimes(1);

    mockPoiLoading = true;
    fireEvent.press(screen.getByRole('button', { name: 'Klima-Taler Button' }));
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(mockMapUnmount).not.toHaveBeenCalled();
    expect(mockMapMount).toHaveBeenCalledTimes(1);
    expect(mockRefetch).not.toHaveBeenCalled();
  }
);

test('ordinary map loading behavior is unchanged without the widget map option', () => {
  mockPoiLoading = true;
  const screen = render(<LocationOverview {...props} route={{ ...props.route, params: {} }} />);
  expect(mockMapMount).not.toHaveBeenCalled();
  expect(screen.getByRole('progressbar')).toBeTruthy();
});
