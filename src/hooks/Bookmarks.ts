import { useContext } from 'react';
import { useQuery } from 'react-apollo';

import { BookmarkContext } from '../BookmarkProvider';
import { BookmarkList, getKeyFromTypeAndSuffix, getListQueryType } from '../helpers';
import { QUERY_TYPES, getQuery } from '../queries';

export const useBookmarks = (itemType?: string, category?: number | string) => {
  const { bookmarks } = useContext(BookmarkContext);

  // query all vouchers and get ids from all items, that have corresponding ids in payload,
  // because vouchers have changing ids
  const { data: dataVouchers } = useQuery(getQuery(QUERY_TYPES.VOUCHERS), {
    skip: !bookmarks?.[QUERY_TYPES.VOUCHERS]?.length
  });

  if (bookmarks) {
    const voucherIds = dataVouchers?.genericItems
      ?.filter((voucher) => bookmarks?.[QUERY_TYPES.VOUCHERS].includes(voucher.payload.id))
      ?.map((voucher) => voucher.id);

    if (voucherIds?.length) {
      bookmarks[QUERY_TYPES.VOUCHERS] = voucherIds;
    }
  }

  if (itemType && bookmarks) {
    const key = getKeyFromTypeAndSuffix(itemType, category);

    return bookmarks[key];
  }

  return bookmarks;
};

export const useBookmarkedStatus = (itemType: string, id: string, suffix?: number | string) => {
  const bookmarks: BookmarkList | undefined = useBookmarks();

  const key = getKeyFromTypeAndSuffix(getListQueryType(itemType), suffix);

  return !!bookmarks?.[key]?.includes(id);
};
