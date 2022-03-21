import { QUERY_TYPES } from '../../queries';
import { momentFormatUtcToLocal } from '../momentHelper';

const type = QUERY_TYPES.CONSUL.SORTING;

export const sortingHelper = async (sortingType, listItems) => {
  switch (sortingType) {
    case type.NEWESTDATE:
      await listItems.sort((a, b) =>
        momentFormatUtcToLocal(b.createdAt)
          .split('.')
          .reverse()
          .join()
          .localeCompare(momentFormatUtcToLocal(a.createdAt).split('.').reverse().join())
      );
      return listItems;
    case type.HIGHESTRATED:
      await listItems.sort((a, b) => b.totalVotes - a.totalVotes);
      return listItems;
    case type.MOSTACTIVE:
      return listItems;
    default:
      return listItems;
  }
};
