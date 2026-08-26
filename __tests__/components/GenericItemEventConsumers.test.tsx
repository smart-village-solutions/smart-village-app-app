/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires */
import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import moment from 'moment';

import { Calendar } from '../../src/components/Calendar';
import { HomeSection } from '../../src/components/HomeSection';
import { EventRecords } from '../../src/components/screens/EventRecords';
import { EventWidget } from '../../src/components/widgets/EventWidget';
import { NetworkContext } from '../../src/NetworkProvider';
import { SettingsContext } from '../../src/SettingsProvider';

const mockUseGenericItemEvents = jest.fn();
const mockUseHomeRefresh = jest.fn();
let mockDataListProps: Record<string, any>;
let mockWidgetProps: Record<string, any>;
let mockListProps: Record<string, any>;
let mockNativeCalendarProps: Record<string, any>;
let mockQueryResult: Record<string, any>;
let mockInfiniteResult: Record<string, any>;
const mockMainRefetch = jest.fn(async () => undefined);
const mockGenericRefetch = jest.fn(async () => undefined);

jest.mock('../../src/NetworkProvider', () => {
  const ReactInMock = require('react');
  return {
    NetworkContext: ReactInMock.createContext({ isConnected: true, isMainserverUp: true })
  };
});

jest.mock('expo-router/react-navigation', () => ({
  useFocusEffect: jest.fn(),
  useNavigation: jest.fn(() => ({ navigate: jest.fn() }))
}));
jest.mock('react-native-calendars', () => ({
  Calendar: (props: Record<string, any>) => {
    mockNativeCalendarProps = props;
    return null;
  }
}));
jest.mock('react-apollo', () => ({
  useQuery: jest.fn(() => ({ data: {}, loading: false }))
}));

