import PropTypes from 'prop-types';
import { useCallback, useContext, useEffect, useState } from 'react';

import { getConsulAuthToken } from '../../helpers';
import { NetworkContext } from '../../NetworkProvider';

export const useConsulUser = () => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const logInCallback = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const storedConsulAuthToken = await getConsulAuthToken();
      setIsLoggedIn(!!storedConsulAuthToken);
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

  return { refresh: logInCallback, isLoading, isLoggedIn, isError };
};

useConsulUser.propTypes = {
  refresh: PropTypes.func
};
