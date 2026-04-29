import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useQuery } from 'react-query';

import {
  profileAuthToken,
  profileUserData,
  storeProfileAuthToken,
  storeProfileUserData
} from './helpers';
import { useHomeRefresh } from './hooks';
import { NetworkContext } from './NetworkProvider';
import { QUERY_TYPES } from './queries';
import { member } from './queries/profile';
import { ProfileMember } from './types';

const defaultProfile = {
  currentUserData: null as ProfileMember | null,
  isError: false,
  isLoading: true,
  isLoggedIn: false,
  refresh: async () => {}
};

export const ProfileContext = createContext(defaultProfile);

export const ProfileProvider = ({ children }: { children?: React.ReactNode }) => {
  const { isConnected } = useContext(NetworkContext);
  const [currentUserData, setCurrentUserData] = useState<ProfileMember | null>(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const hasInitialized = useRef(false);
  const activeOperation = useRef<Promise<void> | null>(null);
  const pendingMemberSync = useRef(false);

  const clearProfileSession = useCallback(() => {
    storeProfileAuthToken();
    storeProfileUserData();
    setIsLoggedIn(false);
    setCurrentUserData(null);
    pendingMemberSync.current = false;
  }, []);

  const handleMemberResponse = useCallback(
    (responseData: ProfileMember) => {
      if (!responseData?.member || !responseData?.member?.keycloak_refresh_token) {
        clearProfileSession();

        return;
      }

      storeProfileUserData(responseData);
      setCurrentUserData(responseData);
      setIsError(false);
      setIsLoggedIn(true);
      pendingMemberSync.current = false;
    },
    [clearProfileSession]
  );

  const { refetch: refetchMember } = useQuery(QUERY_TYPES.PROFILE.MEMBER, member, {
    enabled: false
  });

  const refetchMemberWithRetryState = useCallback(async () => {
    const result = await refetchMember();

    if (result.isError) {
      pendingMemberSync.current = true;
      setIsError(true);
      throw result.error ?? new Error('Member refetch failed');
    }

    handleMemberResponse(result.data as ProfileMember);

    return result;
  }, [handleMemberResponse, refetchMember]);

  const runSerializedTask = useCallback((task: () => Promise<void>) => {
    const operation = (activeOperation.current ?? Promise.resolve())
      .catch((error) => {
        console.warn(error);
      })
      .then(task)
      .finally(() => {
        if (activeOperation.current === operation) {
          activeOperation.current = null;
        }
      });

    activeOperation.current = operation;

    return operation;
  }, []);

  const loadProfileState = useCallback(
    async ({
      scheduleMemberSync = false,
      syncMemberNow = false
    }: {
      scheduleMemberSync?: boolean;
      syncMemberNow?: boolean;
    } = {}) => {
      await runSerializedTask(async () => {
        setIsLoading(true);
        setIsError(false);

        try {
          const storedProfileAuthToken = await profileAuthToken();
          if (!storedProfileAuthToken) {
            clearProfileSession();

            return;
          }

          const { currentUserData: userData } = await profileUserData();

          setIsLoggedIn(true);
          setCurrentUserData(userData);

          pendingMemberSync.current =
            scheduleMemberSync && !syncMemberNow;

          if (syncMemberNow) {
            await refetchMemberWithRetryState();
          }
        } catch (e) {
          console.warn(e);
          setIsError(true);
        } finally {
          hasInitialized.current = true;
          setIsLoading(false);
        }
      });
    },
    [clearProfileSession, refetchMemberWithRetryState, runSerializedTask]
  );

  const logInCallback = useCallback(async () => {
    await loadProfileState({
      scheduleMemberSync: true,
      syncMemberNow: isConnected
    });
  }, [isConnected, loadProfileState]);

  const syncMemberCallback = useCallback(async ({ requirePendingSync = false } = {}) => {
    await runSerializedTask(async () => {
      try {
        if (requirePendingSync && !pendingMemberSync.current) {
          return;
        }

        const storedProfileAuthToken = await profileAuthToken();

        if (!storedProfileAuthToken) {
          clearProfileSession();

          return;
        }

        if (isConnected) {
          // Keep reconnect and home-triggered member syncs silent so background
          // authorization refreshes do not re-enter the global profile loading state.
          setIsError(false);
          await refetchMemberWithRetryState();
        } else {
          pendingMemberSync.current = true;
        }
      } catch (e) {
        console.warn(e);
        pendingMemberSync.current = true;
        setIsError(true);
      }
    });
  }, [clearProfileSession, isConnected, refetchMemberWithRetryState, runSerializedTask]);

  useHomeRefresh(syncMemberCallback);

  useEffect(() => {
    loadProfileState({ scheduleMemberSync: true });
  }, [loadProfileState]);

  useEffect(() => {
    if (!hasInitialized.current || !isConnected || !isLoggedIn) {
      return;
    }

    syncMemberCallback({ requirePendingSync: true });
  }, [isConnected, isLoggedIn, syncMemberCallback]);

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
