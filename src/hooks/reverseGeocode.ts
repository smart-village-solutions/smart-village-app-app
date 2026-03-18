import { LocationObjectCoords } from 'expo-location';
import { useCallback } from 'react';
import { UseFormSetValue } from 'react-hook-form';

import appJson from '../../app.json';
import { TValues } from '../screens';

const CITY_FALLBACK_KEYS = [
  'city',
  'town',
  'village',
  'municipality',
  'city_district',
  'county'
] as const;

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
      position: LocationObjectCoords;
      setValue: UseFormSetValue<TValues>;
    }) => {
      const { latitude, longitude } = position;

      try {
        // https://operations.osmfoundation.org/policies/nominatim/
        const response = await (
          await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                'User-Agent': `${appJson.expo.scheme}/${appJson.expo.version}`
              }
            }
          )
        ).json();

        // Nominatim jsonv2 maps address parts from OSM tags, so settlement fields may vary.
        const city =
          CITY_FALLBACK_KEYS.map((key) => response?.address?.[key]).find(
            (value) => typeof value === 'string' && value.length > 0
          ) || '';
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
