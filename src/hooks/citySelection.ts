import { useCallback, useState } from 'react';

import { addToStore, readFromStore, removeFromStore } from '../helpers';

export const SELECTED_CITY = 'selectedCity';

export const useCitySelection = () => {
  const [storedCity, setStoredCity] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadStoredCity = useCallback(async () => {
    setLoading(true);
    const city = await readFromStore(SELECTED_CITY);
    setStoredCity(city);
    setLoading(false);

    return city;
  }, []);

  const storeCity = useCallback(async (city: string | null) => {
    if (city) {
      await addToStore(SELECTED_CITY, city);
      setStoredCity(city);
    }
  }, []);

  const resetCity = useCallback(async () => {
    await removeFromStore(SELECTED_CITY);
    setStoredCity(null);
  }, []);

  return { storeCity, storedCity, loadStoredCity, loading, resetCity };
};
