import { encounterApi } from '../config';
import appJson from '../../app.json';
import { CreateUserData, UpdateUserData, User } from '../types';
import { parseUser } from '../jsonValidation';

const url = encounterApi.serverUrl + encounterApi.version + encounterApi.user;

export const createUserAsync = async (userData: CreateUserData): Promise<string | undefined> => {
  // https://stackoverflow.com/a/40782729
  const body = new FormData();

  body.append('app_origin', appJson.expo.slug);
  body.append('birth_date', userData.birthDate);
  body.append('first_name', userData.firstName);
  body.append('image', {
    // @ts-expect-error FormData types are not correct in our setting
    uri: userData.imageUri,
    type: 'image/jpg',
    name: 'image.jpg'
  });
  body.append('last_name', userData.lastName);
  body.append('phone', userData.phone);

  const response = await fetch(url, {
    method: 'POST',
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
  // https://stackoverflow.com/a/40782729
  const body = new FormData();

  body.append('app_origin', appJson.expo.slug);
  body.append('birth_date', userData.birthDate);
  body.append('first_name', userData.firstName);
  body.append('last_name', userData.lastName);
  body.append('phone', userData.phone);
  body.append('user_id', userData.userId);

  // only update if we have a new image
  if (userData.imageUri) {
    body.append('image', {
      // @ts-expect-error FormData types are not correct in our setting
      uri: userData.imageUri,
      type: 'image/jpg',
      name: 'image.jpg'
    });
  }

  const response = await fetch(url, {
    method: 'PUT',
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
