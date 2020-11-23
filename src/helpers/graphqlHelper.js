import * as _ from 'lodash';
import { QUERY_TYPES } from '../queries';

/**
 * Determine a fetch policy for graphql queries depending on the network status.
 * If offline, only cache should be used.
 * If online, the graphql server should be queried.
 *
 * https://medium.com/@galen.corey/understanding-apollo-fetch-policies-705b5ad71980
 *
 * @return {string} a graphql fetch policy depending on the network status
 */
export const graphqlFetchPolicy = ({ isConnected, isMainserverUp, refreshTime }) => {
  if (isConnected && isMainserverUp) {
    // online and server up

    if (refreshTime) {
      const now = parseInt(Date.now() / 1000, 10); // in seconds from 01.01.1970 00:00:00 UTC

      if (now < refreshTime) {
        // use cached data from phone depending on update interval
        return 'cache-first';
      }
    }

    // use network data to fetch new data from server
    return 'network-only';
  }

  // offline or server down, use cached data from phone
  return 'cache-only';
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
