import * as SecureStore from 'expo-secure-store';

const VOLUNTEER_AUTH_TOKEN = 'VOLUNTEER_AUTH_TOKEN';
const VOLUNTEER_CONTENT_CONTAINER_ID = 'VOLUNTEER_CONTENT_CONTAINER_ID';

export const storeVolunteerAuthToken = (authToken?: string) => {
  if (authToken) {
    SecureStore.setItemAsync(VOLUNTEER_AUTH_TOKEN, authToken);
  } else {
    SecureStore.deleteItemAsync(VOLUNTEER_AUTH_TOKEN);
  }
};

export const volunteerAuthToken = () => SecureStore.getItemAsync(VOLUNTEER_AUTH_TOKEN);

export const storeVolunteerContentContainerId = (contentContainerId?: number) => {
  if (contentContainerId) {
    SecureStore.setItemAsync(VOLUNTEER_CONTENT_CONTAINER_ID, `${contentContainerId}`);
  } else {
    SecureStore.deleteItemAsync(VOLUNTEER_CONTENT_CONTAINER_ID);
  }
};

export const volunteerContentContainerId = () =>
  SecureStore.getItemAsync(VOLUNTEER_CONTENT_CONTAINER_ID);
