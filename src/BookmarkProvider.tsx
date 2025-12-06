import React, { createContext, useCallback, useEffect, useState } from 'react';

import {
  BookmarkList,
  BOOKMARKS_STORE_KEY,
  readFromStore,
  toggleBookmark as toggleBookmarkHelper
} from './helpers';

/** Values exposed via the bookmark context so components can read and mutate favorites. */
type BookmarkProviderValues = {
  bookmarks?: BookmarkList;
  toggleBookmark: (itemType: string, id: string, suffix?: number | string) => Promise<void>;
};

// if we try to toggle a bookmark, while the component is not wrapped
// inside of a provider simply do nothing.
/** Context exposing the persisted bookmark map and mutation helper. */
export const BookmarkContext = createContext<BookmarkProviderValues>({
  toggleBookmark: () => new Promise<void>((resolve) => resolve())
});

/**
 * Loads bookmarks from storage on mount and provides a toggle helper to update the store and state.
 */
export const BookmarkProvider = ({ children }: { children?: React.ReactNode }) => {
  const [bookmarks, setBookmarks] = useState<BookmarkList>();

  const toggleBookmark = useCallback(
    async (itemType: string, id: string, suffix?: number | string) => {
      setBookmarks(await toggleBookmarkHelper(itemType, id, suffix));
    },
    [setBookmarks]
  );

  const loadBookmarks = useCallback(async () => {
    setBookmarks(await readFromStore(BOOKMARKS_STORE_KEY));
  }, [setBookmarks]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  return (
    <BookmarkContext.Provider value={{ bookmarks, toggleBookmark }}>
      {children}
    </BookmarkContext.Provider>
  );
};
