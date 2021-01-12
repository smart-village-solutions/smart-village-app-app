import { consts } from '../config';
import { QUERY_TYPES } from '../queries';

const { ROOT_ROUTE_NAMES } = consts;

/**
 * Determines the root route name for data based on its query.
 *
 * @param {string} query query key for the data type
 *
 * @return {string} a root route representation for a query type
 */
export const rootRouteName = (query) =>
  ({
    [QUERY_TYPES.EVENT_RECORD]: ROOT_ROUTE_NAMES.EVENT_RECORDS,
    [QUERY_TYPES.NEWS_ITEM]: ROOT_ROUTE_NAMES.NEWS_ITEMS,
    [QUERY_TYPES.POINT_OF_INTEREST]: ROOT_ROUTE_NAMES.POINTS_OF_INTEREST_AND_TOURS,
    [QUERY_TYPES.TOUR]: ROOT_ROUTE_NAMES.POINTS_OF_INTEREST_AND_TOURS
  }[query]);
