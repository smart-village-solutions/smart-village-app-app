import AsyncStorage from '@react-native-async-storage/async-storage';

// thx to: https://stackoverflow.com/a/35629507/9956365
export const addToStore = async (key, value) =>
  await AsyncStorage.setItem(key, JSON.stringify(value));
export const readFromStore = async (key) => JSON.parse(await AsyncStorage.getItem(key));
export const resetStore = async () => await AsyncStorage.clear();

export const storageHelper = {
  globalSettings: () => readFromStore('globalSettings'),
  setGlobalSettings: (globalSettings) => addToStore('globalSettings', globalSettings),
  matomoSettings: () => readFromStore('matomoSettings'),
  setMatomoSettings: (matomoSettings) => addToStore('matomoSettings', matomoSettings),
  listTypesSettings: () => readFromStore('listTypesSettings'),
  setListTypesSettings: (listTypesSettings) => addToStore('listTypesSettings', listTypesSettings)
};

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

      console.log('CURRENT STORAGE: ', myStorage);
    });
  });
};
