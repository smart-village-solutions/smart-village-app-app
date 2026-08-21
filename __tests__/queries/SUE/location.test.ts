import { fetchSueEndpoints } from '../../../src/helpers';
import { locations } from '../../../src/queries/SUE/location';

jest.mock('../../../src/helpers', () => ({
  fetchSueEndpoints: jest.fn()
}));

describe('SUE locations query', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetchSueEndpoints as jest.Mock).mockResolvedValue({
      sueFetchObj: { headers: { api_key: 'test' } },
      sueLocationsUrl: 'https://example.com/locations'
    });
    global.fetch = jest.fn();
  });

  it('fetches all pages when no explicit pagination is provided', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () =>
          Array.from({ length: 100 }, (_, index) => ({
            service_request_id: index + 1,
            status_code: 'TICKET_STATUS_OPEN'
          }))
      })
      .mockResolvedValueOnce({
        json: async () => [
          {
            service_request_id: 101,
            status_code: 'TICKET_STATUS_CLOSED'
          }
        ]
      });

    const result = await locations({ start_date: '1900-01-01' });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      'https://example.com/locations?start_date=1900-01-01&limit=100&offset=0',
      { headers: { api_key: 'test' } }
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      'https://example.com/locations?start_date=1900-01-01&limit=100&offset=100',
      { headers: { api_key: 'test' } }
    );
    expect(result).toHaveLength(101);
    expect(result[0]).toMatchObject({
      serviceRequestId: 1,
      status: 'Offen'
    });
    expect(result[100]).toMatchObject({
      serviceRequestId: 101,
      status: 'Geschlossen'
    });
  });

  it('keeps explicit pagination untouched', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => [
        {
          service_request_id: 21,
          status_code: 'TICKET_STATUS_IN_PROCESS'
        }
      ]
    });

    const result = await locations({ limit: 20, offset: 20, start_date: '1900-01-01' });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/locations?limit=20&offset=20&start_date=1900-01-01',
      { headers: { api_key: 'test' } }
    );
    expect(result).toEqual([
      {
        serviceRequestId: 21,
        statusCode: 'TICKET_STATUS_IN_PROCESS',
        status: 'In Bearbeitung'
      }
    ]);
  });
});
