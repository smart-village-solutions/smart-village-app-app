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
      areaServiceData: { postalCodes: string[] } | undefined;
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
        const zipCode = response?.address?.postcode || '';

        if (!areaServiceData?.postalCodes?.includes(zipCode)) {
          setValue('city', '');
          setValue('houseNumber', '');
          setValue('street', '');
          setValue('zipCode', '');

          throw new Error(errorMessage);
        }

        setValue('city', city);
        setValue('houseNumber', houseNumber);
        setValue('street', street);
        setValue('zipCode', zipCode);
      } catch (error) {
        throw new Error(error.message);
      }
    },
    []
  );
};
