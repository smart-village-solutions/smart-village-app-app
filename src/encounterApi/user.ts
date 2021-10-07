import { encounterApi } from '../config';
import appJson from '../../app.json';
import { CreateUserData, UpdateUserData, User } from '../types';
import { parseUser } from '../jsonValidation';

const url = encounterApi.serverUrl + encounterApi.version + encounterApi.user;

export const createUserAsync = async (userData: CreateUserData): Promise<string | undefined> => {
  const body = JSON.stringify({
    app_origin: appJson.expo.slug,
    birth_date: userData.birthDate,
    first_name: userData.firstName,
    image_uri: 'https://www.smurf.com/characters-smurfs/papa.png', // TODO: handle image upload
    last_name: userData.lastName,
    phone: userData.phone
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

export const updateUserAsync = async (userData: UpdateUserData): Promise<string | undefined> => {
  const body = JSON.stringify({
    app_origin: appJson.expo.slug,
    birth_date: userData.birthDate,
    first_name: userData.firstName,
    image_uri:
      userData.firstName === 'Tina'
        ? 'https://www.smurf.com/characters-smurfs/smurfette.png'
        : 'https://www.smurf.com/characters-smurfs/papa.png', // TODO: handle image upload
    last_name: userData.lastName,
    phone: userData.phone,
    user_id: userData.userId
  });

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body
  });

  const json = await response.json();
  const status = response.status;
  const ok = response.ok;

  if (ok && status === 200 && typeof json?.user_id === 'string') {
    return json.user_id;
  }

  return;
};

export const getUserAsync = async (userId: string): Promise<User | undefined> => {
  const response = await fetch(`${url}?user_id=${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const json = await response.json();
  const status = response.status;
  const ok = response.ok;

  if (ok && status === 200) {
    const user = parseUser(json);

    if (!user) {
      return;
    }

    return user;
  }
};
