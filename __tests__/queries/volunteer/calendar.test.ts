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

import { calendarAll } from '../../../src/queries/volunteer/calendar';

describe('calendarAll', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('merges paginated results without forwarding the app date range', async () => {
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
      });

    const data = await calendarAll({
      dateRange: ['2026-06-01', '2026-06-30']
    });

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect((globalThis.fetch as jest.Mock).mock.calls[0][0]).toBe(
      'https://example.test/api/v2/calendar'
    );
    expect((globalThis.fetch as jest.Mock).mock.calls[1][0]).toBe(
      'https://example.test/api/v2/calendar?page=2'
    );
    expect((globalThis.fetch as jest.Mock).mock.calls[0][1]).toMatchObject({
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer token-123'
      },
      method: 'GET'
    });
    expect(data.results).toEqual([
      { id: 1, title: 'First event' },
      { id: 2, title: 'Second event' }
    ]);
  });

  it('uses the container endpoint when a content container id is provided', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        total: 1,
        page: 1,
        pages: 1,
        results: [{ id: 3, title: 'Container event' }]
      })
    });

    await calendarAll({
      contentContainerId: 157,
      dateRange: ['2026-06-01', '2026-06-30']
    });

    expect((globalThis.fetch as jest.Mock).mock.calls[0][0]).toBe(
      'https://example.test/api/v2/calendar/container/157'
    );
  });
});
