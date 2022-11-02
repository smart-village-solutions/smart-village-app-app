import { useNavigation } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { HeaderRight } from '../../components';
import { consts, texts } from '../../config';
import { navigatorConfig } from '../../config/navigation';
import { volunteerAuthToken, volunteerUserData } from '../../helpers/volunteerHelper';
import { NetworkContext } from '../../NetworkProvider';
import { QUERY_TYPES } from '../../queries';
import { ScreenName } from '../../types';

const { ROOT_ROUTE_NAMES } = consts;

export const useVolunteerUser = (): {
  refresh: () => Promise<void>;
  isLoading: boolean;
  isError: boolean;
  isLoggedIn: boolean;
  currentUserId: string | null;
  currentUserGuId: string | null;
  currentUserContentContainerId: string | null;
} => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserGuId, setCurrentUserGuId] = useState<string | null>(null);
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
        currentUserGuId: userGuId,
        currentUserContentContainerId: userContentContainerId
      } = await volunteerUserData();

      setIsLoggedIn(!!storedVolunteerAuthToken);
      setCurrentUserId(userId);
      setCurrentUserGuId(userGuId);
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
    currentUserGuId,
    currentUserContentContainerId
  };
};

export const useConversationsHeader = ({
  query,
  navigation,
  route
}: { query: string } & StackScreenProps<any>) => {
  useEffect(() => {
    if (query !== QUERY_TYPES.VOLUNTEER.CONVERSATIONS) return;

    navigation.setOptions({
      headerRight: () => (
        <HeaderRight
          {...{
            navigation,
            onPress: () =>
              navigation.navigate({
                name: ScreenName.VolunteerForm,
                params: {
                  title: texts.volunteer.conversationStart,
                  query: QUERY_TYPES.VOLUNTEER.CONVERSATION,
                  rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
                }
              }),
            route,
            withChat: true,
            withDrawer: navigatorConfig.type === 'drawer'
          }}
        />
      )
    });
  }, [query, navigation]);
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
