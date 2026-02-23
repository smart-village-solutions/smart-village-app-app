import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';

import { SafeAreaViewFlex, ServiceTiles } from '../../components';
import { texts } from '../../config';
import { profileAuthToken } from '../../helpers';
import { useProfileContext } from '../../ProfileProvider';

import { ProfileHomeScreen } from './ProfileHomeScreen';

export const ProfileCreateContentHomeScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const { refresh, isLoading, isLoggedIn } = useProfileContext();

  const [isProfileLoggedIn, setIsProfileLoggedIn] = useState(isLoggedIn);

  useFocusEffect(
    useCallback(() => {
      const getLoginStatus = async () => {
        const storedProfileAuthToken = await profileAuthToken();

        setIsProfileLoggedIn(!!storedProfileAuthToken);
      };

      getLoginStatus();
    }, [route.params?.refreshUser])
  );

  if (!isProfileLoggedIn || !isLoggedIn) {
    return <ProfileHomeScreen navigation={navigation} route={route} />;
  }

  return (
    <SafeAreaViewFlex>
      <ServiceTiles
        staticJsonName="profileCreateContentService"
        title={texts.profile.createContentTitle}
      />
    </SafeAreaViewFlex>
  );
};
