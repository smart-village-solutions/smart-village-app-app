/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { Overviews } from '../../src/components/screens/Overviews';
import { ConfigurationsContext } from '../../src/ConfigurationsProvider';
import { NetworkContext } from '../../src/NetworkProvider';
import { PermanentFilterContext } from '../../src/PermanentFilterProvider';
import { SettingsContext } from '../../src/SettingsProvider';
import { GenericType, ScreenName } from '../../src/types';

const DETAIL_ROUTE_NAME = 'Detail';

jest.mock('expo-location', () => ({
  PermissionStatus: {
    GRANTED: 'granted'
  }
}));

jest.mock('react-apollo', () => ({
  useQuery: jest.fn()
}));

jest.mock('../../src/ConfigurationsProvider', () => {
  const React = require('react');

  return {
    ConfigurationsContext: React.createContext({ resourceFilters: {} })
  };
});

jest.mock('../../src/NetworkProvider', () => {
  const React = require('react');

  return {
    NetworkContext: React.createContext({ isConnected: true, isMainserverUp: true })
  };
});

jest.mock('../../src/PermanentFilterProvider', () => {
  const React = require('react');

  return {
    PermanentFilterContext: React.createContext({
      resourceFiltersDispatch: jest.fn(),
      resourceFiltersState: {}
    })
  };
});

jest.mock('../../src/SettingsProvider', () => {
  const React = require('react');

  return {
    SettingsContext: React.createContext({
      globalSettings: {
        filter: {},
        navigation: 'tab',
        sections: {},
        settings: {}
      }
    })
  };
});

jest.mock('../../src/helpers/updateResourceFiltersStateHelper', () => ({
  updateResourceFiltersStateHelper: jest.fn()
}));

jest.mock('../../src/helpers', () => ({
  PARTICIPATION_PROJECT_DEFAULT_STATUSES: ['active'],
  PARTICIPATION_PROJECT_STATUS: {
    ACTIVE: 'active',
    ANNOUNCED: 'announced',
    COMPLETED: 'completed',
    ENDED: 'ended',
    RECENTLY_ENDED: 'recently_ended',
    EMPTY: 'empty'
  },
  PARTICIPATION_PROJECT_STATUS_FILTER: 'participationStatus',
  PARTICIPATION_PROJECT_STATUS_POSITION_PARAM: 'participationStatusPosition',
  filterTypesHelper: jest.fn(() => []),
  geoLocationFilteredListItem: jest.fn(({ listItem }) => listItem),
  getParticipationProjectStatusCounts: jest.fn((items) => {
    const counts = items.reduce((result, item) => {
      const status = item.payload?.status?.trim().toLowerCase() || 'empty';
      result[status] = (result[status] || 0) + 1;

      return result;
    }, {});

    return Object.entries(counts).map(([status, count]) => ({
      count,
      label: status === 'empty' ? '' : status,
      status
    }));
  }),
  graphqlFetchPolicy: jest.fn(() => 'cache-first'),
  isOpen: jest.fn(() => ({ open: true })),
  isParticipationProjectMapEligible: jest.fn(
    (item) =>
      ['active', 'announced'].includes(item.payload?.status) &&
      !!(item.locations?.[0]?.geoLocation || item.addresses?.[0]?.geoLocation)
  ),
  isParticipationProjectStatus: jest.fn(
    (item, status) => (item.payload?.status?.trim().toLowerCase() || 'empty') === status
  ),
  openLink: jest.fn(),
  parseListItemsFromQuery: jest.fn((query, data) =>
    (data?.[query] || []).map((item) => ({
      id: item.id,
      params: { details: item },
      routeName: DETAIL_ROUTE_NAME,
      title: item.title
    }))
  ),
  sortPOIsByDistanceFromPosition: jest.fn((items) => items)
}));

