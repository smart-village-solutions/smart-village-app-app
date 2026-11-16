import { fetchSueEndpoints } from '../../../src/helpers';
import { requestsWithServiceRequestId } from '../../../src/queries/SUE/requestsWithServiceRequestId';

jest.mock('../../../src/helpers', () => ({ fetchSueEndpoints: jest.fn() }));

describe('SUE report lookup', () => {
  beforeEach(() => {
    (fetchSueEndpoints as jest.Mock).mockResolvedValue({
      sueRequestsUrlWithServiceId: 'https://example.test/report/1'
    });
  });
  afterEach(() => jest.restoreAllMocks());

  const mockResponse = (body: string, status = 200) =>
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      headers: { get: () => 'application/json' },
      text: async () => body
    } as unknown as Response);

  it.each([204, 404])('treats HTTP %i as unavailable status', async (status) => {
    mockResponse('', status);
    await expect(requestsWithServiceRequestId(1)).resolves.toBeNull();
  });

  it('keeps a valid status even if optional media is malformed', async () => {
    mockResponse(JSON.stringify({ status: 'CLOSED', media_url: '[' }));
    await expect(requestsWithServiceRequestId(1)).resolves.toEqual({
      status: 'CLOSED',
      mediaUrl: []
    });
  });

  it.each(['', '{', 'null', '[]'])(
    'does not fabricate success from malformed data: %s',
    async (body) => {
      mockResponse(body);
      await expect(requestsWithServiceRequestId(1)).rejects.toThrow('Invalid API response');
    }
  );
});
