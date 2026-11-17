import { useCallback } from 'react';
import { UseFormSetValue } from 'react-hook-form';

import {
  fetchSueGeocode,
  hasRequiredSueAddress,
  SueAddressRequirements,
  isSuePostalCodeAllowed,
  getSueLocalityNames,
  SUE_ROAD_KEYS
} from '../helpers/sueReportLocation';
import type { TValues } from '../screens';

import type { SueCoordinates } from './useSueReportLocation';

export const useReverseGeocode = () => {
  return useCallback(
    async ({
      areaServiceData,
      errorMessage,
      isLatestRequest,
      position,
      requirements,
      setValue
    }: {
      areaServiceData?: { postalCodes?: string[] };
      errorMessage: string;
      isLatestRequest?: () => boolean;
      position: SueCoordinates;
      requirements?: SueAddressRequirements;
      setValue: UseFormSetValue<TValues>;
    }): Promise<{ isStale: boolean; isWithinArea: boolean }> => {
      const shouldApplyResult = isLatestRequest || (() => true);
      const staleResult = { isStale: true, isWithinArea: false };
      const { latitude, longitude } = position;

      try {
        // https://operations.osmfoundation.org/policies/nominatim/
        const result = await fetchSueGeocode(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
        );
        if (!result) throw new Error(errorMessage);
        const { address = {} } = result;
        if (!shouldApplyResult()) return staleResult;

        // Nominatim jsonv2 maps address parts from OSM tags, so settlement fields may vary.
        const city = getSueLocalityNames(address)[0];
        const street =
          SUE_ROAD_KEYS.map((key) => address[key]).find(
            (value) => typeof value === 'string' && value.trim()
          ) || '';
        const { house_number: houseNumber = '', postcode: postalCode = '' } = address;
        const isWithinArea = areaServiceData
          ? isSuePostalCodeAllowed(postalCode, areaServiceData.postalCodes || [])
          : [city, street, postalCode].some(Boolean);

        const hasRequiredFields = hasRequiredSueAddress(
          { city, houseNumber, street, postalCode },
          requirements
        );
        if (isWithinArea && hasRequiredFields) {
          setValue('city', city);
          setValue('houseNumber', houseNumber);
          setValue('street', street);
          setValue('postalCode', postalCode);

          return { isStale: false, isWithinArea: true };
        }

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
