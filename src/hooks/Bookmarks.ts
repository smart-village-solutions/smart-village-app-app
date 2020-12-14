import { useCallback, useEffect, useState } from 'react';

import { BookmarkList, getBookmarkedItems } from '../helpers/bookmarkHelpers';

export const useBookmarks = (itemType?: string, category?: number) => {
  const [bookmarks, setBookmarks] = useState<BookmarkList | string[] | undefined>();

  const loadBookmarks = useCallback(async () => {
    setBookmarks(await getBookmarkedItems(itemType, category));
  }, [itemType, setBookmarks]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  return bookmarks;
};
