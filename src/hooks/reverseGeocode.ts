import { useCallback } from 'react';
import { UseFormSetValue } from 'react-hook-form';

import appJson from '../../app.json';
import { isSuePostalCodeAllowed, SUE_CITY_KEYS } from '../helpers/sueReportLocation';
import type { TValues } from '../screens';

import type { SueCoordinates } from './useSueReportLocation';

export const useReverseGeocode = () => {
  return useCallback(
    async ({
      areaServiceData,
      errorMessage,
      isLatestRequest,
      position,
      setValue
    }: {
      areaServiceData?: { postalCodes?: string[] };
      errorMessage: string;
      isLatestRequest?: () => boolean;
      position: SueCoordinates;
      setValue: UseFormSetValue<TValues>;
    }): Promise<{ isStale: boolean; isWithinArea: boolean }> => {
      const shouldApplyResult = isLatestRequest || (() => true);
      const staleResult = { isStale: true, isWithinArea: false };
      const { latitude, longitude } = position;

      try {
        // https://operations.osmfoundation.org/policies/nominatim/
        const result = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
          {
            headers: {
              'User-Agent': `${appJson.expo.scheme}/${appJson.expo.version}`
            }
          }
        );
        if (!result.ok) throw new Error(errorMessage);
        const { address = {} } = await result.json();
        if (!shouldApplyResult()) return staleResult;

        // Nominatim jsonv2 maps address parts from OSM tags, so settlement fields may vary.
        const city =
          SUE_CITY_KEYS.map((key) => address[key]).find(
            (value) => typeof value === 'string' && value.length > 0
          ) || '';
        const {
          house_number: houseNumber = '',
          road: street = '',
          postcode: postalCode = ''
        } = address;
        const isWithinArea = areaServiceData
          ? isSuePostalCodeAllowed(postalCode, areaServiceData.postalCodes || [])
          : [city, street, postalCode].some(Boolean);

        if (isWithinArea) {
          setValue('city', city);
          setValue('houseNumber', houseNumber);
          setValue('street', street);
          setValue('postalCode', postalCode);

          return { isStale: false, isWithinArea: true };
        }

        setValue('city', '');
        setValue('houseNumber', '');
        setValue('street', '');
        setValue('postalCode', '');

        throw new Error(errorMessage);
      } catch (error) {
        if (!shouldApplyResult()) {
          return staleResult;
        }

        throw new Error(error.message);
      }
    },
    []
  );
};
