import { User } from '../../types';

// TODO: implement api call / storage handling
export const useEncounterUser = (): User & { loading: boolean } => {
  return {
    loading: false,
    userId: 'userId',
    firstName: 'Max',
    imageUri: 'https://smart-village.solutions/wp-content/uploads/2020/01/Services.png',
    lastName: 'Mustermann',
    verified: false,
    phone: '0123 123123',
    birthDate: new Date(42).toISOString(),
    village: 'Utopia',
    createdAt: new Date(1337).toISOString()
  };
};
