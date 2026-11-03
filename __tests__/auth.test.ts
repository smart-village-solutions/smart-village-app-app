import * as SecureStore from 'expo-secure-store';

import { auth } from '../src/auth';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn()
}));
jest.mock('../src/config', () => ({
  namespace: 'test',
  secrets: { test: { serverUrl: 'https://example.test', oAuthTokenEndpoint: '/token' } }
}));

describe('app authentication responses', () => {
  beforeEach(() => jest.clearAllMocks());
  afterEach(() => jest.restoreAllMocks());

  it.each([
    '',
    '{',
    '{}',
    '{"access_token":"abc"}',
    '{"access_token":"abc","created_at":1,"expires_in":-1}'
  ])('does not overwrite credentials with invalid responses', async (body) => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      text: async () => body
    } as unknown as Response);
    await expect(auth(undefined, true)).rejects.toThrow('Invalid API response');
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  it('waits for a valid token and then runs the callback', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      text: async () => JSON.stringify({ access_token: 'token', created_at: 100, expires_in: 60 })
    } as unknown as Response);
    const callback = jest.fn().mockReturnValue('ready');
    await expect(auth(callback, true)).resolves.toBe('ready');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('ACCESS_TOKEN_EXPIRE_TIME', '160');
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
