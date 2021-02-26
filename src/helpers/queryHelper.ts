import { consts, texts } from '../config';
import { QUERY_TYPES } from '../queries';

const { ROOT_ROUTE_NAMES } = consts;

/**
 * Determines the root route name for data based on its query.
 */
export const rootRouteName = (query: string) =>
  ({
    [QUERY_TYPES.EVENT_RECORD]: ROOT_ROUTE_NAMES.EVENT_RECORDS,
    [QUERY_TYPES.NEWS_ITEM]: ROOT_ROUTE_NAMES.NEWS_ITEMS,
    [QUERY_TYPES.POINT_OF_INTEREST]: ROOT_ROUTE_NAMES.POINTS_OF_INTEREST_AND_TOURS,
    [QUERY_TYPES.TOUR]: ROOT_ROUTE_NAMES.POINTS_OF_INTEREST_AND_TOURS
  }[query]);

export const getTitleForQuery = (query: string) => {
  switch (query) {
    case QUERY_TYPES.NEWS_ITEMS:
      return texts.homeCategoriesNews.categoryTitle;
    case QUERY_TYPES.POINTS_OF_INTEREST:
      return texts.categoryTitles.pointsOfInterest;
    case QUERY_TYPES.TOURS:
      return texts.categoryTitles.tours;
    case QUERY_TYPES.EVENT_RECORDS:
      return texts.homeTitles.events;
    default:
      return query;
  }
};
