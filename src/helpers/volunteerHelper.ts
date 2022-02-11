import * as SecureStore from 'expo-secure-store';

const VOLUNTEER_AUTH_TOKEN = 'VOLUNTEER_AUTH_TOKEN';

export const storeVolunteerAuthToken = (authToken: string) => {
  if (authToken) {
    SecureStore.setItemAsync(VOLUNTEER_AUTH_TOKEN, authToken);
  } else {
    SecureStore.deleteItemAsync(VOLUNTEER_AUTH_TOKEN);
  }
};

export const volunteerAuthToken = () => SecureStore.getItemAsync(VOLUNTEER_AUTH_TOKEN);
