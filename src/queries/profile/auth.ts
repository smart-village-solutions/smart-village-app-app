import * as appJson from '../../../app.json';
import { secrets } from '../../config';
import { ProfileRegistration } from '../../types';

const namespace = appJson.expo.slug as keyof typeof secrets;
const serverUrl = secrets[namespace]?.serverUrl;

export const profileLogIn = async ({ email, password }: { email: string; password: string }) => {
  const formData = {
    member: {
      email,
      password
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

  return (await fetch(`${serverUrl}/members/sign_in.json`, fetchObj)).json();
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

  return (await fetch(`${serverUrl}/members.json`, fetchObj)).json();
};
