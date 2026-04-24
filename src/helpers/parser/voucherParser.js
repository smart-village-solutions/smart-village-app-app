import { consts, texts } from '../../config';
import { QUERY_TYPES } from '../../queries';
import { ScreenName } from '../../types';
import { mainImageOfMediaContents } from '../imageHelper';

const { ROOT_ROUTE_NAMES } = consts;

export const parseVouchersData = (data, skipLastDivider) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return data
    ?.filter((voucher) => {
      // filter out vouchers with no remaining quota
      if (
        voucher.quota &&
        voucher.quota.availableQuantity !== null &&
        voucher.quota.availableQuantity <= 0
      ) {
        return false;
      }

      // keep vouchers with no dates (no expiry defined)
      if (!voucher.dates?.length) return true;

      // keep if at least one date entry where today falls within [dateStart, dateEnd]
      // missing dateStart → treat as already started; missing dateEnd → treat as never expiring
      return voucher.dates.some((date) => {
        const hasStarted = !date.dateStart || new Date(date.dateStart) <= today;
        const notExpired = !date.dateEnd || new Date(date.dateEnd) >= today;

        return hasStarted && notExpired;
      });
    })
    .map((voucher, index, filteredData) => ({
      routeName: ScreenName.VoucherDetail,
      params: {
        query: QUERY_TYPES.VOUCHER,
        queryVariables: { id: `${voucher.id}` },
        title: texts.detailTitles.voucher,
        rootRouteName: ROOT_ROUTE_NAMES.VOUCHER,
        details: voucher
      },
      picture: {
        url: mainImageOfMediaContents(voucher.mediaContents)
      },
      ...voucher,
      bottomDivider: !skipLastDivider || index !== filteredData.length - 1
    }));
};

export const parseVouchersCategories = (data, skipLastDivider) => {
  const categoryCounts = {};

  data.forEach((category) => {
    category.categories.forEach((subCategory) => {
      const categoryId = subCategory.id;
      const categoryName = subCategory.name;

      if (!categoryCounts[categoryId]) {
        categoryCounts[categoryId] = {
          name: categoryName,
          count: 1
        };
      } else {
        categoryCounts[categoryId].count += 1;
      }
    });
  });

  return Object.keys(categoryCounts)
    .map((categoryId, index) => ({
      id: categoryId,
      title: categoryCounts[categoryId].name,
      count: categoryCounts[categoryId].count,
      routeName: ScreenName.VoucherIndex,
      params: {
        title: texts.voucher.offersCategories,
        query: QUERY_TYPES.VOUCHERS,
        queryVariables: { categoryId },
        rootRouteName: ROOT_ROUTE_NAMES.VOUCHER,
        showFilter: false
      },
      bottomDivider: !skipLastDivider || index !== data.length - 1
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
};
