import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { Alert, View } from 'react-native';

import { colors } from '../../config';
import { storeVolunteerAuthToken, storeVolunteerUserData } from '../../helpers';
import { ScreenName } from '../../types';

export const VolunteerLogoutScreen = ({ navigation }: StackScreenProps<any>) => {
  useEffect(
    () =>
      Alert.alert(
        'Abmelden',
        'Bist du sicher, dass du dich abmelden möchtest?',
        [
          {
            text: 'Abbrechen',
            onPress: async () => {
              navigation.goBack();
            }
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
      ),
    []
  );

  return null;
};
