import { QUERY_TYPES } from '../../src/queries/types';
import { parseListItemsFromQuery } from '../../src/helpers/parser/listItemParser';
import { getKeyFromTypeAndSuffix, toggleBookmark } from '../../src/helpers/bookmarkHelper';

jest.mock('../../src/queries', () => jest.requireActual('../../src/queries/types'));

jest.mock('../../src/helpers/parser/consulParser', () => ({ parseConsulData: jest.fn() }));
jest.mock('../../src/helpers/parser/sueParser', () => ({ parseSueData: jest.fn() }));
jest.mock('../../src/helpers/parser/volunteerParser', () => ({ parseVolunteerData: jest.fn() }));
jest.mock('../../src/helpers/parser/voucherParser', () => ({
  parseVouchersCategories: jest.fn(),
  parseVouchersData: jest.fn()
}));

let mockBookmarks;
jest.mock('../../src/helpers/storageHelper', () => ({
  readFromStore: async () => mockBookmarks,
  addToStore: jest.fn()
}));

const article = {
  id: 'saved-article',
  mainTitle: 'Saved article',
  categories: [{ id: 'current-child', parent: { id: 'current-parent' } }],
  contentBlocks: []
};

it.each(['7558', '', 'retired-category'])(
  'removes a saved article from its original group (%s)',
  async (savedSuffix) => {
    const savedKey = getKeyFromTypeAndSuffix(QUERY_TYPES.NEWS_ITEMS, savedSuffix);
    const currentKey = getKeyFromTypeAndSuffix(QUERY_TYPES.NEWS_ITEMS, 'current-parent');
    mockBookmarks = {
      [savedKey]: ['saved-article', 'another-article'],
      [currentKey]: ['unrelated']
    };
    const [row] = parseListItemsFromQuery(
      QUERY_TYPES.NEWS_ITEMS,
      { [QUERY_TYPES.NEWS_ITEMS]: [article] },
      'News',
      { bookmarkSuffix: savedSuffix }
    );
    const { query, queryVariables, suffix } = row.params;
    const result = await toggleBookmark(query, queryVariables.id, suffix);
    expect(result[savedKey]).toEqual(['another-article']);
    expect(result[currentKey]).toEqual(['unrelated']);
  }
);

it('still saves ordinary news under its current parent category', () => {
  const [row] = parseListItemsFromQuery(QUERY_TYPES.NEWS_ITEMS, {
    [QUERY_TYPES.NEWS_ITEMS]: [article]
  });
  expect(row.params.suffix).toBe('current-parent');
});
