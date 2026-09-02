import React from 'react';
import renderer from 'react-test-renderer';

import { SettingsContext, initialContext } from '../../src/SettingsProvider';
import { BookmarkCategoryScreen } from '../../src/screens/BookmarkCategoryScreen';
import { BookmarkScreen } from '../../src/screens/BookmarkScreen';

jest.mock('expo-router/react-navigation', () => ({
  useFocusEffect: jest.fn()
}));

jest.mock('react-query', () => ({
  useQuery: jest.fn(() => ({
    isLoading: false,
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
    errors: { noData: 'No data' },
    homeTitles: { events: 'Events' }
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
  useBookmarks: (...args: unknown[]) =>
    args.length
      ? ['news-1']
      : {
          'NewsItems-news': ['news-1'],
          EventRecords: ['event-1']
        },
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
});
