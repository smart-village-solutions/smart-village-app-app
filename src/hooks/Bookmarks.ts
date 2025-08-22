import { useContext } from 'react';
import { useQuery } from 'react-query';

import { BookmarkContext } from '../BookmarkProvider';
import { BookmarkList, getKeyFromTypeAndSuffix, getListQueryType } from '../helpers';
import { QUERY_TYPES, getQuery } from '../queries';
import { ReactQueryClient } from '../ReactQueryClient';

/* eslint-disable complexity */
export const useBookmarks = (itemType?: string, category?: number | string) => {
  const { bookmarks } = useContext(BookmarkContext);

  // query all vouchers to resolve current server IDs for stable payload IDs
  const { data: dataVouchers } = useQuery(
    [QUERY_TYPES.VOUCHERS],
    async () => {
      const client = await ReactQueryClient();

      return await client.request(getQuery(QUERY_TYPES.VOUCHERS));
    },
    {
      enabled: !!bookmarks?.[QUERY_TYPES.VOUCHERS]?.length
    }
  );

  // build a derived bookmarks object that keeps payload IDs as source of truth
  // and resolves to current server IDs at read-time
  let derivedBookmarks: BookmarkList | undefined = bookmarks;

  const rawVoucherBookmarks = (bookmarks?.[QUERY_TYPES.VOUCHERS] ?? []) as string[];

  if (rawVoucherBookmarks.length && dataVouchers?.genericItems) {
    // detect if stored values are payload IDs or old server IDs
    const hasAnyPayloadId =
      rawVoucherBookmarks.some((id) =>
        dataVouchers.genericItems?.some((voucher: any) => voucher?.payload?.id === id)
      ) || false;

    const hasAnyServerId =
      rawVoucherBookmarks.some((id) =>
        dataVouchers.genericItems?.some((voucher: any) => voucher?.id === id)
      ) || false;

    // if old server IDs are stored, convert them to payload IDs in-memory
    const effectivePayloadIds: string[] = hasAnyPayloadId
      ? rawVoucherBookmarks
      : hasAnyServerId
      ? dataVouchers.genericItems
          .filter((voucher: any) => rawVoucherBookmarks.includes(voucher.id))
          .map((voucher: any) => voucher?.payload?.id)
          .filter(Boolean)
      : rawVoucherBookmarks;

    // resolve current server IDs for the effective payload IDs (no mutation of context data)
    const resolvedVoucherIds: string[] =
      dataVouchers.genericItems
        ?.filter((voucher: any) => effectivePayloadIds.includes(voucher?.payload?.id))
        ?.map((voucher: any) => voucher.id) ?? [];

    derivedBookmarks = {
      ...(bookmarks || {}),
      [QUERY_TYPES.VOUCHERS]: resolvedVoucherIds
    };
  }

  if (itemType && derivedBookmarks) {
    const key = getKeyFromTypeAndSuffix(itemType, category);
    return derivedBookmarks[key];
  }

  return derivedBookmarks;
};
/* eslint-enable complexity */

export const useBookmarkedStatus = (itemType: string, id: string, suffix?: number | string) => {
  const bookmarks: BookmarkList | undefined = useBookmarks();

  const key = getKeyFromTypeAndSuffix(getListQueryType(itemType), suffix);

  return !!bookmarks?.[key]?.includes(id);
};
