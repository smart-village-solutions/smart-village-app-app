import AsyncStorage from '@react-native-async-storage/async-storage';

// thx to: https://stackoverflow.com/a/35629507/9956365

/**
 * Persists a serializable value under the given key in AsyncStorage.
 */
export const addToStore = async (key, value) =>
  await AsyncStorage.setItem(key, JSON.stringify(value));

/**
 * Reads a value from AsyncStorage and parses the stored JSON payload.
 */
export const readFromStore = async (key) => JSON.parse(await AsyncStorage.getItem(key));

/**
 * Removes the given key entirely from AsyncStorage.
 */
export const removeFromStore = async (key) => await AsyncStorage.removeItem(key);

/**
 * Clears all keys from AsyncStorage. Use with caution.
 */
export const resetStore = async () => await AsyncStorage.clear();

/** Convenience accessors for core configuration blobs. */
export const storageHelper = {
  globalSettings: () => readFromStore('globalSettings'),
  setGlobalSettings: (globalSettings) => addToStore('globalSettings', globalSettings),
  locationSettings: () => readFromStore('locationSettings'),
  setLocationSettings: (settings) => addToStore('locationSettings', settings),
  matomoSettings: () => readFromStore('matomoSettings'),
  setMatomoSettings: (matomoSettings) => addToStore('matomoSettings', matomoSettings),
  listTypesSettings: () => readFromStore('listTypesSettings'),
  setListTypesSettings: (listTypesSettings) => addToStore('listTypesSettings', listTypesSettings),
  conversationSettings: () => readFromStore('conversationSettings'),
  setConversationSettings: (conversationSettings) =>
    addToStore('conversationSettings', conversationSettings),
  configurations: () => readFromStore('configurations'),
  setConfigurations: (configurations) => addToStore('configurations', configurations)
};

/**
 * Prints the current AsyncStorage contents to the console for debugging.
 *
 * @param withoutApollo When true, hides `apollo-cache-persist` entries to reduce noise.
 */
export const logCurrentStorage = (withoutApollo = false) => {
  AsyncStorage.getAllKeys().then((keyArray) => {
    AsyncStorage.multiGet(keyArray).then((keyValArray) => {
      let myStorage = {};
      for (let keyVal of keyValArray) {
        if (withoutApollo && keyVal.includes('apollo-cache-persist')) {
          // ignore apollo data
        } else {
          myStorage[keyVal[0]] = keyVal[1];
        }
      }

      // this is intended to be logged if the method is called
      // eslint-disable-next-line no-console
      console.log('CURRENT STORAGE: ', myStorage);
    });
  });
};
