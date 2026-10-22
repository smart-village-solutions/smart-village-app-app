import { consts } from '../config/consts';
import { QUERY_TYPES } from '../queries/types';

const { LIST_TYPES } = consts;

export const resolveListType = (query, globalSettings, listTypesSettings = {}, listType) => {
  const remoteListTypes = globalSettings?.sections?.listTypes;
  const settingsKey =
    query === QUERY_TYPES.POINTS_OF_INTEREST || query === QUERY_TYPES.TOURS
      ? QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS
      : query;
  const remoteType = remoteListTypes?.[query] ?? remoteListTypes?.[settingsKey];

  if (Object.values(LIST_TYPES).includes(remoteType)) return remoteType;

  if (listType) return listType;

  return listTypesSettings?.[settingsKey];
};
