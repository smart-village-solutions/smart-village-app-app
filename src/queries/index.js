// IMPORT TYPES
// IMPORT CREATE QUERIES
import { CREATE_APP_USER_CONTENT } from './appUserContent';
// IMPORT GET QUERIES
import { GET_CATEGORIES } from './categories';
import { GET_CONSTRUCTION_SITES } from './constructionSite';
import {
  GET_DEBATE,
  GET_DEBATES,
  GET_POLL,
  GET_POLLS,
  GET_PROPOSAL,
  GET_PROPOSALS,
  PUBLIC_COMMENT,
  USER
} from './consul';
import {
  GET_EVENT_RECORD,
  GET_EVENT_RECORDS,
  GET_EVENT_RECORDS_ADDRESSES,
  GET_EVENT_RECORDS_AND_CATEGORIES
} from './eventRecords';
import { GET_GENERIC_ITEM, GET_GENERIC_ITEMS } from './genericItem';
import { GET_LUNCHES } from './lunch';
import { GET_NEWS_ITEM, GET_NEWS_ITEMS, GET_NEWS_ITEMS_AND_DATA_PROVIDERS } from './newsItems';
import { GET_NEWS_ITEMS_DATA_PROVIDERS } from './newsItemsDataProvider';
import { GET_POINTS_OF_INTEREST, GET_POINT_OF_INTEREST } from './pointsOfInterest';
import { GET_POINTS_OF_INTEREST_AND_TOURS } from './pointsOfInterestAndTours';
import { GET_PUBLIC_HTML_FILE } from './publicHtmlFiles';
import { GET_PUBLIC_JSON_FILE } from './publicJsonFiles';
import { GET_TOUR, GET_TOURS, GET_TOUR_STOPS } from './tours';
import { QUERY_TYPES } from './types';
import {
  calendar,
  calendarAll,
  conversation,
  conversations,
  group,
  groupMembership,
  groups,
  groupsMy,
  me,
  posts,
  user
} from './volunteer';
import {
  GET_VOUCHER,
  GET_VOUCHERS,
  GET_VOUCHERS_CATEGORIES,
  GET_VOUCHERS_REDEEMED
} from './vouchers';
import { WASTE_ADDRESSES, WASTE_STREET } from './waste';
import { GET_WEATHER, GET_WEATHER_CURRENT } from './weather';

// EXPORT TYPES
export * from './types';

