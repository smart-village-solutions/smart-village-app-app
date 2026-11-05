import { createHash as mockCreateHash } from 'crypto';

import * as SecureStore from 'expo-secure-store';
import { GraphQLClient } from 'graphql-request';

import { auth } from '../../src/auth';
import { AUTH_MODE_USER, getGraphqlAuthHeaders } from '../../src/graphqlAuth';
import {
  getMainServerConfig,
  getMainServerTokenKey,
  getMainServerUrl
} from '../../src/helpers/mainServerHelper';
import { ReactQueryClient } from '../../src/ReactQueryClient';

jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: async (_algorithm, value) =>
    mockCreateHash('sha256').update(value).digest('hex')
}));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn()
}));
jest.mock('graphql-request', () => ({ GraphQLClient: jest.fn(() => ({ request: jest.fn() })) }));
jest.mock('../../src/helpers/textsLocaleHelper', () => ({ getTextsLocale: () => 'en' }));
jest.mock('../../src/helpers/profileHelper', () => ({
  profileAuthToken: jest.fn(),
  profileUserAuthToken: jest.fn()
}));
jest.mock('../../src/helpers/voucherHelper', () => ({ voucherAuthToken: jest.fn() }));
jest.mock('../../src/config', () => ({
  namespace: 'test',
  secrets: {
    test: {
      serverUrl: 'https://configured.test',
      graphqlEndpoint: '/graphql',
      oAuthTokenEndpoint: '/oauth/token',
      oAuthClientId: 'test-client',
      oAuthClientSecret: 'test-only-fixture',
      oAuthGrantType: 'client_credentials'
    },
    town: {
      serverUrl: 'https://town.test',
      oAuthClientId: 'town-client',
      graphqlEndpoint: '/graphql'
    }
  }
}));

const originalDev = global.__DEV__;
const originalOverride = process.env.EXPO_PUBLIC_MAIN_SERVER_URL;
const originalConfig = process.env.EXPO_PUBLIC_MAIN_SERVER_CONFIG;
const originalFetch = global.fetch;

beforeEach(() => {
  jest.clearAllMocks();
  global.__DEV__ = true;
  delete process.env.EXPO_PUBLIC_MAIN_SERVER_URL;
  delete process.env.EXPO_PUBLIC_MAIN_SERVER_CONFIG;
  SecureStore.getItemAsync.mockResolvedValue(null);
});
afterEach(() => {
  global.__DEV__ = originalDev;
  global.fetch = originalFetch;
  if (originalOverride === undefined) delete process.env.EXPO_PUBLIC_MAIN_SERVER_URL;
  else process.env.EXPO_PUBLIC_MAIN_SERVER_URL = originalOverride;
  if (originalConfig === undefined) delete process.env.EXPO_PUBLIC_MAIN_SERVER_CONFIG;
  else process.env.EXPO_PUBLIC_MAIN_SERVER_CONFIG = originalConfig;
});

it('keeps the configured endpoint and existing token keys without the override', async () => {
  expect(getMainServerUrl()).toBe('https://configured.test');
  expect(await getMainServerTokenKey('ACCESS_TOKEN')).toBe('ACCESS_TOKEN');
});

it('ignores the override in release builds', async () => {
  global.__DEV__ = false;
  process.env.EXPO_PUBLIC_MAIN_SERVER_URL = 'not a URL';
  expect(getMainServerUrl()).toBe('https://configured.test');
  expect(await getMainServerTokenKey('ACCESS_TOKEN')).toBe('ACCESS_TOKEN');
});

it.each([
  'http://localhost:3000/',
  'http://127.0.0.1:3000',
  'http://10.0.2.2:3000',
  'http://town.server.smart-village.local:4000'
])('accepts a local origin: %s', (url) => {
  process.env.EXPO_PUBLIC_MAIN_SERVER_URL = url;
  expect(getMainServerUrl()).toBe(url.replace(/\/$/, ''));
});

it('selects existing OAuth configuration only for a local development override', async () => {
  process.env.EXPO_PUBLIC_MAIN_SERVER_URL = 'http://town.server.smart-village.local:4000';
  process.env.EXPO_PUBLIC_MAIN_SERVER_CONFIG = 'town';
  expect(getMainServerConfig().oAuthClientId).toBe('town-client');
  const key = await getMainServerTokenKey('ACCESS_TOKEN');
  process.env.EXPO_PUBLIC_MAIN_SERVER_CONFIG = 'test';
  expect(await getMainServerTokenKey('ACCESS_TOKEN')).not.toBe(key);
  process.env.EXPO_PUBLIC_MAIN_SERVER_CONFIG = 'unknown';
  expect(getMainServerConfig).toThrow('Unknown Main-Server development configuration');
  global.__DEV__ = false;
  expect(getMainServerConfig().oAuthClientId).toBe('test-client');
});

it.each([
  'https://remote.example',
  'file:///tmp/server',
  'http://user:pass@localhost:3000',
  'http://localhost:3000/path',
  'http://localhost:3000?token=secret',
  'invalid'
])('rejects invalid or remote overrides without logging their value: %s', (url) => {
  process.env.EXPO_PUBLIC_MAIN_SERVER_URL = url;
  expect(() => getMainServerUrl()).toThrow(
    'EXPO_PUBLIC_MAIN_SERVER_URL must be a local HTTP(S) origin'
  );
});

it('separates local token keys by endpoint and retains the original key', async () => {
  process.env.EXPO_PUBLIC_MAIN_SERVER_URL = 'http://localhost:3000';
  const first = await getMainServerTokenKey('ACCESS_TOKEN');
  expect(first).toMatch(/^ACCESS_TOKEN_[a-f0-9]{64}$/);
  process.env.EXPO_PUBLIC_MAIN_SERVER_URL = 'http://localhost:3001';
  expect(await getMainServerTokenKey('ACCESS_TOKEN')).not.toBe(first);
});

it('uses local OAuth/GraphQL and only the scoped public token', async () => {
  process.env.EXPO_PUBLIC_MAIN_SERVER_URL = 'http://localhost:3000';
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      access_token: 'local-token',
      created_at: 1,
      expires_in: 3600
    })
  });
  await auth();
  expect(global.fetch.mock.calls[0][0]).toBe('http://localhost:3000/oauth/token');
  expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
    await getMainServerTokenKey('ACCESS_TOKEN'),
    'local-token'
  );
  expect(SecureStore.setItemAsync).not.toHaveBeenCalledWith('ACCESS_TOKEN', expect.anything());
  SecureStore.getItemAsync.mockClear().mockResolvedValue('local-token');
  const headers = await getGraphqlAuthHeaders();
  expect(headers.authorization).toBe('Bearer local-token');
  expect(SecureStore.getItemAsync).toHaveBeenCalledWith(
    await getMainServerTokenKey('ACCESS_TOKEN')
  );
  await ReactQueryClient();
  expect(GraphQLClient).toHaveBeenCalledWith('http://localhost:3000/graphql');
  await expect(getGraphqlAuthHeaders(AUTH_MODE_USER)).rejects.toThrow('public requests only');
});

it.each([401, 200])('does not write an absent OAuth token after HTTP %i', async (status) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status === 200,
    status,
    json: async () => ({ error: 'invalid_client' })
  });
  await expect(auth()).rejects.toThrow('Main-Server authentication failed');
  expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
});
