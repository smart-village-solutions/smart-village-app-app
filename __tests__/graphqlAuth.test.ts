import { createHash as mockCreateHash } from 'crypto';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn()
}));

jest.mock('../src/helpers/profileHelper', () => ({
  profileAuthToken: jest.fn(),
  profileUserAuthToken: jest.fn()
}));

jest.mock('../src/helpers/voucherHelper', () => ({
  voucherAuthToken: jest.fn()
}));

jest.mock('../src/helpers/textsLocaleHelper', () => ({ getTextsLocale: jest.fn() }));
jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: async (_algorithm, value) =>
    mockCreateHash('sha256').update(value).digest('hex')
}));

jest.mock('graphql-request', () => ({
  GraphQLClient: jest.fn().mockImplementation(() => ({
    request: jest.fn()
  }))
}));

jest.mock('../src/config', () => ({
  namespace: 'test',
  secrets: {
    test: {
      serverUrl: 'https://example.test',
      graphqlEndpoint: '/graphql'
    }
  }
}));

import * as SecureStore from 'expo-secure-store';
import { GraphQLClient } from 'graphql-request';

import {
  AUTH_MODE_MEMBER,
  AUTH_MODE_VOUCHER,
  AUTH_MODE_USER,
  getGraphqlAuthHeaders,
  getGraphqlCacheScope
} from '../src/graphqlAuth';
import { namespace, secrets } from '../src/config';
import { getTextsLocale } from '../src/helpers/textsLocaleHelper';
import { profileAuthToken, profileUserAuthToken } from '../src/helpers/profileHelper';
import { voucherAuthToken } from '../src/helpers/voucherHelper';
import { ReactQueryClient } from '../src/ReactQueryClient';

