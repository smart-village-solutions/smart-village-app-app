import { parseListItemsFromQuery } from '../../src/helpers/parser/listItemParser';
import { QUERY_TYPES } from '../../src/queries';
import { GenericType } from '../../src/types';

jest.mock('../../src/queries', () => ({
  QUERY_TYPES: {
    EVENT_RECORDS: 'eventRecords',
    GENERIC_ITEM: 'genericItem',
    GENERIC_ITEMS: 'genericItems'
  }
}));

jest.mock('../../src/helpers/shareHelper', () => ({
  shareMessage: (item) => `Share: ${item.title}`
}));

jest.mock('../../src/helpers/parser/consulParser', () => ({ parseConsulData: jest.fn() }));
jest.mock('../../src/helpers/parser/sueParser', () => ({ parseSueData: jest.fn() }));
jest.mock('../../src/helpers/parser/volunteerParser', () => ({ parseVolunteerData: jest.fn() }));
jest.mock('../../src/helpers/parser/voucherParser', () => ({
  parseVouchersCategories: jest.fn(),
  parseVouchersData: jest.fn()
}));

const AUTH_MODE_USER = 'user';

describe('noticeboard list item parser', () => {
  it('forwards user auth to detail requests for current-member entries', () => {
    const [item] = parseListItemsFromQuery(
      QUERY_TYPES.GENERIC_ITEMS,
      {
        [QUERY_TYPES.GENERIC_ITEMS]: [
          {
            categories: [],
            createdAt: '2026-09-15T10:00:00Z',
            genericType: GenericType.Noticeboard,
            id: 'hidden-noticeboard-entry',
            title: 'Hidden noticeboard entry',
            visible: false
          }
        ]
      },
      '',
      {
        authMode: AUTH_MODE_USER,
        queryVariables: { currentMember: true }
      }
    );

    expect(item.params.authMode).toBe(AUTH_MODE_USER);
  });
});
