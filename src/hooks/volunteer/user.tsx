import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { normalize } from 'react-native-elements';

import { WrapperRow } from '../../components/Wrapper';
import { colors, consts, Icon } from '../../config';
import {
  storeVolunteerAuthToken,
  storeVolunteerUserData,
  volunteerAuthToken,
  volunteerUserData
} from '../../helpers/volunteerHelper';
import { NetworkContext } from '../../NetworkProvider';
import { QUERY_TYPES } from '../../queries';
import { ScreenName } from '../../types';

export const useVolunteerUser = (): {
  refresh: () => Promise<void>;
  isLoading: boolean;
  isError: boolean;
  isLoggedIn: boolean;
  currentUserId: string | null;
  contentContainerId: string | null;
} => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [contentContainerId, setContentContainerId] = useState<string | null>(null);

  const logInCallback = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const storedVolunteerAuthToken = await volunteerAuthToken();
      const {
        currentUserId: userId,
        contentContainerId: userContentContainerId
      } = await volunteerUserData();

      setIsLoggedIn(!!storedVolunteerAuthToken);
      setCurrentUserId(userId);
      setContentContainerId(userContentContainerId);
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
    contentContainerId
  };
};

export const useLogoutHeader = ({ query, navigation }: any) => {
  useEffect(() => {
    if (query !== QUERY_TYPES.VOLUNTEER.PROFILE) return;

    navigation.setOptions({
      headerRight: () => (
        <WrapperRow style={styles.headerRight}>
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                'Abmelden',
                'Bist du sicher, dass du dich abmelden möchtest?',
                [
                  {
                    text: 'Abbrechen'
                  },
                  {
                    text: 'Ja, abmelden',
                    style: 'destructive',
                    onPress: async () => {
                      await storeVolunteerAuthToken();
                      await storeVolunteerUserData();
                      navigation?.navigate(ScreenName.VolunteerHome, {
                        refreshUser: new Date().valueOf()
                      });
                    }
                  }
                ],
                { cancelable: false }
              )
            }
            accessibilityLabel={consts.a11yLabel.shareIcon}
            accessibilityHint={consts.a11yLabel.shareHint}
          >
            <Icon.VolunteerLogout color={colors.lightestText} style={styles.icon} />
          </TouchableOpacity>
        </WrapperRow>
      )
    });
  }, [query, navigation]);
};

const styles = StyleSheet.create({
  headerRight: {
    alignItems: 'center',
    paddingRight: normalize(7)
  },
  icon: {
    paddingHorizontal: normalize(10)
  }
});
