import _camelCase from 'lodash/camelCase';

export const QUERY_TYPES = {
  APP_USER_CONTENT: 'appUserContent',
  CATEGORIES: 'categories',
  CONSTRUCTION_SITES: 'constructionSites',
  EVENT_RECORD: 'eventRecord',
  EVENT_RECORDS: 'eventRecords',
  GENERIC_ITEM: 'genericItem',
  GENERIC_ITEMS: 'genericItems',
  LUNCHES: 'lunches',
  NEWS_ITEM: 'newsItem',
  NEWS_ITEMS: 'newsItems',
  POINT_OF_INTEREST: 'pointOfInterest',
  POINTS_OF_INTEREST: 'pointsOfInterest',
  POINTS_OF_INTEREST_AND_TOURS: 'pointsOfInterestAndTours',
  PUBLIC_HTML_FILE: 'publicHtmlFile',
  PUBLIC_JSON_FILE: 'publicJsonFile',
  TOUR: 'tour',
  TOURS: 'tours',
  WASTE_ADDRESSES: 'wasteAddresses',
  WASTE_STREET: 'wasteStreet',
  WEATHER_MAP: 'weatherMap',
  WEATHER_MAP_CURRENT: 'weatherMapCurrent'
};

/**
 * Parse a query type from json string if one matches.
 * @param {string} input
 * @return {string | undefined}
 */
export const getQueryType = (input) => {
  const camelCaseInput = _camelCase(input);
  const availableTypes = [
    QUERY_TYPES.TOUR,
    QUERY_TYPES.POINTS_OF_INTEREST,
    QUERY_TYPES.NEWS_ITEM,
    QUERY_TYPES.EVENT_RECORD
  ];
  return availableTypes.find((type) => type === camelCaseInput);
};
