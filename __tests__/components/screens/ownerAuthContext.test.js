/* eslint-disable react/prop-types */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { waitFor } from '@testing-library/react-native';

import { AUTH_MODE_USER, getApolloAuthContext } from '../../../src/graphqlAuth';
import { isValidGeoLocation } from '../../../src/helpers';
import { EventRecord } from '../../../src/components/screens/EventRecord';
import { NewsItem } from '../../../src/components/screens/NewsItem';
import { PointOfInterest } from '../../../src/components/screens/PointOfInterest';
import { NoticeboardDetail } from '../../../src/components/screens/noticeboard/NoticeboardDetail';
import { DELETE_EVENT_RECORD } from '../../../src/queries/eventRecords';
import { DELETE_NEWS_ITEM } from '../../../src/queries/newsItems';
import {
  DELETE_POINT_OF_INTEREST,
  GET_POINT_OF_INTEREST_MAP_MARKERS
} from '../../../src/queries/pointsOfInterest';
import { DELETE_GENERIC_ITEM } from '../../../src/queries/genericItem';

const mockUseMutation = jest.fn();
const mockUseQuery = jest.fn();
const mockUseMarkerQuery = jest.fn();
const mockMarkerRequest = jest.fn();
const mockMarkerRefetch = jest.fn();
const mockUseProfileContext = jest.fn();
const mockUseFocusEffect = jest.fn();
let mockMapProps;
const mockMapUnmount = jest.fn();

jest.mock('react-apollo', () => ({
  useMutation: (...args) => mockUseMutation(...args),
  useQuery: (...args) => mockUseQuery(...args)
}));
jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useQuery: (...args) => mockUseMarkerQuery(...args)
}));
jest.mock('../../../src/ReactQueryClient', () => ({
  ReactQueryClient: async () => ({ request: mockMarkerRequest })
}));

jest.mock('expo-router/react-navigation', () => ({
  useFocusEffect: (...args) => mockUseFocusEffect(...args)
}));

jest.mock('../../../src/ProfileProvider', () => ({
  useProfileContext: () => mockUseProfileContext()
}));

jest.mock('../../../src/SettingsProvider', () => {
  const React = require('react');

  return {
    SettingsContext: React.createContext({
      globalSettings: {
        settings: {},
        showImageRights: {}
      }
    })
  };
});

jest.mock('../../../src/NetworkProvider', () => {
  const React = require('react');

  return {
    NetworkContext: React.createContext({
      isConnected: true,
      isMainserverUp: true
    })
  };
});

jest.mock('../../../src/hooks', () => ({
  useDetailRefresh: jest.fn(),
  useMatomoTrackScreenView: jest.fn(),
  useOpenWebScreen: jest.fn(() => jest.fn())
}));

jest.mock('../../../src/helpers', () => ({
  filterGenericItems: jest.fn(() => true),
  getGenericItemMatomoName: jest.fn(() => 'noticeboard'),
  graphqlFetchPolicy: jest.fn(() => 'network-only'),
  isValidGeoLocation: jest.fn(() => false),
  isTodayOrLater: jest.fn(() => true),
  matomoTrackingString: jest.fn(() => 'tracking'),
  momentFormatUtcToLocal: jest.fn(() => ''),
  openLink: jest.fn(),
  parseListItemsFromQuery: jest.fn(() => []),
  trimNewLines: jest.fn((value) => value)
}));

