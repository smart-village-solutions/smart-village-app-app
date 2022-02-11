import { storeVolunteerAuthToken } from '../..';
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
      await storeVolunteerAuthToken();
      navigation &&
        navigation.navigate(ScreenName.VolunteerHome, { refreshUser: new Date().valueOf() });
    }
  }
];
