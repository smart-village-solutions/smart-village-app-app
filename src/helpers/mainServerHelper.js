import { CryptoDigestAlgorithm, digestStringAsync } from 'expo-crypto';

import { namespace, secrets } from '../config';

export const hasLocalMainServer = () => __DEV__ && !!process.env.EXPO_PUBLIC_MAIN_SERVER_URL;

export const getMainServerConfig = () => {
  const name = hasLocalMainServer()
    ? process.env.EXPO_PUBLIC_MAIN_SERVER_CONFIG || namespace
    : namespace;
  if (!Object.prototype.hasOwnProperty.call(secrets, name)) {
    throw new Error('Unknown Main-Server development configuration');
  }
  return secrets[name];
};

export const getMainServerUrl = () => {
  if (!hasLocalMainServer()) return secrets[namespace].serverUrl;
  let url;
  try {
    url = new URL(process.env.EXPO_PUBLIC_MAIN_SERVER_URL);
  } catch {
    throw new Error('EXPO_PUBLIC_MAIN_SERVER_URL must be a local HTTP(S) origin');
  }
  const local =
    ['localhost', '127.0.0.1', '[::1]', '10.0.2.2'].includes(url.hostname) ||
    /^[a-z0-9-]+\.server\.smart-village\.local$/.test(url.hostname);
  const originOnly =
    !url.username && !url.password && !url.search && !url.hash && url.pathname === '/';
  if (!local || !originOnly || !['http:', 'https:'].includes(url.protocol)) {
    throw new Error('EXPO_PUBLIC_MAIN_SERVER_URL must be a local HTTP(S) origin');
  }
  return url.origin;
};

export const getMainServerTokenKey = async (key) => {
  if (!hasLocalMainServer()) return key;
  const scope = await digestStringAsync(
    CryptoDigestAlgorithm.SHA256,
    JSON.stringify([namespace, getMainServerUrl(), getMainServerConfig().oAuthClientId])
  );
  return `${key}_${scope}`;
};
