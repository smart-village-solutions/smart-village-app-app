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
  shareMessage: (item) => `Teilen: ${item.title}`
}));

jest.mock('../../src/helpers/parser/consulParser', () => ({ parseConsulData: jest.fn() }));
jest.mock('../../src/helpers/parser/sueParser', () => ({ parseSueData: jest.fn() }));
jest.mock('../../src/helpers/parser/volunteerParser', () => ({ parseVolunteerData: jest.fn() }));
jest.mock('../../src/helpers/parser/voucherParser', () => ({
  parseVouchersCategories: jest.fn(),
  parseVouchersData: jest.fn()
}));

describe('Participation Project list parser', () => {
  it('omits the untertitle while preserving the status presentation', () => {
    const [item] = parseListItemsFromQuery(
      QUERY_TYPES.GENERIC_ITEMS,
      {
        [QUERY_TYPES.GENERIC_ITEMS]: [
          {
            contentBlocks: [{ body: '<p>Dieser Text darf nicht in der Liste erscheinen.</p>' }],
            dates: [],
            genericType: GenericType.ParticipationProject,
            id: 'participation-project-42',
            mediaContents: [],
            payload: {
              status: 'Aktiv',
              statusColor: 'green',
              type: 'Dialog'
            },
            title: 'Beteiligung zum Stadtpark',
            webUrls: []
          }
        ]
      },
      '',
      {
        queryVariables: {
          participationStatusPosition: 'belowTeaser'
        }
      }
    );

    expect(item.subtitle).toBeUndefined();
    expect(item.statusLabel).toBe('Aktiv');
    expect(item.accessibilityLabel).not.toContain('Dieser Text darf nicht');
  });
});
