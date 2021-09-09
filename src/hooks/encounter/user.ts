// TODO: implement api call / storage handling

export const useEncounterUser = () => {
  return {
    loading: false,
    firstName: 'Max',
    lastName: 'Mustermann',
    verified: false,
    phone: '0123 123123',
    birthDate: new Date(42),
    village: 'Utopia',
    createdAt: new Date(1337)
  };
};
