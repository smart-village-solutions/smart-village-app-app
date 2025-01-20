import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useQuery } from 'react-query';

import {
  profileAuthToken,
  profileUserData,
  storeProfileAuthToken,
  storeProfileUserData
} from './helpers';
import { useHomeRefresh } from './hooks';
import { QUERY_TYPES } from './queries';
import { member } from './queries/profile';
import { ProfileMember } from './types';

const defaultProfile = {
  currentUserData: null as ProfileMember | null,
  isError: false,
  isLoading: true,
  isLoggedIn: false,
  refresh: () => {}
};

export const ProfileContext = createContext(defaultProfile);

export const ProfileProvider = ({ children }: { children?: React.ReactNode }) => {
  const [currentUserData, setCurrentUserData] = useState<ProfileMember | null>(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const { isLoading: isLoadingMember } = useQuery(QUERY_TYPES.PROFILE.MEMBER, member, {
    onSuccess: (responseData: ProfileMember) => {
      if (!responseData?.member || !responseData?.member?.keycloak_refresh_token) {
        storeProfileAuthToken();
        setIsLoggedIn(false);
        setCurrentUserData(null);

        return;
      }

      storeProfileUserData(responseData);
    }
  });

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

  useHomeRefresh(logInCallback);

  useEffect(() => {
    if (!isLoggedIn) {
      logInCallback();
    } else {
      setIsError(true);
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  return (
    <ProfileContext.Provider
      value={{
        currentUserData,
        isError,
        isLoading: isLoading || isLoadingMember,
        isLoggedIn,
        refresh: logInCallback
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileContext = () => useContext(ProfileContext);
