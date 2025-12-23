import { QUERY_TYPES } from '../queries';

import { addToStore, readFromStore } from './storageHelper';

/** Storage key used to persist bookmark state in AsyncStorage. */
export const BOOKMARKS_STORE_KEY = 'BOOKMARKED_ITEMS';

/** Flat map of bookmark categories keyed by list query type plus optional suffix. */
export type BookmarkList = {
  [key: string]: string[];
};

/**
 * Maps a single-item GraphQL query type to its list counterpart.
 */
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
    case QUERY_TYPES.GENERIC_ITEM:
      return QUERY_TYPES.GENERIC_ITEMS;
    default:
      return singleItemType;
  }
};

// add category as a suffix to the itemType to avoid handling NewsItem different
// than the other item types in every other component
// this way the hierarchy in the storage remains flat and homogeneous
/**
 * Normalizes a storage key by appending an optional suffix (e.g. category Id) to the item type.
 */
export const getKeyFromTypeAndSuffix = (itemType: string, suffix?: number | string) =>
  suffix ? `${itemType}-${suffix}` : itemType;

/**
 * Adds or removes the given `id` from the bookmark list belonging to `itemType` and optional suffix.
 * Persists the updated `BookmarkList` back into storage and returns the new snapshot.
 */
export const toggleBookmark = async (itemType: string, id: string, suffix?: number | string) => {
  const bookmarks: BookmarkList | undefined = await readFromStore(BOOKMARKS_STORE_KEY);
  const listQueryType = getListQueryType(itemType);

  // FIXME: add error handling
  if (!listQueryType) return;

  const key = getKeyFromTypeAndSuffix(listQueryType, suffix);

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
