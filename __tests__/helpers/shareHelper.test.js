import { shareMessage as busShareMessage } from '../../src/helpers/BUS/shareHelper';
import { shareMessage as volunteerShareMessage } from '../../src/helpers/shareHelper';
import { QUERY_TYPES } from '../../src/queries';

jest.mock('../../src/queries', () => ({
  QUERY_TYPES: {
    EVENT_RECORD: 'eventRecord',
    GENERIC_ITEM: 'genericItem',
    NEWS_ITEM: 'newsItem',
    POINT_OF_INTEREST: 'pointOfInterest',
    TOUR: 'tour',
    VOLUNTEER: {
      CALENDAR: 'calendar',
      GROUP: 'group'
    }
  }
}));

describe('BUS share helper', () => {
  it('omits teaser text when it is missing', () => {
    expect(
      busShareMessage({
        name: 'Meldebescheinigung'
      })
    ).toContain('[Bürger- und Unternehmensservice] Meldebescheinigung');
    expect(
      busShareMessage({
        name: 'Meldebescheinigung'
      })
    ).not.toContain('false');
  });
});

describe('volunteer share helper', () => {
  it('includes a deep link when an item has a stable id', () => {
    const message = volunteerShareMessage(
      { id: 42, title: 'Volunteer event' },
      QUERY_TYPES.VOLUNTEER.CALENDAR
    );

    expect(message).toContain('id=42');
  });

  it('shares text without an invalid deep link when an item has no id', () => {
    const message = volunteerShareMessage(
      {
        id: null,
        subtitle: '17. Oktober 2026, 16:00 Uhr | Kirche Döberitz',
        title: 'Offene Kirche mit Bibliothek'
      },
      QUERY_TYPES.VOLUNTEER.CALENDAR
    );

    expect(message).toBe(
      '17. Oktober 2026, 16:00 Uhr | Kirche Döberitz: Offene Kirche mit Bibliothek'
    );
    expect(message).not.toContain('undefined');
  });
});
