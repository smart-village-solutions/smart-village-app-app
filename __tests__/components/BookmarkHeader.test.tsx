import React from 'react';
import renderer from 'react-test-renderer';

jest.mock('../../src/BookmarkProvider', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ReactLocal = require('react');

  return {
    BookmarkContext: ReactLocal.createContext({ toggleBookmark: jest.fn() })
  };
});

jest.mock('../../src/SettingsProvider', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ReactLocal = require('react');

  return {
    SettingsContext: ReactLocal.createContext({ globalSettings: { settings: {} } })
  };
});

jest.mock('../../src/hooks', () => ({
  useBookmarkedStatus: () => false
}));

jest.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({ colors: { darkText: '#141414', primary: '#107821' } })
}));

jest.mock('../../src/pushNotifications', () => ({
  togglePushDeviceAssignment: jest.fn()
}));

jest.mock('../../src/config', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ReactLocal = require('react');
  const createIcon = (type: string) => (props: unknown) => ReactLocal.createElement(type, props);

  return {
    consts: {
      a11yLabel: {
        bookmarkList: 'Lesezeichen',
        bookmarkListHint: 'Zu Lesezeichen hinzufügen',
        bookmarksHint: 'Zu den Lesezeichen wechseln',
        bookmarksIcon: 'Lesezeichen'
      }
    },
    Icon: {
      BookmarkEmpty: createIcon('mock-bookmark-empty'),
      BookmarkFilled: createIcon('mock-bookmark-filled'),
      HeartEmpty: createIcon('mock-heart-empty'),
      HeartFilled: createIcon('mock-heart-filled'),
      NamedIcon: createIcon('mock-named-icon'),
      Pin: createIcon('mock-pin'),
      PinFilled: createIcon('mock-pin-filled')
    },
    texts: {
      bookmarks: {
        bookmarks: 'Lesezeichen'
      }
    }
  };
});

jest.mock('../../src/components/Text', () => ({
  RegularText: ({ children, ...props }: { children?: React.ReactNode }) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ReactLocal = require('react');

    return ReactLocal.createElement('mock-regular-text', props, children);
  }
}));

import { SettingsContext } from '../../src/SettingsProvider';
import {
  type BookmarkIconConfiguration,
  resolveBookmarkIconConfiguration
} from '../../src/components/bookmarks/BookmarkIcon';
import { BookmarkHeader } from '../../src/components/bookmarks/BookmarkHeader';
import { FavoritesHeader } from '../../src/components/FavoritesHeader';

const route = {
  key: 'detail-key',
  name: 'Detail',
  params: {
    query: 'newsItem',
    queryVariables: { id: '42' }
  }
} as never;

const renderWithIcon = (
  bookmarkIcon: BookmarkIconConfiguration | undefined,
  child: React.ReactNode
) => {
  let tree: renderer.ReactTestRenderer;

  renderer.act(() => {
    tree = renderer.create(
      <SettingsContext.Provider value={{ globalSettings: { settings: { bookmarkIcon } } } as never}>
        {child}
      </SettingsContext.Provider>
    );
  });

  return tree!;
};

const renderBookmark = (bookmarkIcon?: BookmarkIconConfiguration) =>
  renderWithIcon(bookmarkIcon, <BookmarkHeader label="Nachricht merken" route={route} />);

const renderFavoritesHeader = (bookmarkIcon?: BookmarkIconConfiguration) =>
  renderWithIcon(
    bookmarkIcon,
    <FavoritesHeader navigation={{ navigate: jest.fn() } as never} style={{}} />
  );

describe('BookmarkHeader icon configuration', () => {
  it('uses the heart icon pair by default', () => {
    expect(renderBookmark().root.findByType('mock-heart-empty')).toBeTruthy();
    expect(renderFavoritesHeader().root.findByType('mock-heart-filled')).toBeTruthy();
  });

  it('uses the configured preset in detail actions and the header-left shortcut', () => {
    expect(renderBookmark('bookmark').root.findByType('mock-bookmark-empty')).toBeTruthy();
    expect(renderFavoritesHeader('bookmark').root.findByType('mock-bookmark-filled')).toBeTruthy();
  });

  it('uses the same iconName and activeIconName contract as custom tabs', () => {
    const configuration = {
      activeIconName: 'PinFilled',
      iconName: 'Pin'
    };

    expect(renderBookmark(configuration).root.findByType('mock-pin')).toBeTruthy();
    expect(renderFavoritesHeader(configuration).root.findByType('mock-pin-filled')).toBeTruthy();
  });

  it('falls back to heart for an invalid configuration', () => {
    expect(resolveBookmarkIconConfiguration('does-not-exist')).toEqual({
      activeIconName: 'HeartFilled',
      iconName: 'HeartEmpty'
    });

    expect(renderBookmark('does-not-exist').root.findByType('mock-heart-empty')).toBeTruthy();
  });
});
