import { consts } from '../config/consts';
import { QUERY_TYPES } from '../queries/types';

const { LIST_TYPES } = consts;
const validListTypes = Object.values(LIST_TYPES);
const dedicatedTextQueries = [
  QUERY_TYPES.PROFILE.GET_CONVERSATIONS,
  QUERY_TYPES.VOLUNTEER.POSTS,
  QUERY_TYPES.VOLUNTEER.CONVERSATIONS,
  QUERY_TYPES.VOLUNTEER.APPLICANTS,
  QUERY_TYPES.SUE.REQUESTS,
  QUERY_TYPES.SUE.MY_REQUESTS,
  QUERY_TYPES.VOUCHERS,
  QUERY_TYPES.VOUCHERS_REDEEMED
];

export const resolveListType = (query, globalSettings, listTypesSettings, listType) => {
  // These queries supply grouped records to content-specific renderers.
  if (query === QUERY_TYPES.SEARCH || query === QUERY_TYPES.WASTE_STREET) {
    return LIST_TYPES.GROUPED_LIST;
  }
  // Dedicated rows carry query-specific actions, status, badges, and navigation data.
  if (dedicatedTextQueries.includes(query)) return LIST_TYPES.TEXT_LIST;

  const remoteListTypes = globalSettings?.sections?.listTypes;
  const settingsKey =
    query === QUERY_TYPES.POINTS_OF_INTEREST || query === QUERY_TYPES.TOURS
      ? QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS
      : query;
  const remoteType = [remoteListTypes?.[query], remoteListTypes?.[settingsKey]].find((type) =>
    validListTypes.includes(type)
  );

  if (remoteType) return remoteType;

  if (listType) return listType;

  return listTypesSettings?.[settingsKey] || LIST_TYPES.TEXT_LIST;
};
