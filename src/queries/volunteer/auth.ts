import {
  volunteerApiV1Url,
  volunteerApiV2Url,
  volunteerAuthToken
} from '../../helpers/volunteerHelper';
import { VolunteerRegistration, VolunteerSignup } from '../../types';

export const logIn = async ({ username, password }: { username: string; password: string }) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);

  const fetchObj = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data'
    },
    body: formData
  };

  return (await fetch(`${volunteerApiV1Url}auth/login`, fetchObj)).json();
};

export const register = async ({
  username,
  email,
  group,
  firstname,
  password,
  passwordConfirmation,
  dataPrivacyCheck
}: VolunteerRegistration) => {
  const formData = {
    account: {
      username,
      email
    },
    profile: {
      firstname
    },
    password: {
      newPassword: password,
      newPasswordConfirm: passwordConfirmation
    },
    group,
    legal: {
      dataPrivacyCheck
    }
  };

  const fetchObj = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  };

  return (await fetch(`${volunteerApiV2Url}auth/register`, fetchObj)).json();
};

export const signup = async ({ email, token }: VolunteerSignup) => {
  const formData = {
    signup: {
      email,
      token
    }
  };

  const fetchObj = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  };

  return (await fetch(`${volunteerApiV2Url}auth/signup`, fetchObj)).json();
};

export const me = async () => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return (await fetch(`${volunteerApiV1Url}auth/current`, fetchObj)).json();
};
