/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires */
import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import moment from 'moment';
import { DeviceEventEmitter } from 'react-native';

import { Calendar, REFRESH_CALENDAR } from '../../src/components/Calendar';
import { HomeSection } from '../../src/components/HomeSection';
import { EventRecords } from '../../src/components/screens/EventRecords';
import { EventWidget } from '../../src/components/widgets/EventWidget';
import { NetworkContext } from '../../src/NetworkProvider';
import { SettingsContext } from '../../src/SettingsProvider';

const mockUseGenericItemEvents = jest.fn();
const mockUseVolunteerData = jest.fn();
const mockUseHomeRefresh = jest.fn();
let mockDataListProps: Record<string, any>;
let mockWidgetProps: Record<string, any>;
let mockListProps: Record<string, any>;
let mockNativeCalendarProps: Record<string, any>;
let mockQueryResult: Record<string, any>;
let mockInfiniteResult: Record<string, any>;
let mockSubListInfiniteResult: Record<string, any>;
let mockFocusEffect: (() => void) | undefined;
const mockMainRefetch = jest.fn(async () => undefined);
const mockSubListRefetch = jest.fn(async () => undefined);
const mockGenericRefetch = jest.fn(async () => undefined);
const mockVolunteerRefetch = jest.fn(async () => undefined);

jest.mock('../../src/NetworkProvider', () => {
  const ReactInMock = require('react');
  return {
    NetworkContext: ReactInMock.createContext({ isConnected: true, isMainserverUp: true })
  };
});

