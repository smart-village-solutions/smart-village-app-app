export type ProfileMember = {
  member: {
    authentication_token_created_at: string;
    authentication_token: string;
    created_at: string;
    email: string;
    id: number;
    keycloak_access_token_expires_at: string;
    keycloak_access_token: string;
    keycloak_id: string;
    keycloak_refresh_token_expires_at: string;
    keycloak_refresh_token: string;
    municipality_id: number;
    preferences: {
      [key: string]: string;
    };
    updated_at: string;
  };
  success: boolean;
};

export type ProfileRegistration = {
  email: string;
  password: string;
  passwordConfirmation: string;
  dataPrivacyCheck: boolean;
};

export type ProfileLogin = {
  email: string;
  password: string;
};

export type ProfileResetPassword = {
  email: string;
};

export type ProfileUpdate = {
  birthday: string;
  firstName: string;
  gender: string;
  lastName: string;
};
