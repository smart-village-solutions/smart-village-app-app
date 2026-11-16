import * as SecureStore from 'expo-secure-store';
import { AppState, Platform } from 'react-native';

import { readSecureStoreItem } from '../../src/helpers/secureStore';
import { profileAuthToken } from '../../src/helpers/profileHelper';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), deleteItemAsync: jest.fn() }));

const lockedError = new Error('User interaction is not allowed.');

describe('temporary iOS Keychain failures', () => {
  let onChange: (state: string) => void;
  const remove = jest.fn();
  const originalState = AppState.currentState;
  const originalOS = Platform.OS;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    Platform.OS = 'ios';
    AppState.currentState = 'background';
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_, listener) => {
      onChange = listener;
      return { remove };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
    AppState.currentState = originalState;
    Platform.OS = originalOS;
  });

  it('waits for foreground then recovers the original credential without deleting it', async () => {
    (SecureStore.getItemAsync as jest.Mock)
      .mockRejectedValueOnce(lockedError)
      .mockResolvedValue('existing-token');
    const reading = profileAuthToken();
    await Promise.resolve();
    expect(SecureStore.getItemAsync).toHaveBeenCalledTimes(1);
    onChange('active');
    await expect(reading).resolves.toBe('existing-token');
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it('bounds the foreground wait and preserves the error and credential', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(lockedError);
    const reading = profileAuthToken();
    const assertion = expect(reading).rejects.toBe(lockedError);
    await jest.advanceTimersByTimeAsync(30_000);
    await assertion;
    expect(remove).toHaveBeenCalledTimes(1);
    expect(SecureStore.getItemAsync).toHaveBeenCalledTimes(1);
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  it('retries an active/unlock race once and propagates a persistent failure', async () => {
    AppState.currentState = 'active';
    (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(lockedError);
    const reading = readSecureStoreItem('ACCESS_TOKEN');
    const assertion = expect(reading).rejects.toBe(lockedError);
    await jest.advanceTimersByTimeAsync(250);
    await assertion;
    expect(SecureStore.getItemAsync).toHaveBeenCalledTimes(2);
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  it('does not reset credentials on unrelated read errors', async () => {
    const failure = new Error('storage unavailable');
    (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(failure);
    await expect(profileAuthToken()).rejects.toBe(failure);
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
    expect(AppState.addEventListener).not.toHaveBeenCalled();
  });

  it('preserves a genuinely missing credential', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    await expect(readSecureStoreItem('ACCESS_TOKEN')).resolves.toBeNull();
  });
});
