import * as SecureStore from 'expo-secure-store';

const storageKey = 'ENCOUNTER_USER_ID';

export const storeEncounterUserId = (userId: string) =>
  SecureStore.setItemAsync(storageKey, userId);

export const getEncounterUserId = () => SecureStore.getItemAsync(storageKey);
