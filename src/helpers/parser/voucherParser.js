import { consts } from '../../config';
import { QUERY_TYPES } from '../../queries';
import { mainImageOfMediaContents } from '../imageHelper';

const { ROOT_ROUTE_NAMES } = consts;

export const parseVouchersData = (data, skipLastDivider) => {
  return data?.map((voucher, index) => ({
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
    bottomDivider: !skipLastDivider || index !== data.length - 1
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
