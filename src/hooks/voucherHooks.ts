import { useCallback, useContext, useEffect, useState } from 'react';

import { voucherAuthToken, voucherMemberId } from '../helpers/voucherHelper';
import { NetworkContext } from '../NetworkProvider';

export const useVoucher = (): {
  refresh: () => Promise<void>;
  isLoading: boolean;
  isError: boolean;
  isLoggedIn: boolean;
  memberId: string | undefined;
} => {
  const { isConnected } = useContext(NetworkContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [memberId, setMemberId] = useState<string>();

  const logInCallback = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const storedVoucherAuthToken = await voucherAuthToken();
      const storedVoucherMemberId = await voucherMemberId();

      setIsLoggedIn(!!storedVoucherAuthToken);
      setMemberId(storedVoucherMemberId);
    } catch (e) {
      console.warn(e);
      setIsError(true);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    logInCallback();
  }, [isConnected, logInCallback]);

  return {
    refresh: logInCallback,
    isLoading,
    isError,
    isLoggedIn,
    memberId
  };
};
