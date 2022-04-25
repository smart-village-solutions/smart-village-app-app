import * as SecureStore from 'expo-secure-store';

const CONSUL_AUTH_TOKEN = 'CONSUL_AUTH_TOKEN';

export const setConsulAuthToken = async (authToken) => {
  if (authToken) {
    await SecureStore.setItemAsync(CONSUL_AUTH_TOKEN, JSON.stringify(authToken));
  } else {
    await SecureStore.deleteItemAsync(CONSUL_AUTH_TOKEN);
  }
};

export const getConsulAuthToken = async () => await SecureStore.getItemAsync(CONSUL_AUTH_TOKEN);