jest.mock('react-query', () => ({
  useQuery: jest.fn(() => mockQueryResult),
  useInfiniteQuery: jest.fn(() => mockInfiniteResult)
}));
jest.mock('../../src/hooks', () => ({
  useGenericItemEvents: (options: unknown) => mockUseGenericItemEvents(options),
  useHomePointsOfInterestAndToursRefresh: jest.fn(),
  useHomeRefresh: (callback: unknown) => mockUseHomeRefresh(callback),
  useLastKnownPosition: jest.fn(() => ({})),
  useLocationSettings: jest.fn(() => ({ locationSettings: {} })),
  useOpenWebScreen: jest.fn(),
  usePosition: jest.fn(() => ({})),
  useSystemPermission: jest.fn(() => ({})),
  useTheme: jest.fn(() => ({
    colors: { calendarSelected: '#456', primary: '#123', refreshControl: '#000' }
  })),
  useThemeStyles: jest.fn((factory) => factory()),
  useVolunteerData: jest.fn(() => ({ data: [], isLoading: false, refetch: jest.fn() }))
}));
jest.mock('../../src/helpers', () => ({
  filterTypesHelper: jest.fn(() => []),
  geoLocationFilteredListItem: jest.fn(({ listItem }) => listItem),
  openLink: jest.fn(),
  parseListItemsFromQuery: jest.fn((query, data) =>
    (data?.[query] || []).map((item: Record<string, any>) => ({ ...item }))
  )
}));
jest.mock('../../src/helpers/calendarHelper', () => ({
  getCalendarTheme: jest.fn(() => ({})),
  setupLocales: jest.fn()
}));
jest.mock('../../src/helpers/updateResourceFiltersStateHelper', () => ({
  updateResourceFiltersStateHelper: jest.fn()
}));
jest.mock('../../src/components/filter', () => ({ Filter: () => null }));
jest.mock('../../src/components/calendarArrows', () => ({ renderArrow: jest.fn() }));
jest.mock('../../src/components/DataListSection', () => ({
  DataListSection: (props: Record<string, any>) => {
    mockDataListProps = props;
    const ReactInMock = require('react');
    const { Text: TextInMock } = require('react-native');
    return ReactInMock.createElement(TextInMock, null, 'section');
  }
}));
jest.mock('../../src/components/widgets/DefaultWidget', () => ({
  DefaultWidget: (props: Record<string, any>) => {
    mockWidgetProps = props;
    const ReactInMock = require('react');
    const { Text: TextInMock } = require('react-native');
    return ReactInMock.createElement(TextInMock, null, 'widget');
  }
}));
jest.mock('../../src/components/ListComponent', () => ({
  ListComponent: (props: Record<string, any>) => {
    mockListProps = props;
    const ReactInMock = require('react');
    const { Text: TextInMock } = require('react-native');
    return ReactInMock.createElement(
      ReactInMock.Fragment,
      null,
      ReactInMock.createElement(
        TextInMock,
        { onPress: props.refreshControl?.props?.onRefresh },
        'list'
      ),
      props.data?.length === 0 ? props.ListEmptyComponent : null
    );
  }
}));
jest.mock('../../src/components/CalendarListToggle', () => ({
  CalendarListToggle: ({ setShowCalendar }: Record<string, any>) => {
    const ReactInMock = require('react');
    const { Text: TextInMock } = require('react-native');
    return ReactInMock.createElement(
      TextInMock,
      { onPress: () => setShowCalendar(true) },
      'toggle'
    );
  }
}));
jest.mock('../../src/components/LoadingContainer', () => ({
  LoadingContainer: ({ children }: Record<string, any>) => children || null
}));
jest.mock('../../src/components/EmptyMessage', () => ({ EmptyMessage: () => null }));
jest.mock('../../src/queries', () => ({
  QUERY_TYPES: {
    EVENT_RECORDS: 'eventRecords',
    EVENT_RECORDS_COUNT: 'eventRecordsCount',
    POINTS_OF_INTEREST: 'pointsOfInterest',
    POINTS_OF_INTEREST_AND_TOURS: 'pointsOfInterestAndTours',
    TOURS: 'tours',
    VOLUNTEER: { CALENDAR_ALL: 'volunteerCalendar' }
  },
  getQuery: jest.fn()
}));
jest.mock('../../src/config', () => ({
  colors: {
    calendarSelected: '#456',
    darkText: '#111',
    primary: '#123',
    refreshControl: '#000',
    surface: '#fff'
  },
  consts: {
    CALENDAR: { DOT_SIZE: 4, MAX_DOTS_PER_DAY: 3 },
    EVENT_SUGGESTION_BUTTON: { BOTTOM_FLOATING: 'bottom', TOP: 'top' },
    ROOT_ROUTE_NAMES: { EVENT_RECORDS: 'Events' }
  },
  Icon: { Calendar: () => null },
  normalize: (value: number) => value,
  texts: {
    empty: { list: 'Empty' },
    homeTitles: { events: 'Events' },
    widgets: { events: 'Events' }
  }
}));

const settingsValue = {
  globalSettings: {
    hdvt: {},
    settings: {
      eventCalendar: {
        genericItemEventSources: [{ genericType: 'ParticipationProject' }]
      }
    }
  }
} as any;
const occurrence = { id: 'event', listDate: '2030-01-01', startTime: '10:00', title: 'Event' };

const renderEventRecords = (queryVariables: Record<string, unknown> = {}) =>
  render(
    <NetworkContext.Provider value={{ isConnected: true, isMainserverUp: true }}>
      <SettingsContext.Provider value={settingsValue}>
        <EventRecords
          navigation={{ navigate: jest.fn() }}
          route={{
            params: {
              query: 'eventRecords',
              queryVariables: { limit: 15, ...queryVariables },
              title: 'Events'
            }
          }}
        />
      </SettingsContext.Provider>
    </NetworkContext.Provider>
  );