jest.mock('../../src/hooks', () => ({
  useLastKnownPosition: jest.fn(() => ({ position: undefined })),
  useLocationSettings: jest.fn(() => ({ locationSettings: { locationService: false } })),
  useOpenWebScreen: jest.fn(() => jest.fn()),
  usePermanentFilter: jest.fn(() => ({})),
  usePosition: jest.fn(() => ({ loading: false, position: undefined })),
  useStaticContent: jest.fn(() => ({ data: undefined })),
  useSystemPermission: jest.fn(() => ({ status: 'granted' }))
}));

jest.mock('../../src/queries', () => ({
  QUERY_TYPES: {
    GENERIC_ITEMS: 'genericItems',
    NEWS_ITEMS: 'newsItems',
    POINTS_OF_INTEREST: 'pointsOfInterest',
    CATEGORIES: 'categories'
  },
  getFetchMoreQuery: jest.fn(() => 'query'),
  getQuery: jest.fn(() => 'query')
}));

function mockLeafComponents() {
  const React = require('react');
  const { Text, View } = require('react-native');

  return {
    Button: ({ onPress, title }) => <Text onPress={onPress}>{title}</Text>,
    CategoryList: () => <View />,
    EmptyMessage: ({ title }) => <Text>{title}</Text>,
    Filter: ({ filterTypes, setQueryVariables }) =>
      filterTypes?.length ? (
        <View>
          <Text testID="participation-status-filter">
            {filterTypes
              ?.flatMap((filterType) => filterType.data || [])
              .map((item) => item.value)
              .join('|')}
          </Text>
          <Text
            onPress={() =>
              setQueryVariables((previous) => ({
                ...previous,
                participationStatus: ['active', 'announced', 'recently_ended', 'ended', 'completed']
              }))
            }
          >
            Show completed
          </Text>
        </View>
      ) : null,
    HeaderLeft: ({ onPress }) => <Text onPress={onPress}>Back</Text>,
    HtmlView: () => <View />,
    IndexFilterWrapperAndList: () => <View />,
    IndexMapSwitch: () => <View />,
    ListComponent: ({ data, ListHeaderComponent, ListFooterComponent }) => (
      <View>
        {ListHeaderComponent}
        {data?.map((item) => (
          <Text key={item.id}>{item.title}</Text>
        ))}
        {ListFooterComponent}
      </View>
    ),
    LoadingContainer: ({ children }) => <View>{children}</View>,
    LocationOverview: () => <View />,
    RegularText: ({ children }) => <Text>{children}</Text>,
    SafeAreaViewFlex: ({ children }) => <View>{children}</View>,
    WrapperVertical: ({ children }) => <View>{children}</View>
  };
}

jest.mock('../../src/components/Button', () => mockLeafComponents());
jest.mock('../../src/components/CategoryList', () => mockLeafComponents());
jest.mock('../../src/components/EmptyMessage', () => mockLeafComponents());
jest.mock('../../src/components/filter', () => mockLeafComponents());
jest.mock('../../src/components/HeaderLeft', () => mockLeafComponents());
jest.mock('../../src/components/HtmlView', () => mockLeafComponents());
jest.mock('../../src/components/IndexFilterWrapperAndList', () => mockLeafComponents());
jest.mock('../../src/components/IndexMapSwitch', () => mockLeafComponents());
jest.mock('../../src/components/ListComponent', () => mockLeafComponents());
jest.mock('../../src/components/LoadingContainer', () => mockLeafComponents());
jest.mock('../../src/components/map/LocationOverview', () => mockLeafComponents());
jest.mock('../../src/components/SafeAreaViewFlex', () => mockLeafComponents());
jest.mock('../../src/components/Text', () => mockLeafComponents());
jest.mock('../../src/components/Wrapper', () => mockLeafComponents());

