import { Alert } from 'react-native';

import { storeVolunteerAuthToken } from '../../volunteerHelper';
import { ScreenName } from '../../../types';

export const myProfile = () => [
  {
    id: 1,
    title: 'Persönliche Daten'
  },
  {
    id: 2,
    title: 'Einstellungen'
  },
  {
    id: 3,
    title: 'Logout',
    onPress: async (navigation) => {
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
              navigation?.navigate(ScreenName.VolunteerHome, {
                refreshUser: new Date().valueOf()
              });
            }
          }
        ],
        { cancelable: false }
      );
    }
  }
];
