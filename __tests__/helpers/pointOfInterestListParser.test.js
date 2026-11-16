import { parseListItemsFromQuery } from '../../src/helpers/parser/listItemParser';
import { QUERY_TYPES } from '../../src/queries/types';

jest.mock('../../src/queries', () => jest.requireActual('../../src/queries/types'));
jest.mock('../../src/helpers/shareHelper', () => ({ shareMessage: () => 'Share' }));
jest.mock('../../src/helpers/parser/consulParser', () => ({ parseConsulData: jest.fn() }));
jest.mock('../../src/helpers/parser/sueParser', () => ({ parseSueData: jest.fn() }));
jest.mock('../../src/helpers/parser/volunteerParser', () => ({ parseVolunteerData: jest.fn() }));
jest.mock('../../src/helpers/parser/voucherParser', () => ({
  parseVouchersCategories: jest.fn(),
  parseVouchersData: jest.fn()
}));

it.each([
  QUERY_TYPES.POINT_OF_INTEREST,
  QUERY_TYPES.POINTS_OF_INTEREST,
  QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS
])('forwards active category IDs through %s detail navigation', (query) => {
  const poi = { id: 'poi-1', name: 'POI', mediaContents: [] };
  const data =
    query === QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS
      ? { pointsOfInterest: [poi], tours: [] }
      : { [query]: [poi] };
  const [item] = parseListItemsFromQuery(query, data, '', {
    queryVariables: { categoryId: 'a', categoryIds: ['b'], category: 'Museums' }
  });
  expect(item.params.queryVariables).toEqual({
    id: 'poi-1',
    categoryName: 'Museums',
    categoryId: 'a',
    categoryIds: ['b']
  });
});
