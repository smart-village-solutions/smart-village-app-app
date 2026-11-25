import {
  fetchEventCategorySnapshot,
  fetchEventReminderCategories
} from '../../src/queries/eventReminderRecords';
import { ReactQueryClient } from '../../src/ReactQueryClient';

jest.mock('../../src/ReactQueryClient', () => ({ ReactQueryClient: jest.fn() }));

const event = (id: string) => ({ id, title: `Termin ${id}`, dates: [] });

describe('category reminder source', () => {
  const request = jest.fn();

  beforeEach(() => {
    request.mockReset();
    jest.mocked(ReactQueryClient).mockResolvedValue({ request });
  });

  it('includes tagged categories and categories already assigned to events', async () => {
    request.mockResolvedValue({
      categories: [
        { id: 12, name: 'Kultur', tagList: 'news_item, event_record', eventRecordsCount: 0 },
        { id: '13', name: 'Veranstaltung', tagList: null, eventRecordsCount: 1 },
        { id: '14', name: 'Nachrichten', tagList: 'news_item', eventRecordsCount: 0 },
        null
      ]
    });

    expect(await fetchEventReminderCategories()).toEqual([
      { id: '12', name: 'Kultur' },
      { id: '13', name: 'Veranstaltung' }
    ]);
  });

  it('continues after a short page and completes only at an empty page', async () => {
    request
      .mockResolvedValueOnce({ eventRecords: [event('1'), event('2')] })
      .mockResolvedValueOnce({ eventRecords: [event('3')] })
      .mockResolvedValueOnce({ eventRecords: [] });

    expect((await fetchEventCategorySnapshot('category')).records.map(({ id }) => id)).toEqual([
      '1',
      '2',
      '3'
    ]);
    expect(request.mock.calls.map(([, variables]) => variables)).toEqual([
      { categoryId: 'category', limit: 50, skip: 0 },
      { categoryId: 'category', limit: 50, skip: 2 },
      { categoryId: 'category', limit: 50, skip: 3 }
    ]);
  });

  it('fails the snapshot if a later page is missing or repeats the previous page', async () => {
    request.mockResolvedValueOnce({ eventRecords: [event('1')] }).mockResolvedValueOnce({});
    await expect(fetchEventCategorySnapshot('category')).rejects.toThrow('Incomplete');
    request.mockResolvedValue({ eventRecords: [event('1')] });
    await expect(fetchEventCategorySnapshot('category')).rejects.toThrow('repeated');
  });
});
