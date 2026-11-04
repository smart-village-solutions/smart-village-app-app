import { fetchSueEndpoints } from '../../../src/helpers';
import { requestsWithServiceRequestId } from '../../../src/queries/SUE/requestsWithServiceRequestId';

jest.mock('../../../src/helpers', () => ({ fetchSueEndpoints: jest.fn() }));

describe('SUE request lookup', () => {
  beforeEach(() => {
    (fetchSueEndpoints as jest.Mock).mockResolvedValue({
      sueRequestsUrlWithServiceId: 'https://example.test/requests/123',
      sueFetchObj: {}
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('exposes the optional tag_name field as tagName', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ service_request_id: 123, tag_name: 'First;Second' })
    } as Response);

    await expect(requestsWithServiceRequestId(123)).resolves.toEqual({
      serviceRequestId: 123,
      tagName: 'First;Second'
    });
  });

  it('keeps the missing-report marker used by the detail screen', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 404 } as Response);
    await expect(requestsWithServiceRequestId(123)).resolves.toEqual({ status: 404 });
  });

  it('rejects HTTP failures so cached tags are preserved', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 503 } as Response);
    await expect(requestsWithServiceRequestId(123)).rejects.toThrow('SUE request failed: 503');
  });
});
