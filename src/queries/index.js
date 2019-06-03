import {
  GET_EVENT_RECORD,
  GET_EVENT_RECORDS,
  GET_NEWS_ITEM,
  GET_NEWS_ITEMS,
  GET_POINT_OF_INTEREST,
  GET_POINTS_OF_INTEREST,
  GET_PUBLIC_JSON_FILE
} from '../queries';

export const getQuery = (query) => {
  switch (query) {
  case 'eventRecord':
    return GET_EVENT_RECORD;
  case 'eventRecords':
    return GET_EVENT_RECORDS;
  case 'newsItems':
    return GET_NEWS_ITEMS;
  case 'newsItem':
    return GET_NEWS_ITEM;
  case 'pointOfInterest':
    return GET_POINT_OF_INTEREST;
  case 'pointsOfInterest':
    return GET_POINTS_OF_INTEREST;
  case 'publicJsonFile':
    return GET_PUBLIC_JSON_FILE;
  }
};

export * from './eventRecords';
export * from './newsItems';
export * from './pointsOfInterest';
export * from './publicHtmlFiles';
export * from './publicJsonFiles';
