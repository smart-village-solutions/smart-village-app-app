import { GET_EVENT_RECORD, GET_EVENT_RECORDS } from './eventRecords';
import { GET_NEWS_ITEM, GET_NEWS_ITEMS } from './newsItems';
import { GET_POINT_OF_INTEREST, GET_POINTS_OF_INTEREST } from './pointsOfInterest';
import { GET_PUBLIC_HTML_FILE } from './publicHtmlFiles';
import { GET_PUBLIC_JSON_FILE } from './publicJsonFiles';

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
  case 'publicHtmlFile':
    return GET_PUBLIC_HTML_FILE;
  case 'publicJsonFile':
    return GET_PUBLIC_JSON_FILE;
  }
};
