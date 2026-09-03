/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, View } from 'react-native';

import { darkColors } from '../../src/config/colors';
import { ParticipationProjectMapScreen } from '../../src/screens/ParticipationProject/ParticipationProjectMapScreen';
import { ThemeContext } from '../../src/ThemeContext';
import { ScreenName } from '../../src/types';

const DETAIL_ROUTE_NAME = 'Detail';
const mockFilter = jest.fn();
const mockTextListItem = jest.fn();
const mockGeoLocationFilteredListItem = jest.fn(({ listItem }) => listItem);
const mockCurrentPosition = {
  coords: { latitude: 52.1, longitude: 11.6 }
};

jest.mock('../../src/helpers', () => ({
  geoLocationFilteredListItem: (args) => mockGeoLocationFilteredListItem(args)
}));

jest.mock('../../src/hooks', () => ({
  useLastKnownPosition: jest.fn(() => ({ position: undefined })),
  useLocationSettings: jest.fn(() => ({ locationSettings: { locationService: true } })),
  usePosition: jest.fn(() => ({ position: mockCurrentPosition })),
  useSystemPermission: jest.fn(() => ({ status: 'granted' }))
}));

jest.mock('react-query', () => ({
  useQuery: jest.fn()
}));

jest.mock('../../src/ReactQueryClient', () => ({
  ReactQueryClient: jest.fn()
}));

jest.mock('../../src/queries', () => ({
  QUERY_TYPES: {
    GENERIC_ITEMS: 'genericItems'
  },
  getQuery: jest.fn()
}));

jest.mock('../../src/helpers/participationProjectHelper', () => ({
  PARTICIPATION_PROJECT_DEFAULT_STATUSES: ['active', 'announced'],
  PARTICIPATION_PROJECT_FILTER_CHANGED_EVENT: 'participationProjectFilterChanged',
  PARTICIPATION_PROJECT_STATUS_FILTER: 'participationStatus',
  PARTICIPATION_PROJECT_STATUS_POSITION_PARAM: 'participationStatusPosition',
  buildParticipationProjectPreviewItem: jest.fn((item, options) => ({
    accessibilityLabel: `${item.title} button`,
    bottomDivider: false,
    id: item.id,
    params: {
      details: item,
      query: 'genericItem',
      queryVariables: { id: item.id },
      rootRouteName: options?.rootRouteName,
      title: 'Beteiligungsprojekt'
    },
    picture: { url: 'https://example.com/image.jpg' },
    routeName: DETAIL_ROUTE_NAME,
    subtitle: 'Kurzbeschreibung',
    title: item.title
  })),
  getParticipationProjectRadiusFilter: jest.fn(() => ({
    currentPosition: {
      label: 'Umkreis',
      placeholder: 'Aktuelle Position nutzen'
    },
    data: [1, 5, 10],
    label: 'Entfernung (km)',
    name: 'radiusSearch',
    placeholder: 'Entfernung wählen',
    type: 'slider'
  })),
  getParticipationProjectGeoLocation: jest.fn(
    (item) => item.locations?.[0]?.geoLocation || item.addresses?.[0]?.geoLocation
  ),
  isParticipationProjectMapEligible: jest.fn(
    (item) => !!(item.locations?.[0]?.geoLocation || item.addresses?.[0]?.geoLocation)
  ),
  isParticipationProjectStatus: jest.fn(
    (item, status) => item.payload?.status?.trim().toLowerCase() === status
  ),
  normalizeParticipationProjectStatusPosition: jest.fn(() => 'between')
}));

const mockMapLibre = jest.fn();

jest.mock('../../src/components', () => {
  const React = require('react');
  const { Text, View } = require('react-native');

  return {
    EmptyMessage: ({ showIcon, title }) => (
      <View testID="empty-message">
        {!!showIcon && <Text testID="empty-message-icon">icon</Text>}
        <Text>{title}</Text>
      </View>
    ),
    Filter: (props) => {
      mockFilter(props);
      const radiusFilter = props.filterTypes?.find(({ name }) => name === 'radiusSearch');

      return radiusFilter ? <Text testID="map-radius-filter">{radiusFilter.label}</Text> : null;
    },
    HeaderLeft: ({ backImage, onPress }) => (
      <Text testID="header-left" onPress={onPress}>
        {backImage ? 'custom' : 'back'}
      </Text>
    ),
    LoadingSpinner: ({ loading }) =>
      loading ? <Text testID="loading-spinner">loading</Text> : null,
    MapLibre: (props) => {
      mockMapLibre(props);

      return <View testID="maplibre" />;
    },
    TextListItem: (props) => {
      mockTextListItem(props);

      const { item, navigation } = props;

      return (
        <Text
          testID="preview-card"
          onPress={() => navigation.navigate(item.routeName, item.params)}
        >
          {item.title}
        </Text>
      );
    },
    Wrapper: ({ children }) => <View>{children}</View>
  };
});

