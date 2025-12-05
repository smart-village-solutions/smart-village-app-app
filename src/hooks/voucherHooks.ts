import { useCallback, useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';

import { NetworkContext } from '../NetworkProvider';
import { addToStore, readFromStore } from '../helpers';
import { VOUCHER_TRANSACTIONS, voucherAuthToken, voucherMemberId } from '../helpers/voucherHelper';
import { REDEEM_QUOTA_OF_VOUCHER } from '../queries/vouchers';

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

export const useRedeemLocalVouchers = () => {
  const { isConnected } = useContext(NetworkContext);

  const [redeemQuotaOfVoucher] = useMutation(REDEEM_QUOTA_OF_VOUCHER);

  const redeemLocalVouchers = useCallback(async () => {
    try {
      const voucherTransactions = (await readFromStore(VOUCHER_TRANSACTIONS)) || [];
      let error = false;

      if (voucherTransactions.length) {
        for (const { voucherId, memberId, quantity, deviceToken } of voucherTransactions) {
          try {
            !!memberId &&
              (await redeemQuotaOfVoucher({
                variables: {
                  deviceToken,
                  quantity,
                  voucherId,
                  memberId
                }
              }));
          } catch (e) {
            console.error(e);
            error = true;
            break;
          }
        }

        if (!error) {
          await addToStore(VOUCHER_TRANSACTIONS, []);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (isConnected) {
      redeemLocalVouchers();
    }
  }, [isConnected, redeemLocalVouchers]);
};
