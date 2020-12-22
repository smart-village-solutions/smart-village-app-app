import { QUERY_TYPES } from '../queries';
import { addToStore, readFromStore } from './storageHelper';

export const BOOKMARKS_STORE_KEY = 'BOOKMARKED_ITEMS';

export type BookmarkList = {
  [key: string]: string[];
};

export const getListQueryType = (singleItemType: string) => {
  switch (singleItemType) {
    case QUERY_TYPES.EVENT_RECORD:
      return QUERY_TYPES.EVENT_RECORDS;
    case QUERY_TYPES.NEWS_ITEM:
      return QUERY_TYPES.NEWS_ITEMS;
    case QUERY_TYPES.TOUR:
      return QUERY_TYPES.TOURS;
    case QUERY_TYPES.POINT_OF_INTEREST:
      return QUERY_TYPES.POINTS_OF_INTEREST;
    default:
      return singleItemType;
  }
};

// add category as a suffix to the itemType to avoid handling NewsItem different
// than the other item types in every other component
// this way the hierarchy in the storage remains flat and homogeneous
export const getKeyFromTypeAndCategory = (itemType: string, category?: number) =>
  category ? `${itemType}-${category}` : itemType;

export const toggleBookmark = async (itemType: string, id: string, category?: number) => {
  const bookmarks: BookmarkList | undefined = await readFromStore(BOOKMARKS_STORE_KEY);
  const listQueryType = getListQueryType(itemType);

  // FIXME: add error handling
  if (!listQueryType) return;

  const key = getKeyFromTypeAndCategory(listQueryType, category);

  let newBookmarkList: BookmarkList;

  // if there is no entry yet, create one
  if (!bookmarks) {
    newBookmarkList = { [key]: [id] };
    addToStore(BOOKMARKS_STORE_KEY, newBookmarkList);
    return newBookmarkList;
  }

  newBookmarkList = { ...bookmarks };
  let newCategory = bookmarks[key];

  if (!newCategory) {
    // if the category does not exist yet, create it
    newBookmarkList[key] = [id];
  } else {
    // otherwise check, if the item is already bookmarked, and if so, unbookmark it
    if (newCategory.find((item) => item === id)) {
      newCategory = newCategory.filter((item) => item !== id);
    } else {
      newCategory.unshift(id);
    }
    newBookmarkList[key] = newCategory;
  }

  addToStore(BOOKMARKS_STORE_KEY, newBookmarkList);
  return newBookmarkList;
};
