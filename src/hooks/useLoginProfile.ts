import {
  CodeChallengeMethod,
  exchangeCodeAsync,
  makeRedirectUri,
  refreshAsync,
  ResponseType,
  useAuthRequest
} from 'expo-auth-session';
import { useEffect, useState } from 'react';

import * as appJson from '../../app.json';
import { secrets } from '../config';
import { addToStore, readFromStore } from '../helpers';

const PROFILE_ACCESS_TOKEN = 'profileAccessToken';

const namespace = appJson.expo.slug as keyof typeof secrets;
const profile = secrets[namespace]?.profile;
const serverUrl = profile?.serverUrl;

const keycloakDiscovery = {
  authorizationEndpoint: serverUrl + '/auth',
  tokenEndpoint: serverUrl + '/token',
  revocationEndpoint: serverUrl + '/revoke'
};

const CLIENT_ID = profile?.clientId;
const CLIENT_SECRET = profile?.clientSecret;
const SCOPES = ['openid', 'email', 'profile', 'phone', 'address'];

export const useLoginProfile = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const redirectUri = makeRedirectUri({
    scheme: appJson.expo.scheme,
    path: 'redirect'
  });

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      codeChallengeMethod: CodeChallengeMethod.S256,
      redirectUri,
      responseType: ResponseType.Code,
      scopes: SCOPES,
      usePKCE: false
    },
    keycloakDiscovery
  );

  useEffect(() => {
    const handleAuthResponse = async () => {
      if (response?.type === 'success') {
        const { code } = response.params;
        await exchangeToken(code);
      }
    };

    handleAuthResponse();
  }, [response]);

  const exchangeToken = async (code: string) => {
    try {
      setLoading(true);
      const tokenResult = await exchangeCodeAsync(
        {
          code,
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          redirectUri,
          extraParams: {
            grant_type: 'authorization_code'
          }
        },
        keycloakDiscovery
      );

      setIsLoggedIn(true);
      await addToStore(PROFILE_ACCESS_TOKEN, JSON.stringify(tokenResult));
    } catch (error) {
      console.error('Error exchanging code:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await checkToken();
    })();
  }, []);

  const checkToken = async () => {
    const storedToken = await readFromStore(PROFILE_ACCESS_TOKEN);

    if (!storedToken) {
      setIsLoggedIn(false);
      return null;
    }

    try {
      const parsedToken = JSON.parse(storedToken);

      const now = Math.floor(Date.now() / 1000);
      const expiresAt = parsedToken.issuedAt + parsedToken.expiresIn;

      if (now >= expiresAt) {
        // Token expired, try refresh
        const refreshed = await refreshToken(parsedToken.refreshToken);

        if (refreshed) {
          setIsLoggedIn(true);
          return refreshed;
        } else {
          setIsLoggedIn(false);
          return null;
        }
      } else {
        setIsLoggedIn(true);
        return parsedToken;
      }
    } catch (err) {
      console.error('Error checking token:', err);
      setIsLoggedIn(false);
      return null;
    }
  };

  const refreshToken = async (refreshToken: string) => {
    try {
      const newToken = await refreshAsync(
        {
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          refreshToken
        },
        keycloakDiscovery
      );

      await addToStore(PROFILE_ACCESS_TOKEN, JSON.stringify(newToken));
      return newToken;
    } catch (err) {
      console.error('Failed to refresh token:', err);
      return null;
    }
  };

  const login = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const logout = async () => {
    try {
      const token = await checkToken();
      if (!token?.accessToken) return;

      await fetch(`${serverUrl}/logout`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token.accessToken}`
        }
      });

      await addToStore(PROFILE_ACCESS_TOKEN, '');
      setIsLoggedIn(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return {
    checkToken,
    isLoggedIn,
    loading,
    login,
    logout
  };
};
