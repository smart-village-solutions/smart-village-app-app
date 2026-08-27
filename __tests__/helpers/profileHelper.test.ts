jest.mock('expo-secure-store', () => ({
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn()
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  removeItem: jest.fn(),
  setItem: jest.fn()
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import {
  PROFILE_AUTH_TOKEN,
  PROFILE_USER_AUTH_TOKEN,
  storeTokens
} from '../../src/helpers/profileHelper';

describe('profileHelper token storage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('waits until both profile tokens have been persisted', async () => {
    let resolveMemberTokenWrite: () => void = () => {};
    const memberTokenWrite = new Promise<void>((resolve) => {
      resolveMemberTokenWrite = resolve;
    });

    (SecureStore.setItemAsync as jest.Mock).mockImplementation((key: string) =>
      key === PROFILE_AUTH_TOKEN ? memberTokenWrite : Promise.resolve()
    );

    let settled = false;
    const storingTokens = storeTokens('member-token', 'user-token').then(() => {
      settled = true;
    });

    await Promise.resolve();

    expect(settled).toBe(false);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(PROFILE_AUTH_TOKEN, 'member-token');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      PROFILE_USER_AUTH_TOKEN,
      'user-token'
    );

    resolveMemberTokenWrite();
    await storingTokens;

    expect(settled).toBe(true);
  });

  it('waits until both tokens and cached profile data have been cleared', async () => {
    let resolveProfileRemoval: () => void = () => {};
    const profileRemoval = new Promise<void>((resolve) => {
      resolveProfileRemoval = resolve;
    });

    (AsyncStorage.removeItem as jest.Mock).mockReturnValue(profileRemoval);

    let settled = false;
    const clearingTokens = storeTokens().then(() => {
      settled = true;
    });

    await Promise.resolve();

    expect(settled).toBe(false);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(PROFILE_AUTH_TOKEN);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(PROFILE_USER_AUTH_TOKEN);
    expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(1);

    resolveProfileRemoval();
    await clearingTokens;

    expect(settled).toBe(true);
  });
});
