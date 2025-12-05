import { useCallback, useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';
import { useMutation as RQuseMutation } from 'react-query';

import { NetworkContext } from '../NetworkProvider';
import { addToStore, readFromStore } from '../helpers';
import {
  storeVoucherAuthToken,
  storeVoucherMemberId,
  storeVoucherMemberLoginInfo,
  VOUCHER_TRANSACTIONS,
  voucherAuthKey,
  voucherAuthToken,
  voucherMemberId
} from '../helpers/voucherHelper';
import { profileLogIn } from '../queries/profile';
import { REDEEM_QUOTA_OF_VOUCHER } from '../queries/vouchers';

export const useVoucher = (): {
  autoLogin: () => Promise<void>;
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

  const { mutateAsync: mutateLogIn } = RQuseMutation(profileLogIn);

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

  const autoLogin = useCallback(async () => {
    const key = await voucherAuthKey();
    const result = await mutateLogIn({ key, secret: '-' });

    if (!result?.member) {
      storeVoucherAuthToken();
      storeVoucherMemberId();
      storeVoucherMemberLoginInfo();
      logInCallback();
      return;
    }

    storeVoucherAuthToken(result.member.authentication_token);
    storeVoucherMemberId(result.member.id);
    storeVoucherMemberLoginInfo(JSON.stringify({ key, secret: '-' }));
    logInCallback();
  }, [mutateLogIn]);

  useEffect(() => {
    isConnected && autoLogin();
  }, [isConnected, autoLogin]);

  return {
    autoLogin,
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
  }, [redeemQuotaOfVoucher]);

  useEffect(() => {
    if (isConnected) {
      redeemLocalVouchers();
    }
  }, [isConnected, redeemLocalVouchers]);
};