jest.mock('../../../src/config', () => ({
  colors: {},
  consts: {
    MAP: {
      DEFAULT_PIN: 'default-pin'
    },
    MATOMO_TRACKING: {
      SCREEN_VIEW: {
        EVENT_RECORDS: 'event-records',
        NEWS_ITEMS: 'news-items',
        POINTS_OF_INTEREST: 'points-of-interest'
      }
    }
  },
  Icon: {
    Mail: () => null,
    Pencil: () => null,
    Trash: () => null
  },
  normalize: (value) => value,
  texts: {
    detailTitles: { pointOfInterest: 'Ort' },
    noticeboard: {
      abort: 'Abort',
      alerts: {
        delete: 'Delete',
        hint: 'Hint'
      },
      backToConversation: 'Back',
      delete: 'Delete',
      description: 'Description',
      drivingDays: 'Driving days',
      drivingFrequency: 'Driving frequency',
      edit: 'Edit',
      inputAvailablePlaces: 'Places',
      inputCarBrand: 'Brand',
      inputCarColor: 'Color',
      inputComments: 'Comments',
      inputDepartureAddress: 'Departure address',
      inputDepartureDate: 'Departure date',
      inputDepartureTime: 'Departure time',
      inputDestinationAddress: 'Destination address',
      inputLicensePlate: 'License plate',
      member: 'Member',
      myNoticeboard: 'My noticeboard',
      toConversation: 'Conversation',
      weekDay: {},
      weekday: {},
      writeMessage: 'Write'
    },
    eventRecord: {
      appointments: 'Appointments',
      description: 'Description',
      details: 'Details',
      operatingCompany: 'Operating company',
      prices: 'Prices'
    },
    pointOfInterest: {
      loadMoreVouchers: 'Load more',
      openingTime: 'Opening time',
      overview: 'Overview',
      prices: 'Prices',
      vouchers: 'Vouchers'
    }
  }
}));

jest.mock('../../../src/queries', () => ({
  QUERY_TYPES: {
    EVENT_RECORD: 'eventRecord',
    GENERIC_ITEMS: 'genericItems',
    NEWS_ITEM: 'newsItem',
    POINT_OF_INTEREST: 'pointOfInterest',
    PROFILE: {
      GET_CONVERSATIONS: 'getConversations',
      GET_MESSAGES: 'getMessages'
    }
  },
  getQuery: jest.fn((query) => `query:${query}`)
}));

jest.mock('../../../src/types', () => ({
  ScreenName: {
    Detail: 'Detail',
    NoticeboardForm: 'NoticeboardForm',
    NoticeboardMemberIndex: 'NoticeboardMemberIndex',
    ProfileCreateContentForm: 'ProfileCreateContentForm',
    ProfileMessaging: 'ProfileMessaging',
    ProfileUpdate: 'ProfileUpdate'
  }
}));

jest.mock('../../../src/components/Button', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    Button: ({ children }) => <View>{children}</View>
  };
});

jest.mock('../../../src/components/DataProviderButton', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    DataProviderButton: () => <View />
  };
});

jest.mock('../../../src/components/DataProviderNotice', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    DataProviderNotice: () => <View />
  };
});

jest.mock('../../../src/components/HtmlView', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    HtmlView: () => <View />
  };
});

jest.mock('../../../src/components/ImageSection', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    ImageSection: () => <View />
  };
});

jest.mock('../../../src/components/LoadingContainer', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    LoadingContainer: ({ children }) => <View>{children}</View>
  };
});

jest.mock('../../../src/components/LoadingSpinner', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    LoadingSpinner: () => <View />
  };
});

jest.mock('../../../src/components/SectionHeader', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    SectionHeader: () => <View />
  };
});

jest.mock('../../../src/components/StorySection', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    StorySection: () => <View />
  };
});

jest.mock('../../../src/components/Text', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    BoldText: ({ children }) => <View>{children}</View>,
    HeadlineText: ({ children }) => <View>{children}</View>,
    RegularText: ({ children }) => <View>{children}</View>
  };
});

jest.mock('../../../src/components/TextListItem', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    TextListItem: () => <View />
  };
});

jest.mock('../../../src/components/Wrapper', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    Wrapper: ({ children }) => <View>{children}</View>,
    WrapperHorizontal: ({ children }) => <View>{children}</View>,
    WrapperRow: ({ children }) => <View>{children}</View>,
    WrapperVertical: ({ children }) => <View>{children}</View>
  };
});

jest.mock('../../../src/components/infoCard', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    InfoCard: () => <View />
  };
});

jest.mock('../../../src/components/map', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    MapLibre: (props) => {
      mockMapProps = props;
      React.useEffect(() => () => mockMapUnmount(), []);
      return <View />;
    }
  };
});

jest.mock('../../../src/components/volunteer', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    VolunteerAvatar: () => <View />
  };
});

jest.mock('../../../src/components/vouchers', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    VoucherListItem: () => <View />
  };
});

