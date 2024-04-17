import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { addToStore, readFromStore } from './storageHelper';

const VOUCHER_AUTH_TOKEN = 'VOUCHER_AUTH_TOKEN';
export const VOUCHER_MEMBER_ID = 'VOUCHER_MEMBER_ID';
export const VOUCHER_TRANSACTIONS = 'VOUCHER_TRANSACTIONS';
export const VOUCHER_DEVICE_TOKEN = 'VOUCHER_DEVICE_TOKEN';

export const storeVoucherAuthToken = (authToken?: string) => {
  if (authToken) {
    SecureStore.setItemAsync(VOUCHER_AUTH_TOKEN, authToken);
  } else {
    SecureStore.deleteItemAsync(VOUCHER_AUTH_TOKEN);
  }
};

export const voucherAuthToken = async () => {
  let authToken = null;

  // The reason for the problem of staying in SplashScreen that occurs after the application is
  // updated on the Android side is the inability to obtain the token here.
  // For this reason, try/catch is used here and the problem of getting stuck in SplashScreen is solved.
  try {
    authToken = await SecureStore.getItemAsync(VOUCHER_AUTH_TOKEN);
  } catch {
    // Token deleted here so that it can be recreated
    SecureStore.deleteItemAsync(VOUCHER_AUTH_TOKEN);
  }

  return authToken;
};

export const storeVoucherMemberId = (memberId?: string) => {
  if (memberId) {
    addToStore(VOUCHER_MEMBER_ID, memberId);
  } else {
    addToStore(VOUCHER_MEMBER_ID);
  }
};

export const voucherMemberId = async () => {
  let memberId = null;

  // The reason for the problem of staying in SplashScreen that occurs after the application is
  // updated on the Android side is the inability to obtain the token here.
  // For this reason, try/catch is used here and the problem of getting stuck in SplashScreen is solved.
  try {
    memberId = await readFromStore(VOUCHER_MEMBER_ID);
  } catch {
    // Token deleted here so that it can be recreated
    AsyncStorage.removeItem(VOUCHER_MEMBER_ID);
  }

  return memberId;
};
