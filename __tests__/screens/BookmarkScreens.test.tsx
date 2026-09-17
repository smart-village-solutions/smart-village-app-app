import React from 'react';
import renderer from 'react-test-renderer';

import { SettingsContext, initialContext } from '../../src/SettingsProvider';
import { parseListItemsFromQuery } from '../../src/helpers';
import { BookmarkCategoryScreen } from '../../src/screens/BookmarkCategoryScreen';
import { BookmarkScreen } from '../../src/screens/BookmarkScreen';

let mockBookmarks: Record<string, string[]> | undefined;
let mockQueryErrors: Record<string, boolean> = {};

jest.mock('expo-router/react-navigation', () => ({
  useFocusEffect: jest.fn()
}));

jest.mock('react-query', () => ({
  useQuery: jest.fn(([query]: [string]) => ({
    isLoading: false,
    isError: !!mockQueryErrors[query],
    data: { NewsItems: [{ id: 'news-1' }] }
  }))
}));

jest.mock('../../src/ProfileProvider', () => ({
  useProfileContext: () => ({
    isLoggedIn: true,
    refresh: jest.fn()
  })
}));

jest.mock('../../src/components', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ReactLocal = require('react');
  const MockWrapper = ({ children }: { children: React.ReactNode }) =>
    ReactLocal.createElement('mock-wrapper', null, children);

  return {
    BookmarkSection: (props: Record<string, unknown>) =>
      ReactLocal.createElement('mock-bookmark-section', props),
    ListComponent: (props: Record<string, unknown>) =>
      ReactLocal.createElement('mock-list-component', props),
    LoadingContainer: MockWrapper,
    RegularText: MockWrapper,
    SafeAreaViewFlex: MockWrapper,
    Wrapper: MockWrapper
  };
});

jest.mock('../../src/config', () => ({
  colors: { refreshControl: '#000000' },
  consts: {
    MATOMO_TRACKING: {
      SCREEN_VIEW: {
        BOOKMARKS: 'bookmarks',
        BOOKMARK_CATEGORY: 'bookmark-category'
      }
    },
    REFRESH_INTERVALS: { BOOKMARKS: 0 }
  },
  texts: {
    bookmarks: {
      noBookmarksinCategory: 'No bookmarks in category',
      noBookmarksYet: 'No bookmarks'
    },
    categoryTitles: {
      pointsOfInterest: 'Points of interest',
      tours: 'Tours'
    },
    errors: { noData: 'No data', unexpected: 'Unexpected error' },
    homeTitles: { events: 'Events' },
    navigationTitles: { home: 'Overview' },
    screenTitles: { events: 'Events overview', volunteer: { home: 'Volunteer' } },
    volunteer: { events: 'Volunteer events' }
  }
}));

jest.mock('../../src/helpers', () => ({
  getKeyFromTypeAndSuffix: (itemType: string, suffix?: number | string) =>
    suffix ? `${itemType}-${suffix}` : itemType,
  graphqlFetchPolicy: jest.fn(() => 'cache-first'),
  parseListItemsFromQuery: jest.fn(() => [{ id: 'news-1' }])
}));

jest.mock('../../src/helpers/genericTypeHelper', () => ({
  getGenericItemSectionTitle: (genericType: string) => genericType
}));

jest.mock('../../src/hooks', () => ({
  useBookmarks: () => mockBookmarks,
  useMatomoTrackScreenView: jest.fn(),
  useNewsCategories: () => [
    {
      categoryId: 'news',
      categoryTitle: 'News',
      categoryTitleDetail: 'News detail'
    }
  ]
}));

jest.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({ colors: { refreshControl: '#000000' } })
}));

jest.mock('../../src/queries', () => ({
  getQuery: jest.fn(),
  QUERY_TYPES: {
    EVENT_RECORDS: 'EventRecords',
    GENERIC_ITEMS: 'GenericItems',
    NEWS_ITEMS: 'NewsItems',
    POINTS_OF_INTEREST: 'PointsOfInterest',
    TOURS: 'Tours',
    VOLUNTEER: { CALENDAR_ALL: 'CalendarAll' },
    VOUCHERS: 'Vouchers'
  }
}));