describe('Generic Item event consumers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGenericItemEvents.mockReturnValue({
      data: [occurrence],
      isLoading: false,
      isRefetching: false,
      refetch: mockGenericRefetch
    });
    mockQueryResult = {
      data: { eventRecords: [] },
      isLoading: false,
      isRefetching: false,
      refetch: mockMainRefetch
    };
    mockInfiniteResult = {
      data: { pages: [{ eventRecords: [] }] },
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
      isRefetching: false,
      refetch: mockMainRefetch
    };
    mockListProps = undefined as any;
    mockNativeCalendarProps = undefined as any;
  });

  it('merges Generic Item occurrences into EventRecords list data and refreshes them', async () => {
    mockInfiniteResult.data = {
      pages: [{ eventRecords: [{ id: 'main', listDate: '2029-12-31', title: 'Main' }] }]
    };
    const view = renderEventRecords();
    expect(mockListProps.data.map(({ id }: { id: string }) => id)).toEqual(['main', 'event']);
    await act(async () => fireEvent.press(view.getByText('list')));
    expect(mockMainRefetch).toHaveBeenCalled();
    expect(mockGenericRefetch).toHaveBeenCalled();
  });

  it('suppresses Generic Item occurrences for native category filters', () => {
    renderEventRecords({ categoryId: 'native-category' });
    expect(mockListProps.data).toEqual([]);
  });

  it('includes Generic Item loading in the EventRecords empty loading state', () => {
    mockUseGenericItemEvents.mockReturnValue({
      data: [],
      isLoading: true,
      isRefetching: false,
      refetch: mockGenericRefetch
    });
    renderEventRecords();
    expect(mockListProps).toBeUndefined();
  });

  it('passes occurrences into active calendar view', () => {
    const calendarSettings = {
      globalSettings: {
        hdvt: {},
        settings: {
          calendarToggle: true,
          eventCalendar: { genericItemEventSources: [{ genericType: 'ParticipationProject' }] }
        }
      }
    } as any;
    const view = render(
      <NetworkContext.Provider value={{ isConnected: true, isMainserverUp: true }}>
        <SettingsContext.Provider value={calendarSettings}>
          <EventRecords
            navigation={{ navigate: jest.fn() }}
            route={{ params: { query: 'eventRecords', queryVariables: { limit: 15 } } }}
          />
        </SettingsContext.Provider>
      </NetworkContext.Provider>
    );
    fireEvent.press(view.getByText('toggle'));
    expect(mockNativeCalendarProps.markedDates['2030-01-01'].dots).toHaveLength(1);
  });

  it('does not mutate cached main records while marking and listing additional events', () => {
    const cachedRecords = [{ id: 'main', listDate: '2030-01-02', color: '#abc' }];
    mockQueryResult = {
      data: { eventRecords: cachedRecords },
      isLoading: false,
      isRefetching: false,
      refetch: mockMainRefetch
    };
    render(
      <NetworkContext.Provider value={{ isConnected: true, isMainserverUp: true }}>
        <SettingsContext.Provider value={settingsValue}>
          <Calendar
            additionalData={[occurrence]}
            isListRefreshing={false}
            navigation={{ push: jest.fn() } as any}
            query="eventRecords"
            queryVariables={{}}
          />
        </SettingsContext.Provider>
      </NetworkContext.Provider>
    );
    expect(cachedRecords).toEqual([{ id: 'main', listDate: '2030-01-02', color: '#abc' }]);
    expect(mockNativeCalendarProps.markedDates).toEqual(
      expect.objectContaining({
        '2030-01-01': expect.objectContaining({ marked: true }),
        '2030-01-02': expect.objectContaining({ marked: true })
      })
    );
  });

  it('adds configured occurrences to the home event section and enables its button', () => {
    render(
      <SettingsContext.Provider value={settingsValue}>
        <HomeSection
          buttonTitle="all"
          isIndexStartingAt1={false}
          navigate={jest.fn()}
          navigation={{} as any}
          query="eventRecords"
          queryVariables={{ limit: 3 }}
          skipLastDivider
          title="Events"
        />
      </SettingsContext.Provider>
    );
    expect(mockDataListProps.additionalData).toEqual([
      { ...occurrence, overtitle: '01.01.2030, 10:00 Uhr' }
    ]);
    expect(mockDataListProps.showButton).toBe(true);
    expect(mockDataListProps.skipLastDivider).toBe(true);
    expect(mockUseGenericItemEvents).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: true })
    );
  });

  it('refreshes Generic Item occurrences with the home event section', async () => {
    render(
      <SettingsContext.Provider value={settingsValue}>
        <HomeSection
          buttonTitle="all"
          isIndexStartingAt1={false}
          navigate={jest.fn()}
          navigation={{} as any}
          query="eventRecords"
          queryVariables={{ limit: 3 }}
          title="Events"
        />
      </SettingsContext.Provider>
    );
    const refresh = mockUseHomeRefresh.mock.calls[0][0];
    await act(async () => refresh());
    expect(mockMainRefetch).toHaveBeenCalled();
    expect(mockGenericRefetch).toHaveBeenCalled();
  });

  it('adds configured occurrences to the event widget count', () => {
    render(
      <SettingsContext.Provider value={settingsValue}>
        <EventWidget additionalProps={{ noFilterByDailyEvents: true }} />
      </SettingsContext.Provider>
    );
    expect(mockWidgetProps.count).toBe(1);
    expect(mockUseGenericItemEvents).toHaveBeenCalledWith(
      expect.objectContaining({ dateRange: undefined, enabled: true })
    );
  });

  it('uses today by default and all upcoming occurrences in unfiltered mode', () => {
    const today = moment().format('YYYY-MM-DD');
    const defaultView = render(
      <SettingsContext.Provider value={settingsValue}>
        <EventWidget />
      </SettingsContext.Provider>
    );
    expect(mockUseGenericItemEvents).toHaveBeenLastCalledWith(
      expect.objectContaining({ dateRange: [today, today] })
    );
    defaultView.unmount();
    render(
      <SettingsContext.Provider value={settingsValue}>
        <EventWidget additionalProps={{ noFilterByDailyEvents: true }} />
      </SettingsContext.Provider>
    );
    expect(mockUseGenericItemEvents).toHaveBeenLastCalledWith(
      expect.objectContaining({ dateRange: undefined })
    );
  });

  it('hides the widget count while Generic Item events load or no-count is configured', () => {
    mockUseGenericItemEvents.mockReturnValue({
      data: [],
      isLoading: true,
      isRefetching: false,
      refetch: mockGenericRefetch
    });
    const loadingView = render(
      <SettingsContext.Provider value={settingsValue}>
        <EventWidget />
      </SettingsContext.Provider>
    );
    expect(mockWidgetProps.count).toBeUndefined();
    loadingView.unmount();
    mockUseGenericItemEvents.mockReturnValue({
      data: [occurrence],
      isLoading: false,
      isRefetching: false,
      refetch: mockGenericRefetch
    });
    render(
      <SettingsContext.Provider value={settingsValue}>
        <EventWidget additionalProps={{ noCount: true }} />
      </SettingsContext.Provider>
    );
    expect(mockWidgetProps.count).toBeUndefined();
  });

  it('refreshes Generic Item occurrences with the event widget', async () => {
    render(
      <SettingsContext.Provider value={settingsValue}>
        <EventWidget />
      </SettingsContext.Provider>
    );
    const refresh = mockUseHomeRefresh.mock.calls[0][0];
    await act(async () => refresh());
    expect(mockMainRefetch).toHaveBeenCalled();
    expect(mockGenericRefetch).toHaveBeenCalled();
  });

  it('disables Generic Item queries without configuration', () => {
    render(
      <SettingsContext.Provider value={{ globalSettings: { hdvt: {}, settings: {} } } as any}>
        <EventWidget />
      </SettingsContext.Provider>
    );
    expect(mockUseGenericItemEvents).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false })
    );
  });
});
