import { addToStore, removeFromStore } from '../helpers';

export const SELECTED_CITY = 'selectedCity';

export const storeSelectedCity = async (city: string | null) => {
  if (city) {
    await addToStore(SELECTED_CITY, city);
  } else {
    await removeFromStore(SELECTED_CITY);
  }
};