// EXPORT GET QUERIES
export const getQuery = (query, filterOptions = {}) => {
  const QUERIES = {
    [QUERY_TYPES.CATEGORIES]: GET_CATEGORIES,
    [QUERY_TYPES.CONSTRUCTION_SITES]: GET_CONSTRUCTION_SITES,
    [QUERY_TYPES.EVENT_RECORD]: GET_EVENT_RECORD,
    [QUERY_TYPES.EVENT_RECORDS_ADDRESSES]: GET_EVENT_RECORDS_ADDRESSES,
    [QUERY_TYPES.EVENT_RECORDS_AND_CATEGORIES]: GET_EVENT_RECORDS_AND_CATEGORIES,
    [QUERY_TYPES.EVENT_RECORDS]: GET_EVENT_RECORDS,
    [QUERY_TYPES.GENERIC_ITEM]: GET_GENERIC_ITEM,
    [QUERY_TYPES.GENERIC_ITEMS]: GET_GENERIC_ITEMS,
    [QUERY_TYPES.LUNCHES]: GET_LUNCHES,
    [QUERY_TYPES.NEWS_ITEM]: GET_NEWS_ITEM,
    [QUERY_TYPES.NEWS_ITEMS]: filterOptions.showNewsFilter
      ? GET_NEWS_ITEMS_AND_DATA_PROVIDERS
      : GET_NEWS_ITEMS,
    [QUERY_TYPES.NEWS_ITEMS_DATA_PROVIDER]: GET_NEWS_ITEMS_DATA_PROVIDERS,
    [QUERY_TYPES.TOUR]: GET_TOUR,
    [QUERY_TYPES.TOURS]: GET_TOURS,
    [QUERY_TYPES.TOUR_STOPS]: GET_TOUR_STOPS,
    [QUERY_TYPES.POINT_OF_INTEREST]: GET_POINT_OF_INTEREST,
    [QUERY_TYPES.POINTS_OF_INTEREST]: GET_POINTS_OF_INTEREST,
    [QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS]: GET_POINTS_OF_INTEREST_AND_TOURS,
    [QUERY_TYPES.PUBLIC_HTML_FILE]: GET_PUBLIC_HTML_FILE,
    [QUERY_TYPES.PUBLIC_JSON_FILE]: GET_PUBLIC_JSON_FILE,
    [QUERY_TYPES.WASTE_ADDRESSES]: WASTE_ADDRESSES,
    [QUERY_TYPES.WASTE_STREET]: WASTE_STREET,
    [QUERY_TYPES.VOUCHER]: GET_VOUCHER,
    [QUERY_TYPES.VOUCHERS_CATEGORIES]: GET_VOUCHERS_CATEGORIES,
    [QUERY_TYPES.VOUCHERS_REDEEMED]: GET_VOUCHERS_REDEEMED,
    [QUERY_TYPES.VOUCHERS]: GET_VOUCHERS,
    [QUERY_TYPES.WEATHER_MAP]: GET_WEATHER,
    [QUERY_TYPES.WEATHER_MAP_CURRENT]: GET_WEATHER_CURRENT,

    // CONSUL QUERIES
    [QUERY_TYPES.CONSUL.DEBATE]: GET_DEBATE,
    [QUERY_TYPES.CONSUL.DEBATES]: GET_DEBATES,
    [QUERY_TYPES.CONSUL.POLL]: GET_POLL,
    [QUERY_TYPES.CONSUL.POLLS]: GET_POLLS,
    [QUERY_TYPES.CONSUL.PROPOSAL]: GET_PROPOSAL,
    [QUERY_TYPES.CONSUL.PROPOSALS]: GET_PROPOSALS,
    [QUERY_TYPES.CONSUL.PUBLIC_COMMENT]: PUBLIC_COMMENT,
    [QUERY_TYPES.CONSUL.USER]: USER,

    // VOLUNTEER QUERIES
    [QUERY_TYPES.VOLUNTEER.APPLICANTS]: groupMembership,
    [QUERY_TYPES.VOLUNTEER.CALENDAR]: calendar,
    [QUERY_TYPES.VOLUNTEER.CALENDAR_ALL]: calendarAll,
    [QUERY_TYPES.VOLUNTEER.CALENDAR_ALL_MY]: calendarAll,
    [QUERY_TYPES.VOLUNTEER.CONVERSATION]: conversation,
    [QUERY_TYPES.VOLUNTEER.CONVERSATIONS]: conversations,
    [QUERY_TYPES.VOLUNTEER.GROUP]: group,
    [QUERY_TYPES.VOLUNTEER.GROUPS]: groups,
    [QUERY_TYPES.VOLUNTEER.GROUPS_MY]: groupsMy,
    [QUERY_TYPES.VOLUNTEER.MEMBERS]: groupMembership,
    [QUERY_TYPES.VOLUNTEER.POSTS]: posts,
    [QUERY_TYPES.VOLUNTEER.PROFILE]: me,
    [QUERY_TYPES.VOLUNTEER.USER]: user
  };

  return QUERIES[query];
};

export const getFetchMoreQuery = (query) => {
  const FETCH_MORE_QUERIES = {
    [QUERY_TYPES.EVENT_RECORDS]: GET_EVENT_RECORDS,
    [QUERY_TYPES.GENERIC_ITEMS]: GET_GENERIC_ITEMS,
    [QUERY_TYPES.NEWS_ITEMS]: GET_NEWS_ITEMS,
    [QUERY_TYPES.POINTS_OF_INTEREST]: GET_POINTS_OF_INTEREST,
    [QUERY_TYPES.TOURS]: GET_TOURS,
    [QUERY_TYPES.VOUCHERS]: GET_VOUCHERS,
    [QUERY_TYPES.VOUCHERS_REDEEMED]: GET_VOUCHERS_REDEEMED
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
