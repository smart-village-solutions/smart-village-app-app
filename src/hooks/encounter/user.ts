import { User } from '../../types';

const dummy = {
  loading: false,
  userId: 'userId',
  firstName: 'Max',
  imageUri: 'https://smart-village.solutions/wp-content/uploads/2020/01/Services.png',
  lastName: 'Mustermann',
  verified: false,
  phone: '0123 123123',
  birthDate: new Date('1999-12-10T23:00:00.000Z').toISOString(),
  appOrigin: 'Utopia',
  createdAt: new Date(1337).toISOString()
};

// TODO: implement api call / storage handling
export const useEncounterUser = (): User & { loading: boolean } => {
  return dummy;
};
