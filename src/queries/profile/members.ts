import * as appJson from '../../../app.json';
import { secrets } from '../../config';
import { profileAuthToken } from '../../helpers';
import { ProfileRegistration, ProfileResetPassword, ProfileUpdate } from '../../types';

const namespace = appJson.expo.slug as keyof typeof secrets;
const serverUrl = secrets[namespace]?.serverUrl;

export const profileLogIn = async (
  member: { email: string; password: string } | { key: string; secret: string }
) => {
  const formData = {
    member
  };

  const fetchObj = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  };

  return (await fetch(`${serverUrl}/members/sign_in`, fetchObj)).json();
};

export const profileRegister = async ({
  email,
  password,
  passwordConfirmation
}: ProfileRegistration) => {
  const formData = {
    member: {
      email,
      password,
      password_confirmation: passwordConfirmation
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

  return (await fetch(`${serverUrl}/members`, fetchObj)).json();
};

export const profileUpdate = async ({
  birthday,
  city,
  firstName,
  gender,
  lastName,
  postcode,
  street
}: ProfileUpdate) => {
  const authToken = await profileAuthToken();

  const formData = {
    member: {
      birthday,
      city,
      first_name: firstName,
      gender,
      last_name: lastName,
      postal_code: postcode,
      street
    }
  };

  const fetchObj = {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    },
    body: JSON.stringify(formData)
  };

  return (await fetch(`${serverUrl}/members`, fetchObj)).json();
};

export const profileResetPassword = async ({ email }: ProfileResetPassword) => {
  const formData = {
    member: {
      email
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

  return (await fetch(`${serverUrl}/members/password`, fetchObj)).json();
};

export const profileEditPassword = async ({
  password,
  passwordConfirmation
}: {
  password: string;
  passwordConfirmation: string;
}) => {
  const authToken = await profileAuthToken();

  const formData = {
    member: {
      password,
      password_confirmation: passwordConfirmation
    }
  };

  const fetchObj = {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    },
    body: JSON.stringify(formData)
  };

  return (await fetch(`${serverUrl}/members`, fetchObj)).json();
};

export const profileEditMail = async ({ email }: { email: string }) => {
  const authToken = await profileAuthToken();

  const formData = {
    member: {
      email
    }
  };

  const fetchObj = {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    },
    body: JSON.stringify(formData)
  };

  return (await fetch(`${serverUrl}/members`, fetchObj)).json();
};

export const member = async () => {
  const authToken = await profileAuthToken();

  const fetchObj = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return (await fetch(`${serverUrl}/member`, fetchObj)).json();
};
