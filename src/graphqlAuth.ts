import * as SecureStore from 'expo-secure-store';
import { CryptoDigestAlgorithm, digestStringAsync } from 'expo-crypto';

import { namespace } from './config';
import { profileAuthToken, profileUserAuthToken } from './helpers/profileHelper';
import { getTextsLocale } from './helpers/textsLocaleHelper';
import {
  getMainServerConfig,
  getMainServerTokenKey,
  getMainServerUrl,
  hasLocalMainServer
} from './helpers/mainServerHelper';
import { voucherAuthToken } from './helpers/voucherHelper';

export const AUTH_MODE_PUBLIC = 'public';
export const AUTH_MODE_MEMBER = 'member';
export const AUTH_MODE_USER = 'user';
export const AUTH_MODE_VOUCHER = 'voucher';

export type GraphqlAuthMode =
  | typeof AUTH_MODE_PUBLIC
  | typeof AUTH_MODE_MEMBER
  | typeof AUTH_MODE_USER
  | typeof AUTH_MODE_VOUCHER;

export type GraphqlAuthHeaders = {
  authorization: string;
  'X-Authorization': string;
  'X-User-Authorization': string;
  'Accept-Language': string;
};

const includesMemberAuth = (authMode: GraphqlAuthMode) =>
  authMode === AUTH_MODE_MEMBER || authMode === AUTH_MODE_USER;

const includesUserAuth = (authMode: GraphqlAuthMode) => authMode === AUTH_MODE_USER;

const resolveAuthToken = async (authMode: GraphqlAuthMode) => {
  if (authMode === AUTH_MODE_VOUCHER) {
    return (await voucherAuthToken()) || '';
  }

  if (includesMemberAuth(authMode)) {
    return (await profileAuthToken()) || (await voucherAuthToken()) || '';
  }

  return '';
};

export const getGraphqlAuthHeaders = async (
  authMode: GraphqlAuthMode = AUTH_MODE_PUBLIC,
  locale = getTextsLocale()
): Promise<GraphqlAuthHeaders> => {
  // shortcut: local pilot supports public reads only, scope member tokens before extending it.
  if (hasLocalMainServer() && authMode !== AUTH_MODE_PUBLIC) {
    throw new Error('Local Main-Server override supports public requests only');
  }
  const accessToken = await SecureStore.getItemAsync(await getMainServerTokenKey('ACCESS_TOKEN'));
  const authToken = await resolveAuthToken(authMode);
  const userAuthToken = includesUserAuth(authMode) ? await profileUserAuthToken() : '';

  return {
    authorization: accessToken ? `Bearer ${accessToken}` : '',
    'X-Authorization': authToken || '',
    'X-User-Authorization': userAuthToken || '',
    'Accept-Language': locale
  };
};

// Credentials only enter the digest, never storage keys or logs.
export const getGraphqlCacheScope = (headers: GraphqlAuthHeaders) =>
  digestStringAsync(
    CryptoDigestAlgorithm.SHA256,
    JSON.stringify([
      namespace,
      getMainServerUrl(),
      getMainServerConfig().graphqlEndpoint,
      getMainServerConfig().oAuthClientId,
      headers.authorization,
      headers['X-Authorization'],
      headers['X-User-Authorization'],
      headers['Accept-Language']
    ])
  );

export const getApolloAuthContext = (authMode: GraphqlAuthMode) => ({
  context: { authMode }
});
