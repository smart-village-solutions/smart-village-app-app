import { useCallback } from 'react';
import { UseFormSetValue } from 'react-hook-form';

import { TValues } from '../screens';

export const useReverseGeocode = () => {
  return useCallback(
    async ({
      areaServiceData,
      errorMessage,
      position,
      setValue
    }: {
      areaServiceData?: { postalCodes?: string[] };
      errorMessage: string;
      position: { latitude: number; longitude: number };
      setValue: UseFormSetValue<TValues>;
    }) => {
      const { latitude, longitude } = position;

      try {
        const response = await (
          await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          )
        ).json();

        const city = response?.address?.city || '';
        const houseNumber = response?.address?.house_number || '';
        const street = response?.address?.road || '';
        const postalCode = response?.address?.postcode || '';

        if (areaServiceData?.postalCodes?.includes(postalCode)) {
          setValue('city', city);
          setValue('houseNumber', houseNumber);
          setValue('street', street);
          setValue('postalCode', postalCode);
        } else {
          setValue('city', '');
          setValue('houseNumber', '');
          setValue('street', '');
          setValue('postalCode', '');

          throw new Error(errorMessage);
        }
      } catch (error) {
        throw new Error(error.message);
      }
    },
    []
  );
};
