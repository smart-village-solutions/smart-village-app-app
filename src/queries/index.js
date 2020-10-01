import { GET_CATEGORIES } from './categories';
import { GET_EVENT_RECORD, GET_EVENT_RECORDS } from './eventRecords';
import {
  GET_NEWS_ITEM,
  GET_NEWS_ITEMS,
  GET_FILTERED_NEWS_ITEMS,
  GET_FILTERED_NEWS_ITEMS_AND_DATA_PROVIDERS
} from './newsItems';
import { GET_POINT_OF_INTEREST, GET_POINTS_OF_INTEREST } from './pointsOfInterest';
import { GET_TOUR, GET_TOURS } from './tours';
import { GET_POINTS_OF_INTEREST_AND_TOURS } from './pointsOfInterestAndTours';
import { GET_PUBLIC_HTML_FILE } from './publicHtmlFiles';
import { GET_PUBLIC_JSON_FILE } from './publicJsonFiles';
import { QUERY_TYPES } from './types';

export * from './types';

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const getQuery = (query, filterOptions = {}) => {
  switch (query) {
  case QUERY_TYPES.CATEGORIES:
    return GET_CATEGORIES;
  case QUERY_TYPES.EVENT_RECORD:
    return GET_EVENT_RECORD;
  case QUERY_TYPES.EVENT_RECORDS:
    return GET_EVENT_RECORDS;
  case QUERY_TYPES.NEWS_ITEM:
    return GET_NEWS_ITEM;
  case QUERY_TYPES.NEWS_ITEMS:
    return filterOptions.showNewsFilter
      ? GET_FILTERED_NEWS_ITEMS_AND_DATA_PROVIDERS
      : GET_NEWS_ITEMS;
  case QUERY_TYPES.TOUR:
    return GET_TOUR;
  case QUERY_TYPES.TOURS:
    return GET_TOURS;
  case QUERY_TYPES.POINT_OF_INTEREST:
    return GET_POINT_OF_INTEREST;
  case QUERY_TYPES.POINTS_OF_INTEREST:
    return GET_POINTS_OF_INTEREST;
  case QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS:
    return GET_POINTS_OF_INTEREST_AND_TOURS;
  case QUERY_TYPES.PUBLIC_HTML_FILE:
    return GET_PUBLIC_HTML_FILE;
  case QUERY_TYPES.PUBLIC_JSON_FILE:
    return GET_PUBLIC_JSON_FILE;
  }
};
/* eslint-enable complexity */

export const getFetchMoreQuery = (query, filterOptions = {}) => {
  switch (query) {
  case QUERY_TYPES.EVENT_RECORDS:
    return GET_EVENT_RECORDS;
  case QUERY_TYPES.NEWS_ITEMS:
    return filterOptions.showNewsFilter ? GET_FILTERED_NEWS_ITEMS : GET_NEWS_ITEMS;
  }
};
