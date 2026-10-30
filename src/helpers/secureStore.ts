import * as SecureStore from 'expo-secure-store';
import { AppState, Platform } from 'react-native';

const FOREGROUND_TIMEOUT_MS = 30_000;
let foregroundWait: Promise<boolean> | undefined;

export const isSecureStoreTemporarilyUnavailable = (error: unknown) => {
  const details = error as { code?: string | number; message?: string } | undefined;
  return (
    String(details?.code) === '-25308' ||
    /user interaction is not allowed|errSecInteractionNotAllowed/i.test(details?.message ?? '')
  );
};

const waitForForeground = () => {
  if (foregroundWait) return foregroundWait;

  foregroundWait = new Promise<boolean>((resolve) => {
    const finish = (active: boolean) => {
      clearTimeout(timeout);
      subscription.remove();
      resolve(active);
    };
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') finish(true);
    });
    const timeout = setTimeout(() => finish(false), FOREGROUND_TIMEOUT_MS);
    // Close the race between checking currentState and installing the listener.
    if (AppState.currentState === 'active') finish(true);
  }).finally(() => {
    foregroundWait = undefined;
  });

  return foregroundWait;
};

export const readSecureStoreItem = async (key: string): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    if (Platform.OS !== 'ios' || !isSecureStoreTemporarilyUnavailable(error)) throw error;

    if (AppState.currentState === 'background' || AppState.currentState === 'inactive') {
      if (!(await waitForForeground())) throw error;
    } else {
      // iOS can briefly report active before protected data is available after unlocking.
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    // One retry only. Never turn an inaccessible credential into a missing credential,
    // and never delete it: callers must retain their state if the retry also fails.
    return SecureStore.getItemAsync(key);
  }
};
