import { parseVolunteerData } from '../../src/helpers/parser/volunteerParser';
import { QUERY_TYPES } from '../../src/queries';

describe('volunteer list parser', () => {
  it('uses the event list layout for an unsectioned calendar such as the home section', () => {
    const [item] = parseVolunteerData(
      [
        {
          all_day: 0,
          id: 1,
          location: 'QA Staging Public',
          start_datetime: '2026-09-18 12:00:00',
          title: 'QA Guest – Single Day'
        }
      ],
      QUERY_TYPES.VOLUNTEER.CALENDAR,
      true,
      true,
      false
    );

    expect(item).toEqual(
      expect.objectContaining({
        overtitle: '18.09.2026, 12:00 Uhr | QA Staging Public',
        startTime: '12:00',
        subtitle: undefined,
        title: 'QA Guest – Single Day'
      })
    );
  });
});
