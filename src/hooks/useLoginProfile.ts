import {
  exchangeCodeAsync,
  makeRedirectUri,
  refreshAsync,
  useAuthRequest
} from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { dismissAuthSession } from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import * as appJson from '../../app.json';
import { device, texts } from '../config';

const PROFILE_ACCESS_TOKEN = 'profileAccessToken';

type TProfile = {
  clientId: string;
  clientSecret: string;
  scopes: string[];
  serverUrl: string;
  usePKCE: boolean;
};

export const useLoginProfile = (profile: TProfile) => {
  const { clientId, clientSecret, scopes, serverUrl, usePKCE = false } = profile;

  const keycloakDiscovery = {
    authorizationEndpoint: serverUrl + '/auth',
    revocationEndpoint: serverUrl + '/revoke',
    tokenEndpoint: serverUrl + '/token'
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const redirectUri = makeRedirectUri({
    path: 'redirect',
    scheme: appJson.expo.scheme
  });

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId,
      redirectUri,
      scopes,
      usePKCE
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
          clientId,
          clientSecret,
          code,
          extraParams: { grant_type: 'authorization_code' },
          redirectUri
        },
        keycloakDiscovery
      );

      setIsLoggedIn(true);
      SecureStore.setItemAsync(PROFILE_ACCESS_TOKEN, JSON.stringify(tokenResult));
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
    const storedToken = await SecureStore.getItemAsync(PROFILE_ACCESS_TOKEN);

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

      SecureStore.setItemAsync(PROFILE_ACCESS_TOKEN, JSON.stringify(newToken));
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
    Alert.alert(texts.profile.logout, texts.profile.logoutAlertBody, [
      {
        text: texts.profile.abort,
        style: 'cancel'
      },
      {
        style: 'destructive',
        text: texts.profile.logout,
        onPress: async () => {
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
            SecureStore.deleteItemAsync(PROFILE_ACCESS_TOKEN);
            setIsLoggedIn(false);
          } catch (err) {
            console.error('Logout error:', err);
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
