export type CreateUserData = {
  birthDate: string;
  firstName: string;
  imageUri: string;
  lastName: string;
  phone: string;
};

export type UpdateUserData = Omit<CreateUserData, 'imageUri'> & {
  imageUri?: string;
  userId: string;
};

export type User = {
  birthDate: string;
  firstName: string;
  imageUri: string;
  lastName: string;
  phone: string;
  verified: boolean;
};
