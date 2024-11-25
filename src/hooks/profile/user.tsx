import { useNavigation } from '@react-navigation/native';
import { useCallback, useContext, useEffect, useState } from 'react';

import { NetworkContext } from '../../NetworkProvider';
import { profileAuthToken, profileUserData } from '../../helpers';
import { ProfileMember, ScreenName } from '../../types';

export const useProfileUser = (): {
  currentUserData: ProfileMember | null;
  isError: boolean;
  isLoading: boolean;
  isLoggedIn: boolean;
  refresh: () => Promise<void>;
} => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<ProfileMember | null>(null);

  const logInCallback = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const storedProfileAuthToken = await profileAuthToken();
      const { currentUserData: userData } = await profileUserData();

      setIsLoggedIn(!!storedProfileAuthToken);
      setCurrentUserData(userData);
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
    currentUserData,
    isError,
    isLoading,
    isLoggedIn,
    refresh: logInCallback
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
