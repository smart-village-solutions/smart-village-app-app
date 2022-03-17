import * as SecureStore from 'expo-secure-store';

const CONSUL_AUTH_TOKEN = 'CONSUL_AUTH_TOKEN';

export const setConsulAuthToken = (authToken) => {
  if (authToken) {
    SecureStore.setItemAsync(CONSUL_AUTH_TOKEN, authToken);
  } else {
    SecureStore.deleteItemAsync(CONSUL_AUTH_TOKEN);
  }
};

export const getConsulAuthToken = () => SecureStore.getItemAsync(CONSUL_AUTH_TOKEN);
