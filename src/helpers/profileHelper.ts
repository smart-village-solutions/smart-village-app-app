import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { ProfileMember } from '../types';

import { addToStore, readFromStore } from './storageHelper';

export const PROFILE_AUTH_TOKEN = 'PROFILE_AUTH_TOKEN';
export const PROFILE_USER_AUTH_TOKEN = 'PROFILE_USER_AUTH_TOKEN';
const PROFILE_CURRENT_USER = 'PROFILE_CURRENT_USER';
const PROFILE_UPDATED = 'PROFILE_UPDATED';

export const storeTokens = async (authToken?: string, userAuthToken?: string) => {
  const tokenOperations = [
    storeProfileAuthToken(authToken),
    storeProfileUserAuthToken(userAuthToken)
  ];

  if (!userAuthToken) {
    tokenOperations.push(storeProfileUserData());
  }

  await Promise.all(tokenOperations);
};

export const storeProfileAuthToken = (authToken?: string) => {
  if (authToken) {
    return SecureStore.setItemAsync(PROFILE_AUTH_TOKEN, authToken);
  }

  return SecureStore.deleteItemAsync(PROFILE_AUTH_TOKEN);
};

export const profileAuthToken = async () => {
  let authToken = null;

  // The reason for the problem of staying in SplashScreen that occurs after the application is
  // updated on the Android side is the inability to obtain the token here.
  // For this reason, try/catch is used here and the problem of getting stuck in SplashScreen is solved.
  try {
    authToken = await SecureStore.getItemAsync(PROFILE_AUTH_TOKEN);
  } catch {
    // Token deleted here so that it can be recreated
    await SecureStore.deleteItemAsync(PROFILE_AUTH_TOKEN);
  }

  return authToken;
};

const storeProfileUserAuthToken = (userAuthToken?: string) => {
  if (userAuthToken) {
    return SecureStore.setItemAsync(PROFILE_USER_AUTH_TOKEN, userAuthToken);
  }

  return SecureStore.deleteItemAsync(PROFILE_USER_AUTH_TOKEN);
};

export const profileUserAuthToken = async () => {
  let userAuthToken = null;

  // The reason for the problem of staying in SplashScreen that occurs after the application is
  // updated on the Android side is the inability to obtain the token here.
  // For this reason, try/catch is used here and the problem of getting stuck in SplashScreen is solved.
  try {
    userAuthToken = await SecureStore.getItemAsync(PROFILE_USER_AUTH_TOKEN);
  } catch {
    // Token deleted here so that it can be recreated
    await SecureStore.deleteItemAsync(PROFILE_USER_AUTH_TOKEN);
  }

  return userAuthToken;
};

export const storeProfileUserData = (userData?: ProfileMember) => {
  if (userData) {
    return addToStore(PROFILE_CURRENT_USER, userData);
  }

  return AsyncStorage.removeItem(PROFILE_CURRENT_USER);
};

export const profileUserData = async (): Promise<{
  currentUserData: ProfileMember | null;
}> => {
  let currentUserData = null;

  // The reason for the problem of staying in SplashScreen that occurs after the application is
  // updated on the Android side is the inability to obtain the token here.
  // For this reason, try/catch is used here and the problem of getting stuck in SplashScreen is solved.
  try {
    currentUserData = await readFromStore(PROFILE_CURRENT_USER);
  } catch {
    // Token deleted here so that it can be recreated
    await AsyncStorage.removeItem(PROFILE_CURRENT_USER);
  }

  return { currentUserData };
};
