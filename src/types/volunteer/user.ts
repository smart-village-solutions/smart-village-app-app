export type VolunteerUser = {
  about: string;
  birthday: string | Date;
  birthdayHideYear: boolean;
  city: string;
  country: string;
  display_name: string;
  email: string;
  facebook: string;
  fax: string;
  firstName: string;
  flickr: string;
  gender: number;
  guid: string;
  id: number;
  lastName: string;
  linkedin: string;
  mySpace: string;
  phoneMobile: string;
  phonePrivate: string;
  phoneWork: string;
  postalCode: string;
  skype: string;
  state: string;
  street: string;
  title: string;
  twitter: string;
  username: string;
  vimeo: string;
  website: string;
  xing: string;
  xmpp: string;
  youtube: string;
};

export type VolunteerRegistration = {
  username: string;
  email: string;
  firstname: string;
  group: string;
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
