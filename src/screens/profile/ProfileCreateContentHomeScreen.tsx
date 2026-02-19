import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';

import { LoginModal, SafeAreaViewFlex, ServiceTiles } from '../../components';
import { texts } from '../../config';

export const ProfileCreateContentHomeScreen = ({ navigation }: StackScreenProps<any>) => {
  return (
    <SafeAreaViewFlex>
      <ServiceTiles
        staticJsonName="profileCreateContentService"
        title={texts.profile.createContentTitle}
      />

      <LoginModal publicJsonFile="loginModal" navigation={navigation} />
    </SafeAreaViewFlex>
  );
};
