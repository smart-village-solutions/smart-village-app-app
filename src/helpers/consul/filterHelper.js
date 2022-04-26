import { QUERY_TYPES } from '../../queries';

const { CURRENT, EXPIRED } = QUERY_TYPES.CONSUL.FILTER;

export const filterHelper = async (filterType) => {
  switch (filterType) {
    case CURRENT:
      return { filter: CURRENT };
    case EXPIRED:
      return { filter: EXPIRED };
    default:
      return { filter: CURRENT };
  }
};
