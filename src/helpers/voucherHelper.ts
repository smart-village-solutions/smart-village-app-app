import * as SecureStore from 'expo-secure-store';

const VOUCHER_AUTH_TOKEN = 'VOUCHER_AUTH_TOKEN';
export const VOUCHER_MEMBER_ID = 'VOUCHER_MEMBER_ID';
export const VOUCHER_TRANSACTIONS = 'VOUCHER_TRANSACTIONS';

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
