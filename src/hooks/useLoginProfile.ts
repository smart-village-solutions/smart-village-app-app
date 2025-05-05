import {
  exchangeCodeAsync,
  makeRedirectUri,
  refreshAsync,
  useAuthRequest
} from 'expo-auth-session';
import { dismissAuthSession } from 'expo-web-browser';
import { useEffect, useState } from 'react';

import * as appJson from '../../app.json';
import { device } from '../config';
import { addToStore, readFromStore } from '../helpers';

const PROFILE_ACCESS_TOKEN = 'profileAccessToken';

type TProfile = {
  serverUrl: string;
  clientId: string;
  clientSecret: string;
  scopes: string[];
};

export const useLoginProfile = (profile: TProfile) => {
  const { clientId, clientSecret, scopes, serverUrl } = profile;

  const keycloakDiscovery = {
    authorizationEndpoint: serverUrl + '/auth',
    tokenEndpoint: serverUrl + '/token',
    revocationEndpoint: serverUrl + '/revoke'
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const redirectUri = makeRedirectUri({
    scheme: appJson.expo.scheme,
    path: 'redirect'
  });

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId,
      redirectUri,
      scopes,
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
          clientId,
          clientSecret,
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
    checkToken();
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
        const refreshedToken = await refreshToken(parsedToken.refreshToken);

        if (refreshedToken) {
          setIsLoggedIn(true);
          return refreshedToken;
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
          clientId,
          clientSecret,
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

      if (!token?.idToken) return;

      await fetch(`${serverUrl}/logout?id_token_hint=${token.idToken}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token.accessToken}`
        }
      });

      device.platform === 'ios' && (await dismissAuthSession());
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
