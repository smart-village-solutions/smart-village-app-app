import { QUERY_TYPES } from '../../queries';
import { momentFormatUtcToLocal } from '../momentHelper';

const { NEWESTDATE, HIGHESTRATED, MOSTACTIVE } = QUERY_TYPES.CONSUL.SORTING;

export const sortingHelper = async (sortingType, listItems) => {
  switch (sortingType) {
    case NEWESTDATE:
      await listItems.sort((a, b) =>
        momentFormatUtcToLocal(b.createdAt)
          .split('.')
          .reverse()
          .join()
          .localeCompare(momentFormatUtcToLocal(a.createdAt).split('.').reverse().join())
      );
      return listItems;
    case HIGHESTRATED:
      await listItems.sort((a, b) => b.totalVotes - a.totalVotes);
      return listItems;
    case MOSTACTIVE:
      return listItems;
    default:
      return listItems;
  }
};
