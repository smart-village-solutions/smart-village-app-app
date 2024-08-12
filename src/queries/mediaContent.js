import * as SecureStore from 'expo-secure-store';

import { namespace, secrets } from '../config';

export const uploadMediaContent = async (image, contentType) => {
  const formData = new FormData();
  formData.append('media_content[content_type]', contentType);
  formData.append('media_content[attachment]', {
    uri: image.uri,
    type: 'image/jpg',
    name: 'image.jpg'
  });

  // get the authentication token from local SecureStore if it exists
  const accessToken = await SecureStore.getItemAsync('ACCESS_TOKEN');

  const response = await fetch(secrets[namespace].serverUrl + '/media_contents', {
    method: 'POST',
    headers: {
      authorization: accessToken ? `Bearer ${accessToken}` : ''
    },
    body: formData
  });

  const json = await response.json();
  const status = response.status;
  const ok = response.ok;

  if (ok && status === 201 && typeof json?.service_url === 'string') {
    return json.service_url;
  }

  return;
};

export const deleteMediaContent = async (mediaContentId) => {
  // get the authentication token from local SecureStore if it exists
  const accessToken = await SecureStore.getItemAsync('ACCESS_TOKEN');

  const response = await fetch(
    secrets[namespace].serverUrl + `/media_contents/${mediaContentId}.json`,
    {
      method: 'DELETE',
      headers: {
        authorization: accessToken ? `Bearer ${accessToken}` : ''
      }
    }
  );

  const status = response.status;
  const ok = response.ok;

  return ok && status === 204;
};
