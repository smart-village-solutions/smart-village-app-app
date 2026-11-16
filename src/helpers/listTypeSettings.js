import { consts } from '../config/consts';
import { QUERY_TYPES } from '../queries/types';

const { LIST_TYPES } = consts;
const validListTypes = Object.values(LIST_TYPES);

export const resolveListType = (query, globalSettings, listTypesSettings, listType) => {
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

  return listTypesSettings?.[settingsKey];
};