jest.mock('../../../src/components/screens/AvailableVehicles', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    AvailableVehicles: () => <View />,
    fetchAvailableVehicles: jest.fn(),
    getVehicleMarkerConfig: jest.fn(() => ({
      activeIconName: 'active',
      iconName: 'default',
      status: 'unknown'
    }))
  };
});

jest.mock('../../../src/components/screens/OpeningTimesCard', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    OpeningTimesCard: () => <View />
  };
});

jest.mock('../../../src/components/screens/OperatingCompany', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    OperatingCompany: () => <View />
  };
});

jest.mock('../../../src/components/screens/PriceCard', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    PriceCard: () => <View />
  };
});

jest.mock('../../../src/components/screens/TravelTimes', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    TravelTimes: () => <View />
  };
});

const navigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
  push: jest.fn(),
  setOptions: jest.fn()
};

const route = { params: {} };

const renderComponent = async (component) => {
  let tree;
  await act(async () => {
    tree = renderer.create(component);
  });
  return tree;
};

describe('owner auth context for detail screen actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMapProps = undefined;
    isValidGeoLocation.mockReturnValue(false);

    mockUseMutation.mockImplementation(() => [jest.fn(), {}]);
    mockUseQuery.mockImplementation(() => ({
      data: {},
      loading: false,
      refetch: jest.fn()
    }));
    mockUseMarkerQuery.mockImplementation(() => ({ data: {}, refetch: mockMarkerRefetch }));
    mockMarkerRequest.mockResolvedValue({ pointsOfInterest: [] });
    mockUseProfileContext.mockReturnValue({
      currentUserData: {
        member: { id: 'member-1' },
        user: { data_provider_id: 'provider-1' }
      },
      isLoading: false,
      isLoggedIn: true
    });
    mockUseFocusEffect.mockImplementation(() => undefined);
  });

  it('passes user auth context to owner delete mutations for content detail screens', async () => {
    await renderComponent(
      <EventRecord
        data={{ id: 'event-1', dataProvider: { id: 'provider-1' } }}
        navigation={navigation}
        route={route}
      />
    );
    await renderComponent(
      <NewsItem
        data={{ id: 'news-1', contentBlocks: [], dataProvider: { id: 'provider-1' } }}
        navigation={navigation}
        route={route}
      />
    );
    await renderComponent(
      <PointOfInterest
        data={{ id: 'poi-1', dataProvider: { id: 'provider-1' }, payload: {} }}
        navigation={navigation}
        route={route}
      />
    );

    expect(mockUseMutation).toHaveBeenNthCalledWith(
      1,
      DELETE_EVENT_RECORD,
      expect.objectContaining({
        ...getApolloAuthContext(AUTH_MODE_USER),
        variables: { id: 'event-1' }
      })
    );
    expect(mockUseMutation).toHaveBeenNthCalledWith(
      2,
      DELETE_NEWS_ITEM,
      expect.objectContaining({
        ...getApolloAuthContext(AUTH_MODE_USER),
        awaitRefetchQueries: true,
        refetchQueries: ['NewsItems'],
        variables: { id: 'news-1' }
      })
    );
    expect(mockUseMutation).toHaveBeenNthCalledWith(
      3,
      DELETE_POINT_OF_INTEREST,
      expect.objectContaining({
        ...getApolloAuthContext(AUTH_MODE_USER),
        variables: { id: 'poi-1' }
      })
    );
  });

  it('loads POI map markers using the opened list category before detail categories arrive', async () => {
    isValidGeoLocation.mockReturnValue(true);

    await renderComponent(
      <PointOfInterest
        data={{
          id: 'poi-1',
          addresses: [{ geoLocation: { latitude: 52, longitude: 13 } }],
          payload: {}
        }}
        navigation={navigation}
        route={{ params: { queryVariables: { categoryName: 'Hotels, Pensionen etc.' } } }}
      />
    );

    expect(mockUseMarkerQuery).toHaveBeenCalledWith(
      [
        'pointOfInterestMapMarkers',
        {
          category: 'Hotels, Pensionen etc.',
          categoryId: undefined,
          categoryIds: undefined
        }
      ],
      expect.any(Function),
      { enabled: true }
    );
  });

  it('retains the overview category IDs when navigating between detail-map peers', async () => {
    isValidGeoLocation.mockReturnValue(true);
    await renderComponent(
      <PointOfInterest
        data={{
          id: 'poi-1',
          addresses: [{ geoLocation: { latitude: 52, longitude: 13 } }],
          categories: [
            { id: 'a', name: 'A' },
            { id: 'b', name: 'B' }
          ],
          payload: {}
        }}
        navigation={navigation}
        route={{ params: { rootRouteName: 'Places', queryVariables: { categoryIds: ['a'] } } }}
      />
    );
    expect(mockUseMarkerQuery).toHaveBeenCalledWith(
      [
        'pointOfInterestMapMarkers',
        { category: undefined, categoryId: undefined, categoryIds: ['a'] }
      ],
      expect.any(Function),
      { enabled: true }
    );
    act(() => mockMapProps.onMarkerPress('poi-2'));
    expect(navigation.push).toHaveBeenCalledWith(
      'Detail',
      expect.objectContaining({
        queryVariables: {
          id: 'poi-2',
          categoryName: undefined,
          categoryId: undefined,
          categoryIds: ['a']
        },
        rootRouteName: 'Places'
      })
    );
  });

  it('keeps the selected map mounted while peer markers load and then adds peers', async () => {
    isValidGeoLocation.mockReturnValue(true);
    let result = { loading: true, data: undefined };
    mockUseMarkerQuery.mockImplementation(() => result);
    const element = () => (
      <PointOfInterest
        data={{
          id: 'poi-1',
          addresses: [{ geoLocation: { latitude: 52, longitude: 13 } }],
          payload: {}
        }}
        navigation={navigation}
        route={{ params: { queryVariables: { categoryIds: ['a'] } } }}
      />
    );
    const tree = await renderComponent(element());
    expect(mockMapProps.selectedMarker).toBe('poi-1');
    expect(mockMapProps.locations.map((marker) => marker.id)).toEqual(['poi-1']);

    result = {
      loading: false,
      data: {
        pointsOfInterest: [
          {
            id: 'poi-2',
            name: 'Peer',
            visible: true,
            addresses: [{ geoLocation: { latitude: 52.1, longitude: 13.1 } }]
          }
        ]
      }
    };
    await act(async () => tree.update(element()));
    expect(mockMapProps.locations.map((marker) => marker.id)).toEqual(['poi-1', 'poi-2']);
    expect(mockMapUnmount).not.toHaveBeenCalled();
  });

  it.each([true, false])(
    'refreshes related markers only when the map is eligible (%s)',
    async (hideMap) => {
      isValidGeoLocation.mockReturnValue(true);
      await renderComponent(
        <PointOfInterest
          hideMap={hideMap}
          data={{
            id: 'poi-1',
            addresses: [{ geoLocation: { latitude: 52, longitude: 13 } }],
            payload: {}
          }}
          navigation={navigation}
          route={{ params: { queryVariables: { categoryIds: ['a'] } } }}
        />
      );
      const refresh = jest.requireMock('../../../src/hooks').useDetailRefresh.mock.calls.at(-1)[0];
      refresh();
      expect(mockMarkerRefetch).toHaveBeenCalledTimes(hideMap ? 0 : 1);
    }
  );

  it('uses the shared React Query client, reuses cached peers and refreshes them on detail refresh', async () => {
    const actual = jest.requireActual('react-query');
    const client = new actual.QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: 60000, cacheTime: Infinity, refetchOnMount: false }
      }
    });
    mockUseMarkerQuery.mockImplementation((...args) => actual.useQuery(...args));
    isValidGeoLocation.mockReturnValue(true);
    const peer = (id) => ({
      id,
      visible: true,
      addresses: [{ geoLocation: { latitude: 52.1, longitude: 13.1 } }]
    });
    mockMarkerRequest.mockResolvedValue({ pointsOfInterest: [peer('old-peer')] });
    const element = (ids) => (
      <actual.QueryClientProvider client={client}>
        <PointOfInterest
          data={{
            id: 'poi-1',
            addresses: [{ geoLocation: { latitude: 52, longitude: 13 } }],
            payload: {}
          }}
          navigation={navigation}
          route={{ params: { queryVariables: { categoryIds: ids } } }}
        />
      </actual.QueryClientProvider>
    );
    const tree = await renderComponent(element(['a']));
    await waitFor(() =>
      expect(mockMapProps.locations.map((x) => x.id)).toEqual(['poi-1', 'old-peer'])
    );
    expect(mockMarkerRequest).toHaveBeenCalledWith(GET_POINT_OF_INTEREST_MAP_MARKERS, {
      category: undefined,
      categoryId: undefined,
      categoryIds: ['a']
    });
    expect(mockMapProps.locations.map((x) => x.id)).toEqual(['poi-1', 'old-peer']);
    await act(async () => tree.update(element(['b'])));
    await waitFor(() => expect(mockMarkerRequest).toHaveBeenCalledTimes(2));
    expect(mockMarkerRequest).toHaveBeenCalledTimes(2);
    await act(async () => tree.update(element(['a'])));
    expect(mockMarkerRequest).toHaveBeenCalledTimes(2);
    mockMarkerRequest.mockResolvedValue({ pointsOfInterest: [peer('new-peer')] });
    jest.requireMock('../../../src/hooks').useDetailRefresh.mock.calls.at(-1)[0]();
    await waitFor(() =>
      expect(mockMapProps.locations.map((x) => x.id)).toEqual(['poi-1', 'new-peer'])
    );
    expect(mockMarkerRequest).toHaveBeenCalledTimes(3);
    expect(mockMapProps.locations.map((x) => x.id)).toEqual(['poi-1', 'new-peer']);
    act(() => tree.unmount());
    client.clear();
  });

  it('passes user auth context only to noticeboard conversation hooks', async () => {
    await renderComponent(
      <NoticeboardDetail
        data={{
          id: 'notice-1',
          categories: [],
          contacts: [],
          contentBlocks: [],
          genericType: 'Offer',
          mediaContents: [],
          memberId: 'member-1',
          payload: {}
        }}
        fetchPolicy="network-only"
        navigation={navigation}
        refetch={jest.fn()}
        route={route}
      />
    );

    expect(mockUseMutation).toHaveBeenCalledWith(
      DELETE_GENERIC_ITEM,
      expect.objectContaining({
        ...getApolloAuthContext(AUTH_MODE_USER),
        variables: { id: 'notice-1' }
      })
    );
    expect(mockUseQuery).toHaveBeenNthCalledWith(
      1,
      'query:genericItems',
      expect.objectContaining({
        fetchPolicy: 'network-only',
        skip: false,
        variables: {
          memberId: 'member-1'
        }
      })
    );
    expect(mockUseQuery).toHaveBeenNthCalledWith(
      2,
      'query:getConversations',
      expect.objectContaining({
        ...getApolloAuthContext(AUTH_MODE_USER),
        variables: {
          conversationableId: 'notice-1',
          conversationableType: 'GenericItem'
        }
      })
    );
  });

  it('keeps the public noticeboard member lookup available without a profile session', async () => {
    mockUseProfileContext.mockReturnValue({
      currentUserData: null,
      isLoading: false,
      isLoggedIn: false
    });

    await renderComponent(
      <NoticeboardDetail
        data={{
          id: 'notice-2',
          categories: [],
          contacts: [],
          contentBlocks: [],
          genericType: 'Offer',
          mediaContents: [],
          memberId: 'member-2',
          payload: {}
        }}
        fetchPolicy="network-only"
        navigation={navigation}
        refetch={jest.fn()}
        route={route}
      />
    );

    expect(mockUseQuery).toHaveBeenNthCalledWith(
      1,
      'query:genericItems',
      expect.objectContaining({
        fetchPolicy: 'network-only',
        skip: false,
        variables: {
          memberId: 'member-2'
        }
      })
    );
    expect(mockUseQuery).toHaveBeenNthCalledWith(
      2,
      'query:getConversations',
      expect.objectContaining({
        ...getApolloAuthContext(AUTH_MODE_USER),
        skip: true,
        variables: {
          conversationableId: 'notice-2',
          conversationableType: 'GenericItem'
        }
      })
    );
  });
});
