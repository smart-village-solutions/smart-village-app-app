import _memoize from 'lodash/memoize';

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
export const search = _memoize(
  (config) => {
    const { results, previousResults, category, keyword, character } = config;
    let searchResults = previousResults || results;
    // console.log('Call search for', { category, keyword, character });

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
  },
  ({ category, keyword, character, location, results }) =>
    [category, keyword, character, location, results.length].join('-')
);
