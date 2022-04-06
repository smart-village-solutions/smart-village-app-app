import { QUERY_TYPES } from '../../queries';

const type = QUERY_TYPES.CONSUL.SORTING;

export const filterHelper = async (filterType) => {
  switch (filterType) {
    case type.CURRENT:
      return { filter: type.CURRENT };
    case type.EXPIRED:
      return { filter: type.EXPIRED };
    default:
      return { filter: type.CURRENT };
  }
};
