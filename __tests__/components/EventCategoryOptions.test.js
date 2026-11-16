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

  it('retains a selected category with no events after narrowing other filters', () => {
    expect(
      eventCategoryOptions(
        {
          eventRecords: [],
          categories: [{ id: '1', name: 'Sport', upcomingEventRecordsCount: 0 }]
        },
        { categoryId: '1' }
      )
    ).toEqual([{ id: '1', index: 1, value: 'Sport', selected: true }]);
  });

  it('retains every selected category in a multi-select filter', () => {
    const categories = [
      { id: '1', name: 'Sport', upcomingEventRecordsCount: 0 },
      { id: '2', name: 'Kultur', upcomingEventRecordsCount: 0 },
      { id: '3', name: 'Other', upcomingEventRecordsCount: 1 }
    ];
    expect(
      eventCategoryOptions({ eventRecords: [], categories }, { categoryIds: ['1', '2'] })
    ).toEqual([
      { id: '1', index: 1, value: 'Sport', selected: true },
      { id: '2', index: 2, value: 'Kultur', selected: true }
    ]);
  });

  it('keeps the selected ID when duplicate category names are deduplicated', () => {
    const data = {
      eventRecords: [{ categories: [{ name: 'Kultur' }] }],
      categories: [
        { id: '1', name: 'Kultur', upcomingEventRecordsCount: 2 },
        { id: '2', name: 'Kultur', upcomingEventRecordsCount: 0 }
      ]
    };
    expect(eventCategoryOptions(data, { categoryId: '2' })).toEqual([
      { id: '2', index: 1, value: 'Kultur', selected: true }
    ]);
  });
});