describe('graphql auth helpers', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (getTextsLocale as jest.Mock).mockReturnValue('de');
  });

  it('builds public GraphQL auth headers without profile-specific context by default', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('access-token');
    (profileAuthToken as jest.Mock).mockResolvedValue('profile-token');
    (voucherAuthToken as jest.Mock).mockResolvedValue('voucher-token');
    (profileUserAuthToken as jest.Mock).mockResolvedValue('user-token');

    await expect(getGraphqlAuthHeaders()).resolves.toEqual({
      authorization: 'Bearer access-token',
      'X-Authorization': '',
      'Accept-Language': 'de',
      'X-User-Authorization': ''
    });
  });

  it('falls back to voucher auth for member-scoped requests when no profile auth token exists', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    (profileAuthToken as jest.Mock).mockResolvedValue(null);
    (voucherAuthToken as jest.Mock).mockResolvedValue('voucher-token');
    (profileUserAuthToken as jest.Mock).mockResolvedValue(null);

    await expect(getGraphqlAuthHeaders(AUTH_MODE_MEMBER)).resolves.toEqual({
      authorization: '',
      'X-Authorization': 'voucher-token',
      'Accept-Language': 'de',
      'X-User-Authorization': ''
    });
  });

  it('prefers the voucher token for voucher-scoped requests even when a profile token exists', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('access-token');
    (profileAuthToken as jest.Mock).mockResolvedValue('profile-token');
    (voucherAuthToken as jest.Mock).mockResolvedValue('voucher-token');
    (profileUserAuthToken as jest.Mock).mockResolvedValue('user-token');

    await expect(getGraphqlAuthHeaders(AUTH_MODE_VOUCHER)).resolves.toEqual({
      authorization: 'Bearer access-token',
      'X-Authorization': 'voucher-token',
      'Accept-Language': 'de',
      'X-User-Authorization': ''
    });
  });

  it('includes user context only for user-scoped requests', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('access-token');
    (profileAuthToken as jest.Mock).mockResolvedValue('profile-token');
    (voucherAuthToken as jest.Mock).mockResolvedValue('voucher-token');
    (profileUserAuthToken as jest.Mock).mockResolvedValue('user-token');

    await expect(getGraphqlAuthHeaders(AUTH_MODE_USER)).resolves.toEqual({
      authorization: 'Bearer access-token',
      'X-Authorization': 'profile-token',
      'Accept-Language': 'de',
      'X-User-Authorization': 'user-token'
    });
  });

  it.each(['de', 'en', 'fr', 'pt-PT'])(
    'uses the active catalog language %s centrally',
    async (locale) => {
      (getTextsLocale as jest.Mock).mockReturnValue(locale);
      expect((await getGraphqlAuthHeaders())['Accept-Language']).toBe(locale);
    }
  );

  it('separates cache scopes by language, municipality endpoint and each principal credential', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('access-token');
    const headers = await getGraphqlAuthHeaders();
    const original = await getGraphqlCacheScope(headers);
    expect(original).toMatch(/^[a-f0-9]{64}$/);
    for (const header of [
      'Accept-Language',
      'authorization',
      'X-Authorization',
      'X-User-Authorization'
    ]) {
      expect(await getGraphqlCacheScope({ ...headers, [header]: 'different' })).not.toBe(original);
    }
    const originalUrl = secrets[namespace].serverUrl;
    try {
      secrets[namespace].serverUrl = 'https://other-municipality.test';
      expect(await getGraphqlCacheScope(headers)).not.toBe(original);
    } finally {
      secrets[namespace].serverUrl = originalUrl;
    }
  });

  it('preserves translation extensions and records the exact request credential scope', async () => {
    const rawRequest = jest.fn().mockResolvedValue({
      data: { article: { id: '1', title: 'News' } },
      extensions: {
        appTranslations: [
          { path: ['article'], sourceDigest: 'a'.repeat(64), servedLocale: 'en', state: 'ready' }
        ]
      }
    });
    (GraphQLClient as unknown as jest.Mock).mockImplementation(() => ({ rawRequest }));
    (getTextsLocale as jest.Mock).mockReturnValue('en');
    const client = await ReactQueryClient();
    const result = await client.rawRequest('query News { article { id } }', {});
    expect(result.extensions.appTranslations[0].path).toEqual(['article']);
    expect(result.scope).toBe(await client.cacheScope());
    expect(rawRequest.mock.calls[0][2]['Accept-Language']).toBe('en');
    const german = await client.rawRequest('query News { article { id } }', {}, { locale: 'de' });
    expect(rawRequest.mock.calls[1][2]['Accept-Language']).toBe('de');
    expect(german.scope).not.toBe(result.scope);
  });

  it('resolves public auth headers fresh for every ReactQuery request by default', async () => {
    const requestMock = jest.fn().mockResolvedValue({ data: 'ok' });

    (GraphQLClient as unknown as jest.Mock).mockImplementation(() => ({
      request: requestMock
    }));

    (SecureStore.getItemAsync as jest.Mock)
      .mockResolvedValueOnce('first-access')
      .mockResolvedValueOnce('second-access');
    (profileAuthToken as jest.Mock)
      .mockResolvedValueOnce('first-profile')
      .mockResolvedValueOnce('second-profile');
    (voucherAuthToken as jest.Mock).mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    (profileUserAuthToken as jest.Mock)
      .mockResolvedValueOnce('first-user')
      .mockResolvedValueOnce('second-user');

    const client = await ReactQueryClient();

    await client.request('query First', { id: '1' });
    await client.request('query Second', { id: '2' });

    expect(requestMock).toHaveBeenNthCalledWith(
      1,
      'query First',
      { id: '1' },
      {
        authorization: 'Bearer first-access',
        'X-Authorization': '',
        'Accept-Language': 'de',
        'X-User-Authorization': ''
      }
    );
    expect(requestMock).toHaveBeenNthCalledWith(
      2,
      'query Second',
      { id: '2' },
      {
        authorization: 'Bearer second-access',
        'X-Authorization': '',
        'Accept-Language': 'de',
        'X-User-Authorization': ''
      }
    );
  });

  it('passes the requested auth mode through ReactQuery requests', async () => {
    const requestMock = jest.fn().mockResolvedValue({ data: 'ok' });

    (GraphQLClient as unknown as jest.Mock).mockImplementation(() => ({
      request: requestMock
    }));

    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('access-token');
    (profileAuthToken as jest.Mock).mockResolvedValue('profile-token');
    (voucherAuthToken as jest.Mock).mockResolvedValue('voucher-token');
    (profileUserAuthToken as jest.Mock).mockResolvedValue('user-token');

    const client = await ReactQueryClient();

    await client.request('query VoucherScoped', { id: '0' }, { authMode: AUTH_MODE_VOUCHER });
    await client.request('query Voucher', { id: '1' }, { authMode: AUTH_MODE_MEMBER });
    await client.request('query Profile', { id: '2' }, { authMode: AUTH_MODE_USER });

    expect(requestMock).toHaveBeenNthCalledWith(
      1,
      'query VoucherScoped',
      { id: '0' },
      {
        authorization: 'Bearer access-token',
        'X-Authorization': 'voucher-token',
        'Accept-Language': 'de',
        'X-User-Authorization': ''
      }
    );
    expect(requestMock).toHaveBeenNthCalledWith(
      2,
      'query Voucher',
      { id: '1' },
      {
        authorization: 'Bearer access-token',
        'X-Authorization': 'profile-token',
        'Accept-Language': 'de',
        'X-User-Authorization': ''
      }
    );
    expect(requestMock).toHaveBeenNthCalledWith(
      3,
      'query Profile',
      { id: '2' },
      {
        authorization: 'Bearer access-token',
        'X-Authorization': 'profile-token',
        'Accept-Language': 'de',
        'X-User-Authorization': 'user-token'
      }
    );
  });
});
