import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { profileAuthToken, profileUserData } from './helpers';
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
        isLoading,
        isLoggedIn,
        refresh: logInCallback
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileContext = () => useContext(ProfileContext);
