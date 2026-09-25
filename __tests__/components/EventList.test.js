import { sectionEventData, visibleAdditionalEventData } from '../../src/helpers/eventListHelper';

describe('EventList helpers', () => {
  test('groups the received data synchronously by list date', () => {
    const firstEvent = { id: 1, listDate: '2026-09-17' };
    const secondEvent = { id: 2, listDate: '2026-09-18' };

    expect(sectionEventData([firstEvent, secondEvent])).toEqual([
      '2026-09-17',
      firstEvent,
      '2026-09-18',
      secondEvent
    ]);
  });

  test('sorts events within a date by their start time', () => {
    const noonEvent = { id: 1, listDate: '2026-09-18', startTime: '12:00' };
    const afternoonEvent = { id: 2, listDate: '2026-09-18', startTime: '16:00' };
    const volunteerNoonEvent = { id: 3, listDate: '2026-09-18', startTime: '12:00' };

    expect(sectionEventData([noonEvent, afternoonEvent, volunteerNoonEvent])).toEqual([
      '2026-09-18',
      noonEvent,
      volunteerNoonEvent,
      afternoonEvent
    ]);
  });

  test('does not let future additional events hide unloaded regular event pages', () => {
    const regularEvents = [
      { id: 1, listDate: '2026-11-22' },
      { id: 2, listDate: '2026-11-25' }
    ];
    const additionalEvents = [
      { id: 'a1', listDate: '2026-11-24' },
      { id: 'a2', listDate: '2026-11-26' },
      { id: 'a3', listDate: '2026-12-05' }
    ];

    expect(
      visibleAdditionalEventData({
        additionalData: additionalEvents,
        hasNextPage: true,
        primaryData: regularEvents
      })
    ).toEqual([additionalEvents[0]]);
  });

  test('shows all additional events after regular event pagination is complete', () => {
    const additionalEvents = [
      { id: 'a1', listDate: '2026-11-26' },
      { id: 'a2', listDate: '2026-12-05' }
    ];

    expect(
      visibleAdditionalEventData({
        additionalData: additionalEvents,
        hasNextPage: false,
        primaryData: [{ id: 1, listDate: '2026-11-25' }]
      })
    ).toBe(additionalEvents);
  });
});
