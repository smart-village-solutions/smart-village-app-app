import { useContext } from 'react';

import { BookmarkContext } from '../BookmarkProvider';
import { getKeyFromTypeAndSuffix, getListQueryType } from '../helpers';

export const useBookmarks = (itemType?: string, category?: number) => {
  const { bookmarks } = useContext(BookmarkContext);

  if (itemType && bookmarks) {
    const key = getKeyFromTypeAndSuffix(itemType, category);
    return bookmarks[key];
  }

  return bookmarks;
};

export const useBookmarkedStatus = (itemType: string, id: string, suffix?: number | string) => {
  const { bookmarks } = useContext(BookmarkContext);

  const key = getKeyFromTypeAndSuffix(getListQueryType(itemType), suffix);

  return !!bookmarks?.[key]?.find((item) => item === id);
};
