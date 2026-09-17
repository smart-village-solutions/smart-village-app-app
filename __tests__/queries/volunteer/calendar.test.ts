jest.mock('../../../src/helpers/volunteerHelper', () => ({
  volunteerApiV1Url: 'https://example.test/api/v1/',
  volunteerApiV2Url: 'https://example.test/api/v2/',
  volunteerAuthToken: jest.fn(async () => 'token-123')
}));

jest.mock('../../../src/config', () => ({
  colors: {
    darkText: '#111111',
    primary: '#008000'
  }
}));

import moment from 'moment';

import { calendarAll } from '../../../src/queries/volunteer/calendar';

describe('calendarAll', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('merges all regular and recurring pages with identical range filters', async () => {
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({
          total: 2,
          page: 1,
          pages: 2,
          results: [{ id: 1, title: 'First event' }]
        })
      })
      .mockResolvedValueOnce({
        json: async () => ({
          total: 2,
          page: 2,
          pages: 2,
          results: [{ id: 2, title: 'Second event' }]
        })
      })
      .mockResolvedValueOnce({
        json: async () => ({
          total: 2,
          page: 1,
          pages: 2,
          results: [
            {
              id: 3,
              parent_id: 3,
              start_datetime: '2026-06-03 10:00:00',
              end_datetime: '2026-06-03 11:00:00',
              time_zone: 'Europe/Berlin'
            }
          ]
        })
      })
      .mockResolvedValueOnce({
        json: async () => ({
          total: 2,
          page: 2,
          pages: 2,
          results: [
            {
              id: 3,
              parent_id: 3,
              start_datetime: '2026-06-10 10:00:00',
              end_datetime: '2026-06-10 11:00:00',
              time_zone: 'Europe/Berlin'
            }
          ]
        })
      });

    const data = await calendarAll({
      dateRange: ['2026-06-01', '2026-06-30']
    });

    expect(globalThis.fetch).toHaveBeenCalledTimes(4);
    expect((globalThis.fetch as jest.Mock).mock.calls[0][0]).toBe(
      'https://example.test/api/v2/calendar?start_date=2026-06-01&end_date=2026-06-30&pagination=1&limit=100'
    );
    expect((globalThis.fetch as jest.Mock).mock.calls[1][0]).toBe(
      'https://example.test/api/v2/calendar/recurring?start_date=2026-06-01&end_date=2026-06-30&pagination=1&limit=100'
    );
    expect((globalThis.fetch as jest.Mock).mock.calls[2][0]).toBe(
      'https://example.test/api/v2/calendar?start_date=2026-06-01&end_date=2026-06-30&pagination=1&limit=100&page=2'
    );
    expect((globalThis.fetch as jest.Mock).mock.calls[3][0]).toBe(
      'https://example.test/api/v2/calendar/recurring?start_date=2026-06-01&end_date=2026-06-30&pagination=1&limit=100&page=2'
    );
    expect((globalThis.fetch as jest.Mock).mock.calls[0][1]).toMatchObject({
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer token-123'
      },
      method: 'GET'
    });
    expect(data.results).toHaveLength(4);
    expect(data.results).toEqual(
      expect.arrayContaining([
        { id: 1, title: 'First event' },
        { id: 2, title: 'Second event' },
        expect.objectContaining({ id: 3, start_datetime: '2026-06-03 10:00:00' }),
        expect.objectContaining({ id: 3, start_datetime: '2026-06-10 10:00:00' })
      ])
    );
  });

  it('uses the container endpoint when a content container id is provided', async () => {
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({
          total: 1,
          page: 1,
          pages: 1,
          results: [{ id: 3, title: 'Container event' }]
        })
      })
      .mockResolvedValueOnce({ json: async () => ({ pages: 1, results: [] }) });

    await calendarAll({
      contentContainerId: 157,
      dateRange: ['2026-06-01', '2026-06-30']
    });

    expect((globalThis.fetch as jest.Mock).mock.calls[0][0]).toBe(
      'https://example.test/api/v2/calendar/container/157?start_date=2026-06-01&end_date=2026-06-30&pagination=1&limit=100'
    );
    expect((globalThis.fetch as jest.Mock).mock.calls[1][0]).toBe(
      'https://example.test/api/v2/calendar/container/157/recurring?start_date=2026-06-01&end_date=2026-06-30&pagination=1&limit=100'
    );
  });

  it('loads bookmarked calendar entries directly by id', async () => {
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 42, title: 'First bookmark' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 84, title: 'Second bookmark' })
      });

    await expect(calendarAll({ ids: ['42', '84'] })).resolves.toEqual({
      results: [
        { id: 42, title: 'First bookmark' },
        { id: 84, title: 'Second bookmark' }
      ]
    });
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      1,
      'https://example.test/api/v2/calendar/entry/42',
      expect.any(Object)
    );
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      2,
      'https://example.test/api/v2/calendar/entry/84',
      expect.any(Object)
    );
  });

  it('ignores bookmarked calendar entries that no longer exist', async () => {
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 84, title: 'Existing bookmark' })
      });

    await expect(calendarAll({ ids: ['42', '84'] })).resolves.toEqual({
      results: [{ id: 84, title: 'Existing bookmark' }]
    });
  });

  it('does not hide unexpected bookmarked entry errors', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });

    await expect(calendarAll({ ids: ['42'] })).rejects.toThrow(
      'Volunteer calendar request failed with status 500'
    );
  });

  it('treats the recurring endpoint empty-range response as an empty result', async () => {
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce({ json: async () => ({ pages: 1, results: [] }) })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          code: 404,
          message: 'No recurring events are present between the requested dates'
        })
      });

    await expect(calendarAll({ dateRange: ['2026-06-01', '2026-06-30'] })).resolves.toEqual({
      results: []
    });
  });

  it('does not hide unexpected recurring endpoint errors', async () => {
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce({ json: async () => ({ pages: 1, results: [] }) })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ code: 404, message: 'Route not found' })
      });

    await expect(calendarAll({ dateRange: ['2026-06-01', '2026-06-30'] })).rejects.toThrow(
      'Volunteer calendar request failed with status 404'
    );
  });

  it('accepts the legacy recurring array during rollout', async () => {
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ pages: 1, results: [] })
      })
      .mockResolvedValueOnce({
        json: async () => [
          {
            id: 4,
            start_datetime: '2026-06-04 10:00:00',
            end_datetime: '2026-06-04 11:00:00',
            time_zone: 'Europe/Berlin'
          }
        ]
      });

    const data = await calendarAll({ dateRange: ['2026-06-01', '2026-06-30'] });

    expect(data.results).toHaveLength(1);
    expect(data.results[0].id).toBe(4);
  });

  it('deduplicates persisted recurrence exceptions returned by both endpoints', async () => {
    const exception = {
      id: 9,
      start_datetime: '2026-06-04 10:00:00',
      end_datetime: '2026-06-04 11:00:00',
      time_zone: 'Europe/Berlin'
    };
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce({ json: async () => ({ pages: 1, results: [exception] }) })
      .mockResolvedValueOnce({
        json: async () => ({
          pages: 1,
          results: [{ ...exception, parent_id: 4 }]
        })
      });

    const data = await calendarAll({ dateRange: ['2026-06-01', '2026-06-30'] });

    expect(data.results).toEqual([{ ...exception, parent_id: 4 }]);
  });

  it('uses a bounded one-year horizon when callers omit the date range', async () => {
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce({ json: async () => ({ pages: 1, results: [] }) })
      .mockResolvedValueOnce({ json: async () => ({ pages: 1, results: [] }) });

    await calendarAll();

    const start = moment().format('YYYY-MM-DD');
    const end = moment(start).add(365, 'days').format('YYYY-MM-DD');
    expect((globalThis.fetch as jest.Mock).mock.calls[0][0]).toBe(
      `https://example.test/api/v2/calendar?start_date=${start}&end_date=${end}&pagination=1&limit=100`
    );
  });

  it('limits additional page requests to batches of three per endpoint', async () => {
    const pendingPageRequests: Array<() => void> = [];
    let pageRequestCount = 0;
    let markFirstBatchStarted!: () => void;
    let markSecondBatchStarted!: () => void;
    const firstBatchStarted = new Promise<void>((resolve) => {
      markFirstBatchStarted = resolve;
    });
    const secondBatchStarted = new Promise<void>((resolve) => {
      markSecondBatchStarted = resolve;
    });
    (globalThis.fetch as jest.Mock).mockImplementation((url: string) => {
      if (!url.includes('&page=')) {
        return Promise.resolve({ json: async () => ({ pages: 5, results: [] }) });
      }

      pageRequestCount += 1;
      if (pageRequestCount === 6) markFirstBatchStarted();
      if (pageRequestCount === 8) markSecondBatchStarted();

      return new Promise((resolve) => {
        pendingPageRequests.push(() => resolve({ json: async () => ({ pages: 5, results: [] }) }));
      });
    });

    const request = calendarAll({ dateRange: ['2026-06-01', '2026-06-30'] });
    await firstBatchStarted;

    expect(globalThis.fetch).toHaveBeenCalledTimes(8);
    expect(
      (globalThis.fetch as jest.Mock).mock.calls.some(([url]) => url.endsWith('&page=5'))
    ).toBe(false);

    pendingPageRequests.splice(0).forEach((resolve) => resolve());
    await secondBatchStarted;

    expect(globalThis.fetch).toHaveBeenCalledTimes(10);
    pendingPageRequests.splice(0).forEach((resolve) => resolve());
    await request;
  });
});
