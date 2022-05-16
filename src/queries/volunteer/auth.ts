import { volunteerApiV1Url, volunteerAuthToken } from '../../helpers/volunteerHelper';

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

  return (await fetch(`${volunteerApiV1Url}register`, fetchObj)).json();
};

// TODO: possible and needed?
export const logOut = async () => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return await fetch(`${volunteerApiV1Url}auth/logout`, fetchObj);
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
