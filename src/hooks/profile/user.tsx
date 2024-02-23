import { useNavigation } from '@react-navigation/native';
import { useCallback, useContext, useEffect, useState } from 'react';

import { NetworkContext } from '../../NetworkProvider';
import { profileAuthToken, profileFirstLogin, profileUserData } from '../../helpers';
import { ScreenName } from '../../types';

export const useProfileUser = (): {
  refresh: () => Promise<void>;
  isLoading: boolean;
  isError: boolean;
  isLoggedIn: boolean;
  currentUserId: string | null;
  isFirstLogin: boolean;
} => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  const logInCallback = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const storedProfileAuthToken = await profileAuthToken();
      const { currentUserId: userId } = await profileUserData();
      const { isFirstLogin } = await profileFirstLogin();

      setIsLoggedIn(!!storedProfileAuthToken);
      setCurrentUserId(userId);
      setIsFirstLogin(!!isFirstLogin);
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

  return {
    refresh: logInCallback,
    isLoading,
    isError,
    isLoggedIn,
    currentUserId,
    isFirstLogin
  };
};

export const useProfileNavigation = () => {
  const navigation = useNavigation();
  const { isLoggedIn } = useProfileUser();

  return useCallback(
    (action: () => void) => {
      if (!isLoggedIn) {
        navigation.navigate(ScreenName.ProfileLogin);
      } else {
        action();
      }
    },
    [navigation, isLoggedIn]
  );
};
