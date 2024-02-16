import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useState } from 'react';
import { Alert, RefreshControl, ScrollView } from 'react-native';
import { Divider } from 'react-native-elements';
import { useQuery } from 'react-query';

import { NetworkContext } from '../../NetworkProvider';
import {
  LoadingSpinner,
  SafeAreaViewFlex,
  TextListItem,
  VolunteerAvatar,
  Wrapper
} from '../../components';
import { colors, texts } from '../../config';
import { storeProfileAuthToken } from '../../helpers';
import { QUERY_TYPES } from '../../queries';
import { member } from '../../queries/profile';
import { ProfileMember, ScreenName } from '../../types';

export const ProfileScreen = ({ navigation }: StackScreenProps<any, string>) => {
  const [refreshing, setRefreshing] = useState(false);
  const { isConnected } = useContext(NetworkContext);

  const { isLoading, data, refetch } = useQuery(QUERY_TYPES.PROFILE.MEMBER, member, {
    onSuccess: (responseData: ProfileMember) => {
      if (!responseData?.member) {
        storeProfileAuthToken();
        Alert.alert(texts.profile.signInAgainTitle, texts.profile.signInAgainBody, [
          {
            text: texts.profile.ok,
            onPress: () =>
              navigation.navigate(ScreenName.Profile, { refreshUser: new Date().valueOf() })
          }
        ]);
        return;
      }
    }
  });

  const refreshHome = useCallback(async () => {
    setRefreshing(true);
    isConnected && (await refetch());
    setRefreshing(false);
  }, [isConnected, refetch]);

  if (isLoading) {
    return <LoadingSpinner loading />;
  }

  if (!data?.member) return null;

  const {
    member: { email = '' }
  } = data;

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
              leftIcon: <VolunteerAvatar item={{ user: { display_name: email } }} />,
              routeName: ScreenName.ProfileUpdate,
              title: email
            }}
            navigation={navigation}
            navigate={() => navigation.navigate(ScreenName.ProfileUpdate)}
          />
        </Wrapper>

        <Divider />
      </ScrollView>
    </SafeAreaViewFlex>
  );
};
