import { File } from 'expo-file-system';

import { encounterApi } from '../config';
import appJson from '../../app.json';
import { CreateUserData, UpdateUserData, User } from '../types';
import { parseUser } from '../jsonValidation';
import { imageUploadMetadata } from '../helpers/imageUploadMetadata';

const url = encounterApi.serverUrl + encounterApi.version + encounterApi.user;

const appendImage = (body: FormData, uri: string) => {
  const image = imageUploadMetadata(uri);
  const file = new File(uri);

  body.append('image', {
    name: image.fileName,
    type: image.mimeType,
    bytes: () => file.bytes()
  } as unknown as Blob);
};

export const createUserAsync = async (userData: CreateUserData): Promise<string | undefined> => {
  // https://stackoverflow.com/a/40782729
  const body = new FormData();

  body.append('app_origin', appJson.expo.slug);
  body.append('birth_date', userData.birthDate);
  body.append('first_name', userData.firstName);
  body.append('last_name', userData.lastName);
  body.append('phone', userData.phone);

  appendImage(body, userData.imageUri);

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
    appendImage(body, userData.imageUri);
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
