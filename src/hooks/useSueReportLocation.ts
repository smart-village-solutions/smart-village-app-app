import { useCallback, useEffect, useRef, useState } from 'react';

import { getSueAddressKey, SueAddress } from '../helpers/sueReportLocation';

export type SueCoordinates = { latitude: number; longitude: number };
export type SueLocationRequest = { isLatestRequest: () => boolean; finish: () => void };

export const useSueReportLocation = (getAddress: () => SueAddress) => {
  const [position, setPosition] = useState<SueCoordinates>();
  const confirmed = useRef<{ addressKey: string; position: SueCoordinates } | undefined>(undefined);
  const revision = useRef(0);
  const pending = useRef(false);

  useEffect(
    () => () => {
      revision.current += 1;
    },
    []
  );

  const setSelectedPosition = useCallback(
    (position?: SueCoordinates, addressKey = getSueAddressKey(getAddress())) => {
      confirmed.current = position && { addressKey, position };
      setPosition(addressKey === getSueAddressKey(getAddress()) ? position : undefined);
    },
    [getAddress]
  );

  const cancelLocationUpdate = useCallback(() => {
    revision.current += 1;
    pending.current = false;
  }, []);

  const invalidateLocation = useCallback(
    (change?: Partial<SueAddress>) => {
      cancelLocationUpdate();
      const address = { ...getAddress(), ...change };
      if (!change) {
        setSelectedPosition(undefined);
        return;
      }

      const matchingPosition =
        confirmed.current?.addressKey === getSueAddressKey(address)
          ? confirmed.current.position
          : undefined;
      setPosition(matchingPosition);
    },
    [cancelLocationUpdate, getAddress, setSelectedPosition]
  );

  const beginLocationUpdate = useCallback((): SueLocationRequest => {
    const requestId = ++revision.current;
    pending.current = true;
    const isLatestRequest = () => revision.current === requestId;

    return {
      isLatestRequest,
      finish: () => {
        if (isLatestRequest()) pending.current = false;
      }
    };
  }, []);

  const getConfirmedLocation = useCallback((address: SueAddress) => {
    const location = confirmed.current;
    if (location?.addressKey === getSueAddressKey(address)) return location;
  }, []);

  const getLastConfirmedLocation = useCallback(() => confirmed.current, []);

  const isLocationPending = useCallback(() => pending.current, []);

  return {
    beginLocationUpdate,
    cancelLocationUpdate,
    getConfirmedLocation,
    getLastConfirmedLocation,
    invalidateLocation,
    isLocationPending,
    selectedPosition: position,
    setSelectedPosition
  };
};