jest.mock('../../src/types', () => ({
  GenericType: {
    Commercial: 'commercial',
    Deadline: 'deadline',
    Job: 'job',
    Noticeboard: 'noticeboard',
    ParticipationProject: 'participation-project'
  }
}));

describe('bookmark list types', () => {
  const navigation = { navigate: jest.fn() };

  beforeEach(() => {
    mockQueryErrors = {};
    mockBookmarks = {
      'NewsItems-news': ['news-1'],
      EventRecords: ['event-1'],
      CalendarAll: ['volunteer-event-1']
    };
  });

  it('does not override the configured list type in bookmark sections', () => {
    let testRenderer: renderer.ReactTestRenderer;

    renderer.act(() => {
      testRenderer = renderer.create(
        <SettingsContext.Provider value={initialContext}>
          <BookmarkScreen navigation={navigation} route={{}} />
        </SettingsContext.Provider>
      );
    });

    const sections = testRenderer!.root.findAllByType('mock-bookmark-section');

    expect(sections).toHaveLength(2);
    expect(sections.every(({ props }) => props.listType === undefined)).toBe(true);
    expect(sections.find(({ props }) => props.query === 'EventRecords')?.props).toEqual(
      expect.objectContaining({
        additionalIds: ['volunteer-event-1'],
        additionalQuery: 'CalendarAll',
        sectionTitle: 'Events overview'
      })
    );
    expect(sections.some(({ props }) => props.query === 'CalendarAll')).toBe(false);
  });

  it('does not override the configured list type in a bookmark category', () => {
    let testRenderer: renderer.ReactTestRenderer;

    renderer.act(() => {
      testRenderer = renderer.create(
        <BookmarkCategoryScreen
          navigation={navigation}
          route={{ params: { query: 'NewsItems', suffix: 'news' } }}
        />
      );
    });

    const list = testRenderer!.root.findByType('mock-list-component');

    expect(list.props.listType).toBeUndefined();
  });

  it('keeps the time on native events in the combined event category', () => {
    renderer.act(() => {
      renderer.create(
        <BookmarkCategoryScreen
          navigation={navigation}
          route={{
            params: {
              additionalQuery: 'CalendarAll',
              query: 'EventRecords',
              queryVariables: { ids: ['event-1'], onlyUniqEvents: true }
            }
          }}
        />
      );
    });

    expect(parseListItemsFromQuery).toHaveBeenCalledWith(
      'EventRecords',
      expect.anything(),
      '',
      expect.objectContaining({ withDate: true, withTime: true })
    );
  });

  it.each([
    ['native', { EventRecords: ['event-1'] }],
    ['Volunteer', { CalendarAll: ['volunteer-event-1'] }]
  ])('renders the combined event category with only %s bookmarks', (_label, bookmarks) => {
    mockBookmarks = bookmarks;

    let testRenderer: renderer.ReactTestRenderer;

    renderer.act(() => {
      testRenderer = renderer.create(
        <BookmarkCategoryScreen
          navigation={navigation}
          route={{
            params: {
              additionalQuery: 'CalendarAll',
              query: 'EventRecords'
            }
          }}
        />
      );
    });

    expect(testRenderer!.root.findAllByType('mock-list-component')).toHaveLength(1);
  });

  it('shows an error instead of a partial combined category when one source fails', () => {
    mockQueryErrors = { CalendarAll: true };

    let testRenderer: renderer.ReactTestRenderer;

    renderer.act(() => {
      testRenderer = renderer.create(
        <BookmarkCategoryScreen
          navigation={navigation}
          route={{
            params: {
              additionalQuery: 'CalendarAll',
              query: 'EventRecords'
            }
          }}
        />
      );
    });

    expect(
      testRenderer!.root.findAllByProps({ children: 'Unexpected error' }).length
    ).toBeGreaterThan(0);
    expect(testRenderer!.root.findAllByType('mock-list-component')).toHaveLength(0);
  });
});
