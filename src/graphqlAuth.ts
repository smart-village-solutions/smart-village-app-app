import * as SecureStore from 'expo-secure-store';

import { profileAuthToken, profileUserAuthToken } from './helpers/profileHelper';
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
  authMode: GraphqlAuthMode = AUTH_MODE_PUBLIC
): Promise<GraphqlAuthHeaders> => {
  const accessToken = await SecureStore.getItemAsync('ACCESS_TOKEN');
  const authToken = await resolveAuthToken(authMode);
  const userAuthToken = includesUserAuth(authMode) ? await profileUserAuthToken() : '';

  return {
    authorization: accessToken ? `Bearer ${accessToken}` : '',
    'X-Authorization': authToken || '',
    'X-User-Authorization': userAuthToken || ''
  };
};

export const getApolloAuthContext = (authMode: GraphqlAuthMode) => ({
  context: { authMode }
});
