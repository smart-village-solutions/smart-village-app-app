import { addToStore, readFromStore, removeFromStore } from '../helpers';

export const SELECTED_CITY = 'selectedCity';

export const loadStoredCity = async () => {
  const city = await readFromStore(SELECTED_CITY);
  return city;
};

export const storeCity = async (city: string | null) => {
  if (city) {
    await addToStore(SELECTED_CITY, city);
    return city;
  }
  return null;
};

export const resetCity = async () => {
  await removeFromStore(SELECTED_CITY);
  return null;
};
