import { queryWithAuthRetry } from '../../src/helpers/queryWithAuthRetry';

describe('Apollo authentication retry', () => {
  it.each([
    { message: 'Network error: JSON Parse error: Unexpected end of input' },
    { networkError: { statusCode: 502 } },
    { networkError: { statusCode: 403 } }
  ])('does not refresh tokens for transport or permission failures', async (error) => {
    const query = jest.fn().mockRejectedValue(error);
    const refresh = jest.fn();
    await expect(queryWithAuthRetry(query, refresh)).rejects.toEqual(error);
    expect(refresh).not.toHaveBeenCalled();
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('retries an unauthorized query once after refreshing credentials', async () => {
    const query = jest
      .fn()
      .mockRejectedValueOnce({ networkError: { statusCode: 401 } })
      .mockResolvedValue({ data: 'settings' });
    const refresh = jest.fn().mockResolvedValue(undefined);
    await expect(queryWithAuthRetry(query, refresh)).resolves.toEqual({ data: 'settings' });
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('propagates refresh failures to the awaiting caller', async () => {
    const query = jest.fn().mockRejectedValue({ networkError: { statusCode: 401 } });
    await expect(
      queryWithAuthRetry(query, jest.fn().mockRejectedValue(new Error('offline')))
    ).rejects.toThrow('offline');
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('does not loop if the refreshed token is also rejected', async () => {
    const error = { networkError: { statusCode: 401 } };
    const query = jest.fn().mockRejectedValue(error);
    const refresh = jest.fn().mockResolvedValue(undefined);
    await expect(queryWithAuthRetry(query, refresh)).rejects.toEqual(error);
    expect(query).toHaveBeenCalledTimes(2);
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