jest.mock('expo-router/react-navigation', () => ({
  useFocusEffect: (callback: () => void) => {
    mockFocusEffect = callback;
  },
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
  useInfiniteQuery: jest.fn(([_, variables]) =>
    variables?.dateRange ? mockSubListInfiniteResult : mockInfiniteResult
  )
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
  useVolunteerData: (options: unknown) => mockUseVolunteerData(options)
}));
jest.mock('../../src/helpers', () => ({
  filterTypesHelper: jest.fn(() => []),
  geoLocationFilteredListItem: jest.fn(({ listItem }) => listItem),
  openLink: jest.fn(),
  parseListItemsFromQuery: jest.fn((query, data) =>
    (data?.[query] || []).map((item: Record<string, any>) => ({ ...item }))
  ),
  volunteerEventDates: jest.fn((item) => item.eventDates || []),
  volunteerEventOverlapsDate: jest.fn((item, date) => item.eventDates?.includes(date) || false)
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

const renderEventRecords = (
  queryVariables: Record<string, unknown> = {},
  settings: Record<string, any> = settingsValue
) =>
  render(
    <NetworkContext.Provider value={{ isConnected: true, isMainserverUp: true }}>
      <SettingsContext.Provider value={settings}>
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
    mockUseVolunteerData.mockReturnValue({
      data: [],
      isLoading: false,
      isRefetching: false,
      refetch: mockVolunteerRefetch
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
    mockSubListInfiniteResult = {
      data: { pages: [{ eventRecords: [] }] },
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
      isRefetching: false,
      refetch: mockSubListRefetch
    };
    mockListProps = undefined as any;
    mockNativeCalendarProps = undefined as any;
    mockFocusEffect = undefined;
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

  it('keeps multi-day Volunteer events in the navigated daily event view', () => {
    const volunteerEvent = {
      eventDates: ['2030-01-01', '2030-01-02', '2030-01-03'],
      id: 'volunteer-event',
      listDate: '2030-01-01',
      title: 'Volunteer event'
    };
    mockUseVolunteerData.mockReturnValue({
      data: [volunteerEvent],
      isLoading: false,
      isRefetching: false,
      refetch: mockVolunteerRefetch
    });

    renderEventRecords(
      { dateRange: ['2030-01-02', '2030-01-02'] },
      {
        globalSettings: {
          ...settingsValue.globalSettings,
          hdvt: { events: true }
        }
      }
    );

    expect(mockListProps.data).toContainEqual(volunteerEvent);
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

  it('updates the Volunteer query range when the combined calendar month changes', () => {
    const calendarSettings = {
      globalSettings: {
        hdvt: { events: true },
        settings: { calendarToggle: true, eventCalendar: {} }
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

    expect(
      mockUseVolunteerData.mock.calls.some(
        ([options]) =>
          options.queryOptions.enabled === false && options.queryVariables?.limit === 15
      )
    ).toBe(true);

    act(() => mockNativeCalendarProps.onMonthChange({ dateString: '2030-02-01' }));

    expect(mockUseVolunteerData).toHaveBeenLastCalledWith(
      expect.objectContaining({
        queryOptions: { enabled: true, keepPreviousData: true },
        queryVariables: expect.objectContaining({ dateRange: ['2030-01-25', '2030-03-07'] })
      })
    );
  });

  it('keeps the Volunteer range query disabled for native filters', () => {
    const calendarSettings = {
      globalSettings: {
        hdvt: { events: true },
        settings: { calendarToggle: true, eventCalendar: {} }
      }
    } as any;
    const view = render(
      <NetworkContext.Provider value={{ isConnected: true, isMainserverUp: true }}>
        <SettingsContext.Provider value={calendarSettings}>
          <EventRecords
            navigation={{ navigate: jest.fn() }}
            route={{
              params: {
                query: 'eventRecords',
                queryVariables: { categoryId: 'native-category', limit: 15 }
              }
            }}
          />
        </SettingsContext.Provider>
      </NetworkContext.Provider>
    );
    fireEvent.press(view.getByText('toggle'));

    expect(mockUseVolunteerData).toHaveBeenLastCalledWith(
      expect.objectContaining({ queryOptions: { enabled: false, keepPreviousData: true } })
    );
  });

  it('lists a multi-day Volunteer event on an intermediate selected day', () => {
    const volunteerEvent = {
      eventDates: ['2030-01-01', '2030-01-02', '2030-01-03'],
      id: 'volunteer-event',
      listDate: '2030-01-01',
      title: 'Volunteer event'
    };
    mockUseVolunteerData.mockReturnValue({
      data: [volunteerEvent],
      isLoading: false,
      isRefetching: false,
      refetch: mockVolunteerRefetch
    });
    const calendarSettings = {
      globalSettings: { hdvt: {}, settings: { eventCalendar: { subList: true } } }
    } as any;
    render(
      <NetworkContext.Provider value={{ isConnected: true, isMainserverUp: true }}>
        <SettingsContext.Provider value={calendarSettings}>
          <Calendar
            includeVolunteerEvents
            isListRefreshing={false}
            navigation={{ push: jest.fn() } as any}
            query="eventRecords"
            queryVariables={{}}
          />
        </SettingsContext.Provider>
      </NetworkContext.Provider>
    );

    act(() => mockNativeCalendarProps.onDayPress({ dateString: '2030-01-02' }));

    expect(mockListProps.data).toContainEqual(volunteerEvent);
  });

  it('sorts native and Volunteer events together for the selected calendar day', () => {
    const nativeNoon = {
      id: 'native-noon',
      listDate: '2030-01-02',
      startTime: '12:00',
      title: 'Native noon'
    };
    const nativeAfternoon = {
      id: 'native-afternoon',
      listDate: '2030-01-02',
      startTime: '16:00',
      title: 'Native afternoon'
    };
    const volunteerNoon = {
      eventDates: ['2030-01-02'],
      id: 'volunteer-noon',
      listDate: '2030-01-02',
      startTime: '12:00',
      title: 'Volunteer noon'
    };
    mockSubListInfiniteResult.data = {
      pages: [{ eventRecords: [nativeNoon, nativeAfternoon] }]
    };
    mockUseVolunteerData.mockReturnValue({
      data: [volunteerNoon],
      isLoading: false,
      isRefetching: false,
      refetch: mockVolunteerRefetch
    });
    const calendarSettings = {
      globalSettings: { hdvt: {}, settings: { eventCalendar: { subList: true } } }
    } as any;

    render(
      <NetworkContext.Provider value={{ isConnected: true, isMainserverUp: true }}>
        <SettingsContext.Provider value={calendarSettings}>
          <Calendar
            includeVolunteerEvents
            isListRefreshing={false}
            navigation={{ push: jest.fn() } as any}
            query="eventRecords"
            queryVariables={{}}
          />
        </SettingsContext.Provider>
      </NetworkContext.Provider>
    );

    act(() => mockNativeCalendarProps.onDayPress({ dateString: '2030-01-02' }));

    expect(mockListProps.data).toEqual([nativeNoon, volunteerNoon, nativeAfternoon]);
  });

  it('refreshes native and Volunteer data in the combined calendar', async () => {
    const calendarSettings = {
      globalSettings: { hdvt: {}, settings: { eventCalendar: { subList: true } } }
    } as any;
    render(
      <NetworkContext.Provider value={{ isConnected: true, isMainserverUp: true }}>
        <SettingsContext.Provider value={calendarSettings}>
          <Calendar
            includeVolunteerEvents
            isListRefreshing={false}
            navigation={{ push: jest.fn() } as any}
            query="eventRecords"
            queryVariables={{}}
          />
        </SettingsContext.Provider>
      </NetworkContext.Provider>
    );

    await act(async () => DeviceEventEmitter.emit(REFRESH_CALENDAR));

    expect(mockMainRefetch).toHaveBeenCalledTimes(1);
    expect(mockSubListRefetch).toHaveBeenCalledTimes(1);
    expect(mockVolunteerRefetch).toHaveBeenCalledTimes(1);
  });

  it('lets the calendar own refresh requests while the combined calendar is active', async () => {
    const calendarSettings = {
      globalSettings: {
        hdvt: { events: true },
        settings: { calendarToggle: true, eventCalendar: {} }
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
    mockMainRefetch.mockClear();
    mockSubListRefetch.mockClear();
    mockVolunteerRefetch.mockClear();

    await act(async () => fireEvent.press(view.getByText('list')));

    expect(mockMainRefetch).toHaveBeenCalledTimes(1);
    expect(mockSubListRefetch).not.toHaveBeenCalled();
    expect(mockVolunteerRefetch).toHaveBeenCalledTimes(1);
  });

  it('relies on the sublist query key instead of manually refetching after selection', () => {
    const calendarSettings = {
      globalSettings: { hdvt: {}, settings: { eventCalendar: { subList: true } } }
    } as any;
    render(
      <NetworkContext.Provider value={{ isConnected: true, isMainserverUp: true }}>
        <SettingsContext.Provider value={calendarSettings}>
          <Calendar
            isListRefreshing={false}
            navigation={{ push: jest.fn() } as any}
            query="eventRecords"
            queryVariables={{}}
          />
        </SettingsContext.Provider>
      </NetworkContext.Provider>
    );
    mockSubListRefetch.mockClear();

    act(() => mockNativeCalendarProps.onDayPress({ dateString: '2030-01-02' }));

    expect(mockSubListRefetch).not.toHaveBeenCalled();
  });

  it('does not refetch the calendar on its initial focus', () => {
    render(
      <NetworkContext.Provider value={{ isConnected: true, isMainserverUp: true }}>
        <SettingsContext.Provider value={settingsValue}>
          <Calendar
            includeVolunteerEvents
            isListRefreshing={false}
            navigation={{ push: jest.fn() } as any}
            query="eventRecords"
            queryVariables={{}}
          />
        </SettingsContext.Provider>
      </NetworkContext.Provider>
    );

    mockFocusEffect?.();

    expect(mockMainRefetch).not.toHaveBeenCalled();
    expect(mockVolunteerRefetch).not.toHaveBeenCalled();

    mockFocusEffect?.();

    expect(mockMainRefetch).toHaveBeenCalledTimes(1);
    expect(mockVolunteerRefetch).toHaveBeenCalledTimes(1);
  });

  it('reuses parent data without starting another query in pure Volunteer calendars', () => {
    const onDateRangeChange = jest.fn();
    const volunteerEvent = {
      eventDates: ['2030-01-01'],
      id: 'volunteer-event',
      listDate: '2030-01-01',
      title: 'Volunteer event'
    };
    render(
      <NetworkContext.Provider value={{ isConnected: true, isMainserverUp: true }}>
        <SettingsContext.Provider value={settingsValue}>
          <Calendar
            additionalData={[volunteerEvent]}
            isListRefreshing={false}
            navigation={{ push: jest.fn() } as any}
            onDateRangeChange={onDateRangeChange}
            query="volunteerCalendar"
            queryVariables={{}}
          />
        </SettingsContext.Provider>
      </NetworkContext.Provider>
    );

    expect(mockUseVolunteerData).toHaveBeenLastCalledWith(
      expect.objectContaining({ queryOptions: { enabled: false, keepPreviousData: true } })
    );
    expect(mockNativeCalendarProps.markedDates['2030-01-01']).toEqual(
      expect.objectContaining({ marked: true })
    );

    act(() => mockNativeCalendarProps.onMonthChange({ dateString: '2031-02-01' }));

    expect(onDateRangeChange).toHaveBeenCalledWith(['2031-01-25', '2031-03-07']);

    mockFocusEffect?.();
    mockFocusEffect?.();

    expect(mockVolunteerRefetch).not.toHaveBeenCalled();
  });

  it('keeps the calendar visible while its parent range is refreshing', () => {
    render(
      <NetworkContext.Provider value={{ isConnected: true, isMainserverUp: true }}>
        <SettingsContext.Provider value={settingsValue}>
          <Calendar
            additionalData={[occurrence]}
            isListRefreshing
            navigation={{ push: jest.fn() } as any}
            query="volunteerCalendar"
            queryVariables={{}}
          />
        </SettingsContext.Provider>
      </NetworkContext.Provider>
    );

    expect(mockNativeCalendarProps.displayLoadingIndicator).toBe(true);
    expect(mockNativeCalendarProps.markedDates['2030-01-01']).toEqual(
      expect.objectContaining({ marked: true })
    );
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
