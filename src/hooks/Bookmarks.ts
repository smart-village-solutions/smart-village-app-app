import { useCallback, useEffect, useState } from 'react';

import { BookmarkList, getBookmarkedItems } from '../helpers/bookmarkHelpers';

export const useBookmarks = (category?: string) => {
  const [bookmarks, setBookmarks] = useState<BookmarkList | string[] | undefined>();

  const loadBookmarks = useCallback(async () => {
    setBookmarks(await getBookmarkedItems(category));
  }, [category, setBookmarks]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  return bookmarks;
};
