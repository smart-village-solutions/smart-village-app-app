import { QUERY_TYPES } from '../queries';
import { addToStore, readFromStore } from './storageHelper';

const storeKey = 'BOOKMARKED_ITEMS';

export type BookmarkList = {
  [key: string]: string[];
}

export const getBookmarkedItems = async (category?: string) => {
  const bookmarks = await readFromStore(storeKey);
  return (category ? bookmarks?.[category] : bookmarks) as BookmarkList | string[] | undefined;
};

export const getBookmarkedStatus = async (category: string, id: string) => {
  const bookmarks: BookmarkList | undefined = await readFromStore(storeKey);

  return !!bookmarks?.[category]?.find((item) => item === id);
};

export const toggleBookmark = async (category: string, id: string) => {
  const bookmarks: BookmarkList | undefined = await readFromStore(storeKey);

  let newBookmarkList: BookmarkList;

  // if there is no entry yet, create one
  if (!bookmarks) {
    newBookmarkList = { [category]: [id] };
    return addToStore(storeKey, newBookmarkList);
  }

  newBookmarkList = {...bookmarks};
  let newCategory = bookmarks[category];

  if(!newCategory) {
    // if the category does not exist yet, create it
    newBookmarkList[category] = [id];
  } else {
    // otherwise check, if the item is already bookmarked, and if so, unbookmark it
    if(newCategory.find((item) => item === id)) {
      newCategory = newCategory.filter((item) => item !== id);
    } else {
      newCategory.unshift(id);
    }
    newBookmarkList[category] = newCategory;
  }

  return addToStore(storeKey, newBookmarkList);
};

export const mapCategoryToListQueryType = (category: string) => {
  switch(category) {
  case QUERY_TYPES.NEWS_ITEM: return QUERY_TYPES.NEWS_ITEMS;
  case QUERY_TYPES.EVENT_RECORD: return QUERY_TYPES.EVENT_RECORDS;
  case QUERY_TYPES.POINT_OF_INTEREST: return QUERY_TYPES.POINTS_OF_INTEREST;
  case QUERY_TYPES.TOUR: return QUERY_TYPES.TOURS;
  }
};