jest.mock('../../src/config', () => ({
  colors: {
    shadowRgba: 'rgba(0,0,0,0.2)',
    surface: '#ffffff'
  },
  consts: {
    MAP: {
      DEFAULT_PIN: 'defaultPin'
    }
  },
  Icon: {
    Close: () => null
  },
  normalize: (value: number) => value,
  texts: {
    empty: {
      list: 'Schade, es wurden keine passenden Einträge gefunden.'
    },
    locationOverview: {
      map: 'Kartenansicht'
    }
  }
}));

const { useQuery } = jest.requireMock('react-query') as {
  useQuery: jest.Mock;
};

const buildItem = ({
  id,
  position,
  status
}: {
  id: string;
  position?: { latitude: number; longitude: number };
  status?: string;
}) => ({
  id,
  locations: position ? [{ geoLocation: position }] : [],
  payload: { status },
  title: `Projekt ${id}`
});

describe('ParticipationProjectMapScreen', () => {
  beforeEach(() => {
    mockMapLibre.mockReset();
    mockFilter.mockReset();
    mockTextListItem.mockReset();
    mockGeoLocationFilteredListItem.mockClear();
    mockGeoLocationFilteredListItem.mockImplementation(({ listItem }) => listItem);
    useQuery.mockReset();
  });

  it('renders markers only for current items with geo coordinates and opens the detail preview', () => {
    useQuery.mockReturnValue({
      data: {
        genericItems: [
          buildItem({
            id: 'active-1',
            position: { latitude: 52.1, longitude: 11.6 },
            status: 'active'
          }),
          buildItem({
            id: 'announced-1',
            position: { latitude: 52.15, longitude: 11.65 },
            status: 'announced'
          }),
          buildItem({
            id: 'inactive-1',
            position: { latitude: 52.2, longitude: 11.7 },
            status: 'Inaktiv'
          }),
          buildItem({
            id: 'active-without-geo',
            status: 'Aktiv'
          })
        ]
      },
      isLoading: false
    });

    const navigation = {
      goBack: jest.fn(),
      navigate: jest.fn(),
      setOptions: jest.fn()
    };

    const route = {
      params: {
        queryVariables: {
          categoryId: '7',
          participationStatus: ['active', 'announced']
        },
        rootRouteName: 'participation-projects',
        title: 'Aktive Projekte'
      }
    };

    const screen = render(
      <ParticipationProjectMapScreen navigation={navigation as never} route={route as never} />
    );

    expect(screen.getByTestId('maplibre')).toBeTruthy();
    expect(screen.getByTestId('map-radius-filter')).toHaveTextContent('Entfernung (km)');
    expect(mockMapLibre).toHaveBeenCalledWith(
      expect.objectContaining({
        locations: [
          expect.objectContaining({
            activeIconName: 'defaultPinActive',
            iconName: 'defaultPin',
            id: 'active-1'
          }),
          expect.objectContaining({
            activeIconName: 'defaultPinActive',
            iconName: 'defaultPin',
            id: 'announced-1'
          })
        ],
        initialBounds: [11.575, 52.075, 11.675, 52.175],
        isMyLocationButtonVisible: true,
        onMapReady: expect.any(Function),
        selectedMarker: undefined
      })
    );
    expect(screen.getByTestId('loading-spinner')).toBeTruthy();

    act(() => {
      mockMapLibre.mock.calls[0][0].onMapReady();
    });

    expect(screen.queryByTestId('loading-spinner')).toBeNull();

    act(() => {
      mockMapLibre.mock.calls[0][0].onMarkerPress('active-1');
    });

    expect(mockTextListItem).toHaveBeenLastCalledWith(
      expect.objectContaining({
        containerStyle: expect.objectContaining({ alignItems: 'stretch' }),
        imageContainerStyle: expect.objectContaining({
          alignSelf: 'stretch',
          overflow: 'hidden',
          width: 96
        }),
        imageStyle: expect.objectContaining({
          height: '100%',
          width: 96
        }),
        imageContentPosition: 'left center',
        item: expect.objectContaining({
          picture: { url: 'https://example.com/image.jpg' },
          title: 'Projekt active-1'
        }),
        leftImage: true,
        listsWithoutArrows: true,
        noSubtitle: true
      })
    );
    expect(screen.getByText('Projekt active-1')).toBeTruthy();
    fireEvent.press(screen.getByTestId('preview-card'));

    expect(navigation.navigate).toHaveBeenCalledWith(ScreenName.Detail, {
      details: expect.objectContaining({ id: 'active-1' }),
      query: 'genericItem',
      queryVariables: { id: 'active-1' },
      rootRouteName: 'participation-projects',
      title: 'Beteiligungsprojekt'
    });
    expect(useQuery.mock.calls[0][0][1]).not.toHaveProperty('participationStatus');
  });

  it('uses the active theme surface for the map loading overlay', () => {
    useQuery.mockReturnValue({
      data: {
        genericItems: [
          buildItem({
            id: 'active-dark-mode',
            position: { latitude: 52.1, longitude: 11.6 },
            status: 'active'
          })
        ]
      },
      isLoading: false
    });

    const screen = render(
      <ThemeContext.Provider value={{ colors: darkColors, isDark: true, mode: 'dark' }}>
        <ParticipationProjectMapScreen
          navigation={{ goBack: jest.fn(), navigate: jest.fn(), setOptions: jest.fn() } as never}
          route={{ params: {} } as never}
        />
      </ThemeContext.Provider>
    );
    const usesDarkSurface = screen
      .UNSAFE_getAllByType(View)
      .some((view) => StyleSheet.flatten(view.props.style)?.backgroundColor === darkColors.surface);

    expect(usesDarkSurface).toBe(true);
  });

  it('renders the empty state and wires the standard back button to goBack', () => {
    useQuery.mockReturnValue({
      data: {
        genericItems: [buildItem({ id: 'without-geo', status: 'Inaktiv' })]
      },
      isLoading: false
    });

    const navigation = {
      goBack: jest.fn(),
      navigate: jest.fn(),
      setOptions: jest.fn()
    };

    const screen = render(
      <ParticipationProjectMapScreen
        navigation={navigation as never}
        route={{ params: { title: 'Kartenansicht' } } as never}
      />
    );

    const options = navigation.setOptions.mock.calls[0][0];
    const { getByTestId } = render(options.headerLeft());

    expect(options.title).toBe('Kartenansicht');
    expect(screen.getByTestId('empty-message')).toBeTruthy();
    expect(screen.getByTestId('empty-message-icon')).toBeTruthy();
    expect(screen.getByText('Schade, es wurden keine passenden Einträge gefunden.')).toBeTruthy();
    expect(
      StyleSheet.flatten(screen.getByTestId('participation-map-empty-state').props.style)
    ).toEqual(expect.objectContaining({ paddingHorizontal: 16 }));
    expect(getByTestId('header-left')).toHaveTextContent('back');

    fireEvent.press(getByTestId('header-left'));
    expect(navigation.goBack).toHaveBeenCalledTimes(1);
  });

  it('renders completed projects when the status is selected in the list filter', () => {
    useQuery.mockReturnValue({
      data: {
        genericItems: [
          buildItem({
            id: 'completed-1',
            position: { latitude: 52.1, longitude: 11.6 },
            status: 'completed'
          })
        ]
      },
      isLoading: false
    });

    const navigation = {
      goBack: jest.fn(),
      navigate: jest.fn(),
      setOptions: jest.fn()
    };

    render(
      <ParticipationProjectMapScreen
        navigation={navigation as never}
        route={
          {
            params: {
              queryVariables: { participationStatus: ['active', 'announced', 'completed'] }
            }
          } as never
        }
      />
    );

    expect(mockMapLibre).toHaveBeenCalledWith(
      expect.objectContaining({
        locations: [expect.objectContaining({ id: 'completed-1' })]
      })
    );
  });

  it('applies the selected radius filter to participation project markers', () => {
    const nearbyProject = buildItem({
      id: 'nearby',
      position: { latitude: 52.1, longitude: 11.6 },
      status: 'active'
    });
    const distantProject = buildItem({
      id: 'distant',
      position: { latitude: 53.1, longitude: 12.6 },
      status: 'active'
    });

    mockGeoLocationFilteredListItem.mockReturnValue([nearbyProject]);
    useQuery.mockReturnValue({
      data: { genericItems: [nearbyProject, distantProject] },
      isLoading: false
    });

    const navigation = {
      goBack: jest.fn(),
      navigate: jest.fn(),
      setOptions: jest.fn()
    };

    render(
      <ParticipationProjectMapScreen
        navigation={navigation as never}
        route={
          {
            params: {
              initialQueryVariables: {
                genericType: 'ParticipationProject',
                participationStatus: ['active']
              },
              queryVariables: {
                participationStatus: ['active'],
                radiusSearch: { currentPosition: true, distance: 1, index: 0 }
              }
            }
          } as never
        }
      />
    );

    expect(mockGeoLocationFilteredListItem).toHaveBeenCalledWith(
      expect.objectContaining({
        currentPosition: mockCurrentPosition,
        listItem: [nearbyProject, distantProject],
        navigation,
        queryVariables: {
          radiusSearch: { currentPosition: true, distance: 1, index: 0 }
        }
      })
    );
    expect(mockFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        initialQueryVariables: {
          genericType: 'ParticipationProject',
          participationStatus: ['active']
        },
        queryVariables: expect.objectContaining({
          radiusSearch: { currentPosition: true, distance: 1, index: 0 }
        })
      })
    );
    expect(mockMapLibre).toHaveBeenCalledWith(
      expect.objectContaining({
        currentPosition: mockCurrentPosition,
        locations: [expect.objectContaining({ id: 'nearby' })]
      })
    );
  });
});
