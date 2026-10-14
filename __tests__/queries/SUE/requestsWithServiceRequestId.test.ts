import { fetchSueEndpoints } from '../../../src/helpers';
import {
  requestsWithServiceRequestId,
  SueRequestError
} from '../../../src/queries/SUE/requestsWithServiceRequestId';

jest.mock('../../../src/helpers', () => ({ fetchSueEndpoints: jest.fn() }));

beforeEach(() => {
  (fetchSueEndpoints as jest.Mock).mockResolvedValue({
    sueFetchObj: { headers: { api_key: 'test-key' } },
    sueRequestsUrlWithServiceId: 'https://example.test/requests/123'
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

it.each([404, 410, 500, 401])(
  'preserves HTTP %s separately from the response body',
  async (status) => {
    const json = jest.fn().mockRejectedValue(new SyntaxError('Not JSON'));
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue({ ok: false, status, json } as unknown as Response);

    await expect(requestsWithServiceRequestId(123)).rejects.toEqual(new SueRequestError(status));
    expect(json).not.toHaveBeenCalled();
  }
);

it('accepts an API object and an already parsed attachment array', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({
      service_request_id: 123,
      status: 'TICKET_STATUS_OPEN',
      media_url: ['image.jpg']
    })
  } as Response);

  await expect(requestsWithServiceRequestId(123)).resolves.toEqual({
    serviceRequestId: 123,
    status: 'TICKET_STATUS_OPEN',
    mediaUrl: ['image.jpg']
  });
});

it('keeps a valid workflow status when the attachment JSON is malformed', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({ status: 'TICKET_STATUS_OPEN', media_url: 'invalid JSON' })
  } as Response);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);

  await expect(requestsWithServiceRequestId(123)).resolves.toMatchObject({
    status: 'TICKET_STATUS_OPEN'
  });
});

it.each([null, [], 'unavailable'])(
  'rejects a malformed successful response: %s',
  async (response) => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue({ ok: true, json: async () => response } as Response);

    await expect(requestsWithServiceRequestId(123)).rejects.toThrow('Invalid SUE report response');
  }
);

it('does not turn a numeric error field in a successful response into an HTTP error', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({ status: 404 })
  } as Response);

  await expect(requestsWithServiceRequestId(123)).resolves.toEqual({ status: 404 });
});
