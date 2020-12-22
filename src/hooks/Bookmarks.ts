import { useContext } from 'react';

import { BookmarkContext } from '../BookmarkProvider';
import { getKeyFromTypeAndCategory, getListQueryType } from '../helpers';

export const useBookmarks = (itemType?: string, category?: number) => {
  const { bookmarks } = useContext(BookmarkContext);

  if (itemType && bookmarks) {
    const key = getKeyFromTypeAndCategory(itemType, category);
    return bookmarks[key];
  }

  return bookmarks;
};

export const useBookmarkedStatus = (itemType: string, id: string, category?: number) => {
  const { bookmarks } = useContext(BookmarkContext);

  const key = getKeyFromTypeAndCategory(getListQueryType(itemType), category);

  return !!bookmarks?.[key]?.find((item) => item === id);
};