jest.mock('../../src/config', () => ({
  colors: {
    refreshControl: '#000000',
    surface: '#ffffff'
  },
  consts: {
    FILTER_TYPES: {
      DROPDOWN: 'dropdown'
    },
    SWITCH_BETWEEN_LIST_AND_MAP: {
      BOTTOM_FLOATING_BUTTON: 'bottom-floating-button',
      TOP_FILTER: 'top-filter'
    }
  },
  Icon: {
    Map: () => null
  },
  normalize: (value: number) => value,
  texts: {
    categoryList: {
      intro: 'Intro'
    },
    empty: {
      list: 'Keine Inhalte'
    },
    locationOverview: {
      list: 'Liste',
      map: 'Kartenansicht'
    },
    participationProject: {
      status: 'Status',
      statusFilter: 'Status auswählen',
      statuses: {
        active: 'Aktiv',
        announced: 'Ankündigung',
        completed: 'Abgeschlossen',
        ended: 'Beendet',
        recently_ended: 'Kürzlich beendet',
        empty: 'Ohne Status'
      }
    }
  }
}));

const { useQuery } = jest.requireMock('react-apollo') as {
  useQuery: jest.Mock;
};

const renderScreen = ({
  genericItems,
  genericType = GenericType.ParticipationProject
}: {
  genericItems: Array<Record<string, unknown>>;
  genericType?: GenericType | string;
}) => {
  const navigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
    setOptions: jest.fn()
  };

  const route = {
    params: {
      query: 'genericItems',
      queryVariables: {
        genericType
      },
      rootRouteName: 'participation-projects',
      title: 'Beteiligungsprojekte'
    }
  };

  useQuery.mockReturnValue({
    data: { genericItems },
    fetchMore: jest.fn(),
    loading: false,
    refetch: jest.fn()
  });

  const screen = render(
    <NetworkContext.Provider value={{ isConnected: true, isMainserverUp: true } as never}>
      <ConfigurationsContext.Provider value={{ resourceFilters: {} } as never}>
        <PermanentFilterContext.Provider
          value={
            {
              resourceFiltersDispatch: jest.fn(),
              resourceFiltersState: {}
            } as never
          }
        >
          <SettingsContext.Provider
            value={
              {
                globalSettings: {
                  filter: {},
                  navigation: 'tab',
                  sections: {},
                  settings: {
                    switchBetweenListAndMap: 'bottom-floating-button'
                  }
                }
              } as never
            }
          >
            <Overviews navigation={navigation as never} route={route as never} />
          </SettingsContext.Provider>
        </PermanentFilterContext.Provider>
      </ConfigurationsContext.Provider>
    </NetworkContext.Provider>
  );

  return { navigation, screen };
};

