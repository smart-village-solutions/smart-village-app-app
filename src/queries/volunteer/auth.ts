import { secrets } from '../../config';
import * as appJson from '../../../app.json';
import { volunteerAuthToken } from '../../helpers';

const namespace = appJson.expo.slug as keyof typeof secrets;
const serverUrl = secrets[namespace]?.volunteer?.serverUrl + secrets[namespace]?.volunteer?.version;

export const logInMutation = async ({
  username,
  password
}: {
  username: string;
  password: string;
}) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);

  const fetchObj = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: formData
  };

  return (await fetch(`${serverUrl}auth/login`, fetchObj)).json();
};

export const registerMutation = async ({
  username,
  email,
  password,
  passwordConfirmation
}: {
  username: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('email', email);
  formData.append('password', password);
  formData.append('passwordConfirmation', passwordConfirmation);

  const fetchObj = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: formData
  };

  return (await fetch(`${serverUrl}register`, fetchObj)).json();
};

// TODO: possible and needed?
export const logOutMutation = async () => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return await fetch(`${serverUrl}auth/logout`, fetchObj);
};

export const meMutation = async () => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return (await fetch(`${serverUrl}auth/current`, fetchObj)).json();
};
