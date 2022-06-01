import _orderBy from 'lodash/orderBy';

import { QUERY_TYPES } from '../../queries';

const { NEWESTDATE, HIGHESTRATED } = QUERY_TYPES.CONSUL.SORTING;

export const sortingHelper = (sortingType, listItems) => {
  switch (sortingType) {
    case NEWESTDATE:
      listItems = _orderBy(listItems, 'createdAt', 'desc');
      break;
    case HIGHESTRATED:
      listItems = _orderBy(listItems, 'cachedVotesUp', 'desc');
      break;
  }

  return listItems;
};
