import { StackScreenProps } from '@react-navigation/stack';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useMutation } from 'react-query';

import { storeVolunteerAuthToken, storeVolunteerUserData } from '../../helpers';
import { deletePushToken } from '../../queries/volunteer';
import { ScreenName } from '../../types';

export const VolunteerLogoutScreen = ({ navigation }: StackScreenProps<any>) => {
  const { mutateAsync: mutateDeletePushToken } = useMutation(deletePushToken);

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
              // delete push token from user data in volunteer instance
              await mutateDeletePushToken();

              // remove stored tokens on device
              await storeVolunteerAuthToken();
              await storeVolunteerUserData();

              navigation.navigate(ScreenName.VolunteerHome, {
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