describe('ParticipationProjectIndexMapButton', () => {
  beforeEach(() => {
    useQuery.mockReset();
  });

  it('shows the floating button for active geocoded Participation items and forwards the current context', () => {
    const { navigation, screen } = renderScreen({
      genericItems: [
        {
          id: 'eligible',
          locations: [{ geoLocation: { latitude: 52.1, longitude: 11.6 } }],
          payload: { status: 'active' },
          title: 'Projekt A'
        }
      ]
    });

    fireEvent.press(screen.getByText('Kartenansicht'));

    expect(navigation.navigate).toHaveBeenCalledWith(ScreenName.ParticipationProjectMap, {
      queryVariables: {
        genericType: GenericType.ParticipationProject,
        participationStatus: ['active']
      },
      rootRouteName: 'participation-projects',
      title: 'Beteiligungsprojekte'
    });
  });

  it('hides the button for non-Participation generic lists', () => {
    const { screen } = renderScreen({
      genericItems: [
        {
          id: 'eligible',
          locations: [{ geoLocation: { latitude: 52.1, longitude: 11.6 } }],
          payload: { status: 'active' },
          title: 'Projekt A'
        }
      ],
      genericType: GenericType.Job
    });

    expect(screen.queryByText('Kartenansicht')).toBeNull();
  });

  it('hides the button when Participation items are missing geo coordinates', () => {
    const { screen } = renderScreen({
      genericItems: [
        {
          id: 'no-geo',
          locations: [],
          payload: { status: 'active' },
          title: 'Projekt B'
        }
      ]
    });

    expect(screen.queryByText('Kartenansicht')).toBeNull();
  });

  it('hides the status filter when the list has only one status', () => {
    const { screen } = renderScreen({
      genericItems: [
        {
          id: 'active-project',
          payload: { status: 'active' },
          title: 'Aktives Projekt'
        }
      ]
    });

    expect(screen.getByText('Aktives Projekt')).toBeTruthy();
    expect(screen.queryByTestId('participation-status-filter')).toBeNull();
  });

  it('lists only active projects by default and adds other statuses via multiselect', () => {
    const { screen } = renderScreen({
      genericItems: [
        {
          id: 'active-project',
          payload: { status: 'active' },
          title: 'Aktives Projekt'
        },
        {
          id: 'announced-project',
          payload: { status: 'announced' },
          title: 'Angekündigtes Projekt'
        },
        {
          id: 'completed-project',
          payload: { status: 'completed' },
          title: 'Abgeschlossenes Projekt'
        },
        {
          id: 'ended-project',
          payload: { status: 'ended', statusColor: 'gray' },
          title: 'Beendetes Projekt'
        },
        {
          id: 'recently-ended-project',
          payload: { status: 'recently_ended', statusColor: 'gray' },
          title: 'Kürzlich beendetes Projekt'
        },
        {
          id: 'empty-project',
          payload: { status: '' },
          title: 'Projekt ohne Status'
        }
      ]
    });

    expect(screen.getByText('Aktives Projekt')).toBeTruthy();
    expect(screen.queryByText('Angekündigtes Projekt')).toBeNull();
    expect(screen.queryByText('Abgeschlossenes Projekt')).toBeNull();
    expect(screen.queryByText('Beendetes Projekt')).toBeNull();
    expect(screen.queryByText('Kürzlich beendetes Projekt')).toBeNull();
    expect(screen.queryByText('Projekt ohne Status')).toBeNull();
    expect(screen.getByTestId('participation-status-filter').props.children).toContain(
      'Abgeschlossen (1)'
    );
    expect(screen.getByTestId('participation-status-filter').props.children).toContain(
      'Ankündigung (1)'
    );
    expect(screen.getByTestId('participation-status-filter').props.children).toContain(
      'Ohne Status (1)'
    );
    expect(screen.getByTestId('participation-status-filter').props.children).toContain(
      'Kürzlich beendet (1)'
    );
    expect(useQuery.mock.calls.at(-1)?.[1].variables).not.toHaveProperty('participationStatus');
    expect(useQuery.mock.calls.at(-1)?.[1].variables.limit).toBeUndefined();

    fireEvent.press(screen.getByText('Show completed'));

    expect(screen.getByText('Aktives Projekt')).toBeTruthy();
    expect(screen.getByText('Angekündigtes Projekt')).toBeTruthy();
    expect(screen.getByText('Abgeschlossenes Projekt')).toBeTruthy();
    expect(screen.getByText('Beendetes Projekt')).toBeTruthy();
    expect(screen.getByText('Kürzlich beendetes Projekt')).toBeTruthy();
    expect(screen.queryByText('Projekt ohne Status')).toBeNull();
    expect(screen.getByTestId('participation-status-filter').props.children).toContain('Aktiv (1)');
    expect(screen.getByTestId('participation-status-filter').props.children).toContain(
      'Ankündigung (1)'
    );
    expect(screen.getByTestId('participation-status-filter').props.children).toContain(
      'Abgeschlossen (1)'
    );
  });

  it('keeps a sole completed status behind the filter', () => {
    const { screen } = renderScreen({
      genericItems: [
        {
          id: 'completed-project',
          payload: { status: 'completed' },
          title: 'Abgeschlossenes Projekt'
        }
      ]
    });

    expect(screen.queryByText('Abgeschlossenes Projekt')).toBeNull();
    expect(screen.getByTestId('participation-status-filter')).toBeTruthy();

    fireEvent.press(screen.getByText('Show completed'));

    expect(screen.getByText('Abgeschlossenes Projekt')).toBeTruthy();
  });
});
