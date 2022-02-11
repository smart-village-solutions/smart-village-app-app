import { useCallback, useContext, useEffect, useState } from 'react';

import { volunteerAuthToken } from '../../helpers';
import { NetworkContext } from '../../NetworkProvider';

export const useVolunteerUser = (): {
  refresh: () => Promise<void>;
  isLoading: boolean;
  isError: boolean;
  isLoggedIn: boolean;
} => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const logInCallback = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const storedVolunteerAuthToken = await volunteerAuthToken();
      setIsLoggedIn(!!storedVolunteerAuthToken);
    } catch (e) {
      console.warn(e);
      setIsError(true);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isConnected && isMainserverUp && !isLoggedIn) {
      logInCallback();
    } else {
      setIsLoading(false);
      setIsError(true);
    }
  }, [isConnected, isMainserverUp, logInCallback]);

  return { refresh: logInCallback, isLoading, isError, isLoggedIn };
};
