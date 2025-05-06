import { useNavigation } from '@react-navigation/native';
import { useCallback, useContext, useEffect, useState } from 'react';

import { volunteerAuthToken, volunteerUserData } from '../../helpers/volunteerHelper';
import { NetworkContext } from '../../NetworkProvider';
import { ScreenName } from '../../types';

export const useVolunteerUser = (): {
  refresh: () => Promise<void>;
  isLoading: boolean;
  isError: boolean;
  isLoggedIn: boolean;
  currentUserId: string | null;
  currentUserGuid: string | null;
  currentUserContentContainerId: string | null;
} => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserGuid, setCurrentUserGuid] = useState<string | null>(null);
  const [currentUserContentContainerId, setCurrentUserContentContainerId] = useState<string | null>(
    null
  );

  const logInCallback = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const storedVolunteerAuthToken = await volunteerAuthToken();
      const {
        currentUserId: userId,
        currentUserGuid: userGuid,
        currentUserContentContainerId: userContentContainerId
      } = await volunteerUserData();

      setIsLoggedIn(!!storedVolunteerAuthToken);
      setCurrentUserId(userId);
      setCurrentUserGuid(userGuid);
      setCurrentUserContentContainerId(userContentContainerId);
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
    currentUserGuid,
    currentUserContentContainerId
  };
};

export const useVolunteerNavigation = () => {
  const navigation = useNavigation();
  const { isLoggedIn } = useVolunteerUser();

  return useCallback(
    (action) => {
      if (!isLoggedIn) {
        navigation.navigate(ScreenName.VolunteerLogin);
      } else {
        action();
      }
    },
    [navigation, isLoggedIn]
  );
};
