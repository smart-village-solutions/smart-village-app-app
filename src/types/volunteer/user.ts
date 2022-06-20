export type VolunteerUser = {
  display_name: string;
  guid: string;
  id: number;
};

export type VolunteerRegistration = {
  username: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  dataPrivacyCheck: boolean;
};

export type VolunteerSignup = {
  email: string;
  token: string;
};

export type VolunteerLogin = {
  username: string;
  password: string;
};
