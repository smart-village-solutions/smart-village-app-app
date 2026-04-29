import {
  exchangeCodeAsync,
  makeRedirectUri,
  refreshAsync,
  useAuthRequest
} from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import {
  dismissAuthSession,
  maybeCompleteAuthSession,
  openAuthSessionAsync
} from 'expo-web-browser';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import * as appJson from '../../app.json';
import { device, texts } from '../config';
import { storeProfileAuthToken, storeProfileUserData } from '../helpers';

const PROFILE_ACCESS_TOKEN = 'profileAccessToken';

maybeCompleteAuthSession();

type TProfile = {
  clientId: string;
  clientSecret: string;
  scopes: string[];
  serverUrl: string;
  usePKCE?: boolean;
};

type TUseLoginProfileOptions = {
  enabled?: boolean;
  onLoginSuccess?: () => Promise<void> | void;
  onLogout?: () => Promise<void> | void;
};

type TStoredProfileToken = {
  accessToken?: string;
  expiresIn?: number;
  idToken?: string;
  issuedAt?: number;
  refreshToken?: string;
};

export const useLoginProfile = (
  profile: TProfile,
  { enabled = true, onLoginSuccess, onLogout }: TUseLoginProfileOptions = {}
) => {
  const { clientId, clientSecret, scopes, serverUrl, usePKCE = false } = profile;
  const isConfigured = enabled && !!clientId && !!serverUrl;

  const keycloakDiscovery = useMemo(
    () => ({
      authorizationEndpoint: serverUrl + '/auth',
      revocationEndpoint: serverUrl + '/revoke',
      tokenEndpoint: serverUrl + '/token',
      endSessionEndpoint: serverUrl + '/logout'
    }),
    [serverUrl]
  );

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const clearStoredToken = useCallback(async () => {
    await SecureStore.deleteItemAsync(PROFILE_ACCESS_TOKEN);
    storeProfileAuthToken();
    storeProfileUserData();
    setIsLoggedIn(false);
    await onLogout?.();
  }, [onLogout]);

  const shouldClearStoredToken = useCallback((error: unknown) => {
    if (error instanceof SyntaxError) {
      return true;
    }

    if (!error || typeof error !== 'object') {
      return false;
    }

    const oauthError = error as {
      code?: string;
      description?: string;
      info?: { error?: string; error_description?: string } | string;
      params?: Record<string, string>;
    };

    const codes = [
      oauthError.code,
      oauthError.params?.error,
      typeof oauthError.info === 'object' ? oauthError.info?.error : undefined
    ]
      .filter(Boolean)
      .map((value) => value?.toLowerCase());

    if (codes.includes('invalid_grant') || codes.includes('invalid_token')) {
      return true;
    }

    const descriptions = [
      oauthError.description,
      oauthError.params?.error_description,
      typeof oauthError.info === 'object' ? oauthError.info?.error_description : undefined
    ]
      .filter(Boolean)
      .map((value) => value?.toLowerCase());

    return descriptions.some(
      (value) =>
        value?.includes('token is not active') ||
        value?.includes('refresh token is invalid') ||
        value?.includes('refresh token is expired') ||
        value?.includes('revoked')
    );
  }, []);

  const redirectUri = makeRedirectUri({
    path: 'redirect',
    scheme: appJson.expo.scheme
  });

  const [, response, promptAsync] = useAuthRequest(
    {
      clientId,
      redirectUri,
      scopes,
      usePKCE,
      extraParams: { kc_idp_hint: 'keycloak-oidc' }
    },
    keycloakDiscovery
  );

  const exchangeToken = useCallback(
    async (code: string) => {
      if (!isConfigured) {
        return;
      }

      try {
        setLoading(true);
        const tokenResult = await exchangeCodeAsync(
          {
            clientId,
            clientSecret,
            code,
            extraParams: { grant_type: 'authorization_code' },
            redirectUri
          },
          keycloakDiscovery
        );

        if (!tokenResult.accessToken) {
          storeProfileAuthToken();
          await SecureStore.deleteItemAsync(PROFILE_ACCESS_TOKEN);
          setIsLoggedIn(false);
          throw new Error('Token exchange failed: missing access token');
        }

        storeProfileAuthToken(tokenResult.accessToken);
        setIsLoggedIn(true);
        await SecureStore.setItemAsync(PROFILE_ACCESS_TOKEN, JSON.stringify(tokenResult));
        await onLoginSuccess?.();
      } catch (error) {
        storeProfileAuthToken();
        await SecureStore.deleteItemAsync(PROFILE_ACCESS_TOKEN);
        setIsLoggedIn(false);
        console.error('Error exchanging code:', error);
      } finally {
        setLoading(false);
      }
    },
    [clientId, clientSecret, isConfigured, keycloakDiscovery, onLoginSuccess, redirectUri]
  );

  useEffect(() => {
    const handleAuthResponse = async () => {
      if (response?.type === 'success') {
        const { code } = response.params;
        await exchangeToken(code);
      }
    };

    handleAuthResponse();
  }, [exchangeToken, response]);

  const refreshToken = useCallback(
    async (refreshTokenValue: string) => {
      if (!isConfigured) {
        return null;
      }

      try {
        const newToken = await refreshAsync(
          {
            clientId,
            clientSecret,
            refreshToken: refreshTokenValue
          },
          keycloakDiscovery
        );

        await SecureStore.setItemAsync(PROFILE_ACCESS_TOKEN, JSON.stringify(newToken));
        newToken.accessToken && storeProfileAuthToken(newToken.accessToken);

        return newToken;
      } catch (error) {
        if (shouldClearStoredToken(error)) {
          await clearStoredToken();
          return null;
        }

        console.error('Failed to refresh token:', error);
        // false = transient failure: token may still be valid, keep the user logged in
        return false;
      }
    },
    [
      clearStoredToken,
      clientId,
      clientSecret,
      isConfigured,
      keycloakDiscovery,
      shouldClearStoredToken
    ]
  );

  const handleExpiredToken = useCallback(
    async (parsedToken: TStoredProfileToken) => {
      if (!parsedToken.refreshToken) {
        await clearStoredToken();
        return null;
      }

      const refreshedToken = await refreshToken(parsedToken.refreshToken);

      if (refreshedToken) {
        setIsLoggedIn(true);
        return refreshedToken;
      }

      if (refreshedToken === null) {
        setIsLoggedIn(false);
        return null;
      }

      setIsLoggedIn(true);
      console.warn('Refresh token request failed temporarily; keeping current login state');
      return parsedToken;
    },
    [clearStoredToken, refreshToken]
  );

  const checkToken = useCallback(async () => {
    if (!isConfigured) {
      setIsLoggedIn(false);
      return null;
    }

    setLoading(true);

    try {
      const storedToken = await SecureStore.getItemAsync(PROFILE_ACCESS_TOKEN);

      if (!storedToken) {
        setIsLoggedIn(false);
        return null;
      }

      const parsedToken = JSON.parse(storedToken) as TStoredProfileToken;
      const issuedAt = Number(parsedToken.issuedAt);
      const expiresIn = Number(parsedToken.expiresIn);

      if (!issuedAt || !expiresIn) {
        await clearStoredToken();
        return null;
      }

      const now = Math.floor(Date.now() / 1000);
      const expiresAt = issuedAt + expiresIn;

      if (now >= expiresAt) {
        return handleExpiredToken(parsedToken);
      }

      parsedToken.accessToken && storeProfileAuthToken(parsedToken.accessToken);
      setIsLoggedIn(true);
      return parsedToken;
    } catch (error) {
      if (shouldClearStoredToken(error)) {
        await clearStoredToken();
      } else {
        console.error('Error checking token:', error);
      }

      return null;
    } finally {
      setLoading(false);
    }
  }, [clearStoredToken, handleExpiredToken, isConfigured, shouldClearStoredToken]);

  useEffect(() => {
    checkToken();
  }, [checkToken]);

  const login = async () => {
    if (!isConfigured) {
      return;
    }

    try {
      await promptAsync();
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const logout = async () => {
    Alert.alert(texts.profile.logout, texts.profile.logoutAlertBody, [
      {
        text: texts.profile.abort,
        style: 'cancel'
      },
      {
        style: 'destructive',
        text: texts.profile.logout,
        onPress: async () => {
          if (!isConfigured) {
            await clearStoredToken();
            return;
          }

          try {
            const token = await checkToken();

            if (token?.idToken) {
              const logoutUrl =
                `${keycloakDiscovery.endSessionEndpoint}?id_token_hint=${encodeURIComponent(
                  token.idToken
                )}` + `&post_logout_redirect_uri=${encodeURIComponent(redirectUri)}`;
              await openAuthSessionAsync(logoutUrl, redirectUri);
            }

            if (device.platform === 'ios') {
              await dismissAuthSession();
            }
          } catch (err) {
            console.error('Logout error:', err);
          } finally {
            await clearStoredToken();
          }
        }
      }
    ]);
  };

  return {
    checkToken,
    isLoggedIn,
    loading,
    login,
    logout
  };
};
