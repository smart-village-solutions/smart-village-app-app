import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { Divider } from 'react-native-elements';
import { useQuery } from 'react-query';

import {
  Button,
  LoadingSpinner,
  SafeAreaViewFlex,
  ServiceTiles,
  TextListItem,
  VolunteerAvatar,
  Wrapper
} from '../../components';
import { colors, normalize, texts } from '../../config';
import { storeProfileUserData, storeTokens } from '../../helpers';
import { NetworkContext } from '../../NetworkProvider';
import { useProfileContext } from '../../ProfileProvider';
import { QUERY_TYPES } from '../../queries';
import { member } from '../../queries/profile';
import { ProfileMember, ScreenName } from '../../types';
import { useMessagesContext } from '../../UnreadMessagesProvider';

import { ProfileUpdateScreen } from './ProfileUpdateScreen';

export const showLoginAgainAlert = ({ onPress }: { onPress: () => void }) =>
  Alert.alert(texts.profile.signInAgainTitle, texts.profile.signInAgainBody, [
    {
      text: texts.profile.ok,
      onPress
    }
  ]);

export const ProfileScreen = ({ navigation, route }: StackScreenProps<any, string>) => {
  const { refetch: refetchUnreadMessages, reset: resetUnreadMessages } = useMessagesContext();
  const { currentUserData } = useProfileContext();
  const { isConnected } = useContext(NetworkContext);
  const isProfileUpdated =
    !!Object.keys(currentUserData?.member?.preferences || {}).length &&
    !!currentUserData?.member?.first_name &&
    !!currentUserData?.member?.last_name;

  const { isLoading, data, refetch } = useQuery(QUERY_TYPES.PROFILE.MEMBER, member, {
    onSuccess: (responseData: ProfileMember) => {
      if (!responseData?.member || !responseData?.member?.keycloak_refresh_token) {
        storeTokens();

        showLoginAgainAlert({
          onPress: () =>
            navigation.navigate(ScreenName.Profile, { refreshUser: new Date().valueOf() })
        });

        return;
      }

      storeProfileUserData(responseData);
    }
  });

  const refreshHome = useCallback(async () => {
    if (isConnected) {
      await refetch();
      refetchUnreadMessages();
    }
  }, [isConnected, refetch, refetchUnreadMessages]);

  useFocusEffect(
    useCallback(() => {
      refreshHome();
    }, [refreshHome, route.params?.refreshUser])
  );

  if (isLoading) {
    return <LoadingSpinner loading />;
  }

  if (!data?.member) return null;

  if (!Object.keys(data.member.preferences).length) {
    return <ProfileUpdateScreen navigation={navigation} route={route} />;
  }

  const {
    member: { email = '', first_name: firstName = '', last_name: lastName = '' }
  } = data;

  const displayName = !!firstName && !!lastName ? `${firstName} ${lastName}` : email;

  return (
    <SafeAreaViewFlex>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refreshHome}
            colors={[colors.refreshControl]}
            tintColor={colors.refreshControl}
          />
        }
      >
        <Wrapper>
          <TextListItem
            item={{
              bottomDivider: false,
              leftIcon: <VolunteerAvatar item={{ user: { display_name: displayName } }} />,
              onPress: () =>
                navigation.navigate(ScreenName.ProfileSettings, {
                  email: email,
                  member: data.member
                }),
              title: displayName
            }}
            navigation={navigation}
          />
        </Wrapper>

        <Divider />

        <ServiceTiles staticJsonName="profileService" />

        <Divider />

        <Wrapper>
          <Button
            invert
            onPress={() => {
              resetUnreadMessages();
              storeTokens();
              storeProfileUserData();
              navigation.navigate(ScreenName.Profile, { refreshUser: new Date().valueOf() });
            }}
            title={texts.profile.logout}
          />
        </Wrapper>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  settingsContainer: {
    marginBottom: normalize(9),
    marginTop: normalize(9)
  }
});
