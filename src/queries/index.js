// IMPORT TYPES
import { QUERY_TYPES } from './types';

// IMPORT GET QUERIES
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

// IMPORT CREATE QUERIES
import { CREATE_APP_USER_CONTENT } from './appUserContent';

// EXPORT TYPES
export * from './types';

// EXPORT GET QUERIES
export const getQuery = (query, filterOptions = {}) => {
  const QUERIES = {
    [QUERY_TYPES.CATEGORIES]: GET_CATEGORIES,
    [QUERY_TYPES.EVENT_RECORD]: GET_EVENT_RECORD,
    [QUERY_TYPES.EVENT_RECORDS]: GET_EVENT_RECORDS,
    [QUERY_TYPES.NEWS_ITEM]: GET_NEWS_ITEM,
    [QUERY_TYPES.NEWS_ITEMS]: filterOptions.showNewsFilter
      ? GET_FILTERED_NEWS_ITEMS_AND_DATA_PROVIDERS
      : GET_NEWS_ITEMS,
    [QUERY_TYPES.TOUR]: GET_TOUR,
    [QUERY_TYPES.TOURS]: GET_TOURS,
    [QUERY_TYPES.POINT_OF_INTEREST]: GET_POINT_OF_INTEREST,
    [QUERY_TYPES.POINTS_OF_INTEREST]: GET_POINTS_OF_INTEREST,
    [QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS]: GET_POINTS_OF_INTEREST_AND_TOURS,
    [QUERY_TYPES.PUBLIC_HTML_FILE]: GET_PUBLIC_HTML_FILE,
    [QUERY_TYPES.PUBLIC_JSON_FILE]: GET_PUBLIC_JSON_FILE
  };

  return QUERIES[query];
};

export const getFetchMoreQuery = (query, filterOptions = {}) => {
  const FETCH_MORE_QUERIES = {
    [QUERY_TYPES.EVENT_RECORDS]: GET_EVENT_RECORDS,
    [QUERY_TYPES.NEWS_ITEMS]: filterOptions.showNewsFilter
      ? GET_FILTERED_NEWS_ITEMS
      : GET_NEWS_ITEMS
  };

  return FETCH_MORE_QUERIES[query];
};

// EXPORT CREATE QUERIES
export const createQuery = (query) => {
  const QUERIES = {
    [QUERY_TYPES.APP_USER_CONTENT]: CREATE_APP_USER_CONTENT
  };

  return QUERIES[query];
};
