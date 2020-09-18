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

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const getQuery = (query, filterOptions = {}) => {
  switch (query) {
  case 'categories':
    return GET_CATEGORIES;
  case 'eventRecord':
    return GET_EVENT_RECORD;
  case 'eventRecords':
    return GET_EVENT_RECORDS;
  case 'newsItem':
    return GET_NEWS_ITEM;
  case 'newsItems':
    return filterOptions.showNewsFilter
      ? GET_FILTERED_NEWS_ITEMS_AND_DATA_PROVIDERS
      : GET_NEWS_ITEMS;
  case 'tour':
    return GET_TOUR;
  case 'tours':
    return GET_TOURS;
  case 'pointOfInterest':
    return GET_POINT_OF_INTEREST;
  case 'pointsOfInterest':
    return GET_POINTS_OF_INTEREST;
  case 'pointsOfInterestAndTours':
    return GET_POINTS_OF_INTEREST_AND_TOURS;
  case 'publicHtmlFile':
    return GET_PUBLIC_HTML_FILE;
  case 'publicJsonFile':
    return GET_PUBLIC_JSON_FILE;
  }
};
/* eslint-enable complexity */

export const getFetchMoreQuery = (query, filterOptions = {}) => {
  switch (query) {
  case 'eventRecords':
    return GET_EVENT_RECORDS;
  case 'newsItems':
    return filterOptions.showNewsFilter ? GET_FILTERED_NEWS_ITEMS : GET_NEWS_ITEMS;
  }
};
