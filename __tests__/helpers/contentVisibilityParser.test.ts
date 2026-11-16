import { parseListItemsFromQuery } from '../../src/helpers/parser/listItemParser';

jest.mock('expo-application', () => ({
  nativeApplicationVersion: '4.3.0',
  nativeBuildVersion: '1500'
}));

jest.mock('../../src/config', () => ({
  consts: { ROOT_ROUTE_NAMES: { VOUCHER: 'Voucher', POINTS_OF_INTEREST_AND_TOURS: 'POI' } },
  texts: {
    detailTitles: { voucher: 'Voucher', pointOfInterest: 'POI' },
    voucher: { offersCategories: 'Categories' }
  }
}));
jest.mock('../../src/queries', () => ({
  QUERY_TYPES: {
    POINT_OF_INTEREST: 'pointOfInterest',
    POINTS_OF_INTEREST: 'pointsOfInterest',
    VOUCHER: 'voucher',
    VOUCHERS: 'vouchers',
    VOUCHERS_REDEEMED: 'vouchersRedeemed',
    VOUCHERS_CATEGORIES: 'vouchersCategories',
    GENERIC_ITEMS: 'genericItems',
    CONSUL: {},
    SUE: {},
    PROFILE: {},
    VOLUNTEER: {}
  }
}));
jest.mock('../../src/types', () => ({
  ScreenName: { Detail: 'Detail', VoucherDetail: 'VoucherDetail', VoucherIndex: 'VoucherIndex' },
  GenericType: {}
}));
jest.mock('../../src/helpers/imageHelper', () => ({ mainImageOfMediaContents: () => 'image.jpg' }));
jest.mock('../../src/helpers/shareHelper', () => ({ shareMessage: () => 'share' }));
jest.mock('../../src/helpers/parser/consulParser', () => ({}));
jest.mock('../../src/helpers/parser/sueParser', () => ({}));
jest.mock('../../src/helpers/parser/volunteerParser', () => ({}));

const normalCategory = { id: '42', name: 'Shopping' };
const normal = {
  id: '10',
  title: 'Normal',
  name: 'Normal',
  categories: [normalCategory],
  payload: {},
  dates: [],
  quota: { availableQuantity: 5 }
};
const kt = {
  ...normal,
  id: '11',
  categories: [{ id: '7559', name: 'Klima-Taler' }],
  payload: { minVersion: '5.0.0', minBuild: 1573, klimaTaler: { offerId: 123 } }
};

it('keeps ordinary POI navigation and removes KT from mixed POI/bookmark/search result lists', () => {
  const raw = { pointsOfInterest: [kt, normal] };
  const result = parseListItemsFromQuery('pointsOfInterest', raw);
  expect(result).toHaveLength(1);
  expect(result[0].id).toBe('10');
  expect(result[0].params.queryVariables.id).toBe('10');
  expect(result[0].params.details).toMatchObject(normal);
  expect(raw.pointsOfInterest).toHaveLength(2);
});

it.each(['vouchers', 'vouchersRedeemed'])(
  'keeps ordinary coupon detail and quota unchanged in %s',
  (query) => {
    const key = query === 'vouchers' ? 'genericItems' : 'vouchers';
    const result = parseListItemsFromQuery(query, { [key]: [normal, kt] }, '', { queryKey: key });
    expect(result).toHaveLength(1);
    expect(result[0].params.queryVariables.id).toBe('10');
    expect(result[0].params.details.quota.availableQuantity).toBe(5);
  }
);

it('does not expose KT through the voucher category index or its counts', () => {
  const result = parseListItemsFromQuery('vouchersCategories', { genericItems: [normal, kt] }, '', {
    queryKey: 'genericItems'
  });
  expect(result).toHaveLength(1);
  expect(result[0]).toMatchObject({ id: '42', count: 1, title: 'Shopping' });
});
