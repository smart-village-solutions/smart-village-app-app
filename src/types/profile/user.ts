export type ProfileMember = {
  member: {
    authentication_token_created_at: string;
    authentication_token: string;
    created_at: string;
    email: string;
    first_name: string;
    id: number;
    keycloak_access_token_expires_at: string;
    keycloak_access_token: string;
    keycloak_id: string;
    keycloak_refresh_token_expires_at: string;
    keycloak_refresh_token: string;
    last_name: string;
    municipality_id: number;
    preferences: {
      [key: string]: string;
    };
    updated_at: string;
  };
  roles: ProfileRoles;
  success: boolean;
};

export type ProfileRoles = {
  role_construction_site: boolean;
  role_deadlines: boolean;
  role_defect_report: boolean;
  role_encounter_support: boolean;
  role_event_record: boolean;
  role_job: boolean;
  role_lunch: boolean;
  role_news_item: boolean;
  role_noticeboard: boolean;
  role_offer: boolean;
  role_point_of_interest: boolean;
  role_push_notification: boolean;
  role_static_contents: boolean;
  role_survey: boolean;
  role_tour_stops: boolean;
  role_tour: boolean;
  role_voucher: boolean;
  role_waste_calendar: boolean;
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
  city: string;
  firstName: string;
  gender: string;
  lastName: string;
  postcode: string;
  street: string;
};

export type ProfileEditMail = {
  email: string;
  emailConfirmation: string;
};

export type ProfileEditPassword = {
  password: string;
  passwordConfirmation: string;
};
