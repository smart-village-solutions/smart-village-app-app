import _camelCase from 'lodash/camelCase';

import { QUERY_TYPES } from '../queries/types';

export const DEFAULT_SEARCH_FILTER = [
  'news_item',
  'event_record',
  'point_of_interest',
  'tour',
  'generic_item'
];

export const pluralizeSearchRecordType = (recordType) => {
  switch (_camelCase(recordType)) {
    case QUERY_TYPES.NEWS_ITEM:
      return QUERY_TYPES.NEWS_ITEMS;
    case QUERY_TYPES.EVENT_RECORD:
      return QUERY_TYPES.EVENT_RECORDS;
    case QUERY_TYPES.POINT_OF_INTEREST:
      return QUERY_TYPES.POINTS_OF_INTEREST;
    case QUERY_TYPES.TOUR:
      return QUERY_TYPES.TOURS;
    case QUERY_TYPES.GENERIC_ITEM:
      return QUERY_TYPES.GENERIC_ITEMS;
    default:
      return recordType;
  }
};

/**
 * Search all results with a given config.
 *
 * @param {object} config configuration for the search with different possible attributes:
 *                  results - ,
 *                  previousResults - ,
 *                  category - ,
 *                  keyword - ,
 *                  character -
 *
 * @return {array} a filtered array of elements
 */
export const search = (config) => {
  const { results, previousResults, category, keyword, character } = config;
  let searchResults = previousResults || results;

  if (category) {
    // TODO: filter for category, when we will receive categories
    searchResults = results;
  }

  // keyword can be an empty string, so there is the need to check explicitly for not undefined
  if (keyword !== undefined) {
    if (keyword.length > 3) {
      searchResults = results.filter((entry) =>
        entry.params.data.name.toLowerCase().includes(keyword.toLowerCase().trim())
      );
    } else if (keyword.length === 0) {
      // show nothing if nothing is searched for
      searchResults = [];
    }
  }

  if (character) {
    searchResults = results.filter((entry) =>
      entry.params.data.name.toLowerCase().startsWith(character.toLowerCase())
    );
  }

  return searchResults;
};
