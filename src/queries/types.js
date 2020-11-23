import * as _ from 'lodash';

export const QUERY_TYPES = {
  APP_USER_CONTENT: 'appUserContent',
  CATEGORIES: 'categories',
  EVENT_RECORD: 'eventRecord',
  EVENT_RECORDS: 'eventRecords',
  NEWS_ITEM: 'newsItem',
  NEWS_ITEMS: 'newsItems',
  POINT_OF_INTEREST: 'pointOfInterest',
  POINTS_OF_INTEREST: 'pointsOfInterest',
  POINTS_OF_INTEREST_AND_TOURS: 'pointsOfInterestAndTours',
  PUBLIC_HTML_FILE: 'publicHtmlFile',
  PUBLIC_JSON_FILE: 'publicJsonFile',
  TOUR: 'tour',
  TOURS: 'tours'
};

/**
 * Parse a query type from json string if one matches.
 * @argument {string} input
 * @return {string | undefined}
 */
export const getQueryType = (input) => {
  const camelCaseInput = _.camelCase(input);
  const availableTypes = [QUERY_TYPES.TOUR,
    QUERY_TYPES.POINTS_OF_INTEREST,
    QUERY_TYPES.NEWS_ITEM,
    QUERY_TYPES.EVENT_RECORD];
  return availableTypes.find((type) => type === camelCaseInput);
};
