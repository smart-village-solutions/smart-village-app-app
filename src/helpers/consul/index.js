import * as SecureStore from 'expo-secure-store';

const CONSUL_AUTH_TOKEN = 'CONSUL_AUTH_TOKEN';
const CONSUL_USER = 'CONSUL_USER';

export const setConsulAuthToken = async (authToken) => {
  if (authToken) {
    await SecureStore.setItemAsync(CONSUL_AUTH_TOKEN, JSON.stringify(authToken));
  } else {
    await SecureStore.deleteItemAsync(CONSUL_AUTH_TOKEN);
  }
};

export const getConsulAuthToken = async () => await SecureStore.getItemAsync(CONSUL_AUTH_TOKEN);

export const setConsulUser = async (userId) => {
  if (userId) {
    await SecureStore.setItemAsync(CONSUL_USER, userId);
  } else {
    await SecureStore.deleteItemAsync(CONSUL_USER);
  }
};

export const getConsulUser = async () => await SecureStore.getItemAsync(CONSUL_USER);

export * from './dataErrorMessageGenerator';
export * from './filterHelper';
export * from './homeData';
export * from './sortingHelper';
