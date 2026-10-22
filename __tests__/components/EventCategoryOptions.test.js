import { eventCategoryOptions } from '../../src/helpers/eventCategoryOptions';

describe('event category options', () => {
  it('shows only categories with events in the current event query', () => {
    const data = {
      eventRecords: [{ categories: [{ name: 'Kultur' }] }],
      categories: [
        { id: '1', name: 'Sport', upcomingEventRecordsCount: 2 },
        { id: '2', name: 'Kultur', upcomingEventRecordsCount: 0 },
        { id: '3', name: 'Kultur', upcomingEventRecordsCount: 1 }
      ]
    };

    expect(eventCategoryOptions(data)).toEqual([
      { id: '3', index: 1, value: 'Kultur', selected: undefined }
    ]);
  });
});
