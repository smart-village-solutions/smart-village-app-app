import { ScreenName } from '../../../types';

export const myProfile = () => [
  {
    id: 1,
    title: 'Persönliche Daten',
    onPress: (navigation) => navigation?.navigate(ScreenName.VolunteerMe)
  }
  // {
  //   id: 2,
  //   title: 'Einstellungen'
  // },
  // {
  //   id: 3,
  //   title: 'Gespeichert'
  // }
];
