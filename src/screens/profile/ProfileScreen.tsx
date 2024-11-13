import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { Divider } from 'react-native-elements';
import { useQuery } from 'react-query';

import { NetworkContext } from '../../NetworkProvider';
import {
  Button,
  LoadingSpinner,
  SafeAreaViewFlex,
  SectionHeader,
  ServiceTiles,
  TextListItem,
  VolunteerAvatar,
  Wrapper,
  WrapperHorizontal
} from '../../components';
import { colors, normalize, texts } from '../../config';
import { storeProfileAuthToken, storeProfileUserData } from '../../helpers';
import { useProfileUser } from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import { member } from '../../queries/profile';
import { ProfileMember, ScreenName } from '../../types';

import { ProfileUpdateScreen } from './ProfileUpdateScreen';

export const showLoginAgainAlert = ({ onPress }: { onPress: () => void }) =>
  Alert.alert(texts.profile.signInAgainTitle, texts.profile.signInAgainBody, [
    {
      text: texts.profile.ok,
      onPress
    }
  ]);

export const ProfileScreen = ({ navigation, route }: StackScreenProps<any, string>) => {
  const { currentUserData } = useProfileUser();
  const [refreshing, setRefreshing] = useState(false);
  const { isConnected } = useContext(NetworkContext);
  const isProfileUpdated =
    !!Object.keys(currentUserData?.member?.preferences || {}).length &&
    !!currentUserData?.member?.first_name &&
    !!currentUserData?.member?.last_name;

  const { isLoading, data, refetch } = useQuery(QUERY_TYPES.PROFILE.MEMBER, member, {
    onSuccess: (responseData: ProfileMember) => {
      if (!responseData?.member || !responseData?.member?.keycloak_refresh_token) {
        storeProfileAuthToken();

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
    setRefreshing(true);
    isConnected && (await refetch());
    setRefreshing(false);
  }, [isConnected, refetch]);

  useFocusEffect(
    useCallback(() => {
      if (!isProfileUpdated) {
        refetch();
      }
    }, [isConnected, refetch, route.params?.refreshUser])
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
            refreshing={refreshing}
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
              title: displayName
            }}
          />
        </Wrapper>

        <Divider />

        <ServiceTiles staticJsonName="profileService" />

        <Divider />

        <SectionHeader
          big
          containerStyle={styles.settingsContainer}
          title={texts.profile.settings}
        />

        <WrapperHorizontal>
          <TextListItem
            item={{
              isHeadlineTitle: false,
              onPress: () => navigation.navigate(ScreenName.ProfileUpdate, { member: data.member }),
              routeName: ScreenName.ProfileUpdate,
              bottomDivider: true,
              topDivider: true,
              title: texts.profile.editProfile
            }}
            navigation={navigation}
            noSubtitle
          />

          <TextListItem
            item={{
              isHeadlineTitle: false,
              onPress: () =>
                navigation.navigate(ScreenName.ProfileEditMail, { email: data.member.email }),
              routeName: ScreenName.ProfileEditMail,
              bottomDivider: true,
              title: texts.profile.editMail
            }}
            navigation={navigation}
            noSubtitle
          />

          <TextListItem
            item={{
              bottomDivider: true,
              isHeadlineTitle: false,
              onPress: () => navigation.navigate(ScreenName.ProfileEditPassword),
              routeName: ScreenName.ProfileEditPassword,
              title: texts.profile.editPassword
            }}
            navigation={navigation}
            noSubtitle
          />

          <TextListItem
            item={{
              bottomDivider: true,
              isHeadlineTitle: false,
              onPress: () => navigation.navigate(ScreenName.ProfileDelete),
              routeName: ScreenName.ProfileDelete,
              title: texts.profile.deleteProfile
            }}
            navigation={navigation}
            noSubtitle
          />
        </WrapperHorizontal>

        <Wrapper>
          <Button
            invert
            onPress={() => {
              storeProfileAuthToken();
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
