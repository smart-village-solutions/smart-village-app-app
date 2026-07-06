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
  filterTypesHelper: jest.fn(() => []),
  geoLocationFilteredListItem: jest.fn(({ listItem }) => listItem),
  graphqlFetchPolicy: jest.fn(() => 'cache-first'),
  isOpen: jest.fn(() => ({ open: true })),
  isParticipationProjectMapEligible: jest.fn(
    (item) => !!(item.locations?.[0]?.geoLocation || item.addresses?.[0]?.geoLocation)
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
    Filter: () => <View />,
    HeaderLeft: ({ onPress }) => <Text onPress={onPress}>Back</Text>,
    HtmlView: () => <View />,
    IndexFilterWrapperAndList: () => <View />,
    IndexMapSwitch: () => <View />,
    ListComponent: ({ ListHeaderComponent, ListFooterComponent }) => (
      <View>
        {ListHeaderComponent}
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
          title: 'Projekt A'
        }
      ]
    });

    fireEvent.press(screen.getByText('Kartenansicht'));

    expect(navigation.navigate).toHaveBeenCalledWith(ScreenName.ParticipationProjectMap, {
      queryVariables: {
        genericType: GenericType.ParticipationProject
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
          title: 'Projekt B'
        }
      ]
    });

    expect(screen.queryByText('Kartenansicht')).toBeNull();
  });
});
