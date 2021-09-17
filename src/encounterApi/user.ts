import { encounterApi } from '../config';
import appJson from '../../app.json';
import { CreateUserData } from '../types';

const url = encounterApi.serverUrl + encounterApi.version + encounterApi.user;

export const createUserAsync = async (userData: CreateUserData): Promise<string | undefined> => {
  const body = JSON.stringify({
    first_name: userData.firstName,
    last_name: userData.lastName,
    phone: userData.phone,
    birth_date: userData.birthDate,
    image_uri: 'https://www.smurf.com/characters-smurfs/papa.png', // TODO: handle image upload
    app_origin: appJson.expo.slug
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body
  });

  const json = await response.json();
  const status = response.status;
  const ok = response.ok;

  if (ok && status === 201 && typeof json?.user_id === 'string') {
    return json.user_id;
  }

  return;
};

export const updateUserAsync = async () => {
  return;
};

export const showUserAsync = async () => {
  return;
};
