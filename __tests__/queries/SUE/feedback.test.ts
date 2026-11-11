import { storageHelper } from '../../../src/helpers/storageHelper';
import { sendUserFeedback } from '../../../src/queries/SUE/feedback';

jest.mock('../../../src/helpers', () => jest.requireActual('../../../src/helpers/sueHelper'));
jest.mock('../../../src/helpers/storageHelper', () => ({
  storageHelper: { configurations: jest.fn() }
}));

describe('SUE feedback delivery', () => {
  const originalFetch = global.fetch;
  let append: jest.SpyInstance;

  beforeEach(() => {
    append = jest.spyOn(FormData.prototype, 'append');
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 });
    (storageHelper.configurations as jest.Mock).mockResolvedValue({
      sueConfig: {
        apiConfig: {
          serverUrl: 'https://production.example.test',
          apiKey: 'production-key',
          whichApi: 'testApi',
          testApi: { serverUrl: 'https://test.example.test/', apiKey: 'test-key' }
        }
      }
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    global.fetch = originalFetch;
  });

  it('sends the documented multipart fields directly to the selected SUE API', async () => {
    await expect(
      sendUserFeedback({ message: 'Vielen Dank!', rating: 4, appVersion: '5.0.0' })
    ).resolves.toBeUndefined();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://test.example.test/support/sendUserFeedback',
      {
        method: 'POST',
        headers: { accept: 'application/json', api_key: 'test-key' },
        body: expect.any(FormData)
      }
    );
    expect(append.mock.calls).toEqual([
      ['feedback', 'Vielen Dank!'],
      ['rating', '4'],
      ['appVersion', '5.0.0']
    ]);
  });

  it('allows rating-only feedback without an app version', async () => {
    await sendUserFeedback({ message: '', rating: 5 });

    expect(append.mock.calls).toEqual([
      ['feedback', ''],
      ['rating', '5']
    ]);
  });

  it.each([400, 403, 404, 500])('rejects HTTP %s instead of reporting success', async (status) => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status });

    await expect(sendUserFeedback({ message: 'Feedback', rating: 3 })).rejects.toThrow(
      `SUE feedback request failed (${status})`
    );
  });

  it('propagates network failures without falling back to another server', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network unavailable'));

    await expect(sendUserFeedback({ message: 'Feedback', rating: 3 })).rejects.toThrow(
      'Network unavailable'
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
