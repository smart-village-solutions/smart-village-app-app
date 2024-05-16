import * as SecureStore from 'expo-secure-store';

import { addToStore, readFromStore, removeFromStore } from './storageHelper';

const VOUCHER_AUTH_TOKEN = 'VOUCHER_AUTH_TOKEN';
export const VOUCHER_MEMBER_ID = 'VOUCHER_MEMBER_ID';
export const VOUCHER_MEMBER_LOGIN_INFO = 'VOUCHER_MEMBER_LOGIN_INFO';
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
    removeFromStore(VOUCHER_MEMBER_ID);
  }
};

export const voucherMemberId = async () => {
  let memberId;

  try {
    memberId = await readFromStore(VOUCHER_MEMBER_ID);
  } catch {
    // Token deleted here so that it can be recreated
    removeFromStore(VOUCHER_MEMBER_ID);
  }

  return memberId;
};

export const storeVoucherMemberLoginInfo = (memberLoginInfo?: string) => {
  if (memberLoginInfo) {
    addToStore(VOUCHER_MEMBER_LOGIN_INFO, memberLoginInfo);
  } else {
    addToStore(VOUCHER_MEMBER_LOGIN_INFO);
  }
};

export const voucherMemberLoginInfo = async () => {
  let memberLoginInfo = {};

  try {
    memberLoginInfo = await readFromStore(VOUCHER_MEMBER_LOGIN_INFO);
  } catch {
    // Token deleted here so that it can be recreated
    removeFromStore(VOUCHER_MEMBER_LOGIN_INFO);
  }

  return memberLoginInfo;
};
