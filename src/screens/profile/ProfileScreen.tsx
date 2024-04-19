import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useState } from 'react';
import { Alert, RefreshControl, ScrollView } from 'react-native';
import { Divider } from 'react-native-elements';
import { useQuery } from 'react-query';

import { NetworkContext } from '../../NetworkProvider';
import {
  Button,
  LoadingSpinner,
  SafeAreaViewFlex,
  ServiceTiles,
  TextListItem,
  VolunteerAvatar,
  Wrapper
} from '../../components';
import { colors, texts } from '../../config';
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
      if (!responseData?.member) {
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
              routeName: ScreenName.ProfileUpdate,
              onPress: () => navigation.navigate(ScreenName.ProfileUpdate, { member: data.member }),
              title: displayName
            }}
            navigation={navigation}
          />
        </Wrapper>

        <Divider />

        <ServiceTiles staticJsonName="profileService" />
        <Wrapper>
          <Button
            title="Abmelden"
            onPress={() => {
              storeProfileAuthToken();
              navigation.navigate(ScreenName.Profile, { refreshUser: new Date().valueOf() });
            }}
          />
        </Wrapper>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};
