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
    expect(item.params).toEqual(
      expect.objectContaining({
        query: QUERY_TYPES.VOLUNTEER.CALENDAR,
        queryVariables: { id: '1' }
      })
    );
  });

  it('keeps recurring occurrence details without requesting a null entry id', () => {
    const occurrence = {
      id: null,
      parent_id: 175,
      start_datetime: '2026-10-17 16:00:00',
      end_datetime: '2026-10-17 17:00:00',
      location: 'Kirche Döberitz',
      title: 'Offene Kirche mit Bibliothek'
    };
    const [item] = parseVolunteerData(
      [occurrence],
      QUERY_TYPES.VOLUNTEER.CALENDAR,
      true,
      true,
      false
    );

    expect(item.params).toEqual(
      expect.objectContaining({
        details: occurrence,
        queryOptions: { enabled: false },
        queryVariables: { id: undefined }
      })
    );
    expect(item.params.shareContent.message).toBe(
      '17. Oktober 2026, 16:00 Uhr | Kirche Döberitz: Offene Kirche mit Bibliothek'
    );
  });
});
