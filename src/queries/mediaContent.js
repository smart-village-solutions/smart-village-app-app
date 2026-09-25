import * as SecureStore from 'expo-secure-store';
import { File } from 'expo-file-system';

import { consts, namespace, secrets } from '../config';
import { imageUploadMetadata } from '../helpers/imageUploadMetadata';

const { MEDIA_TYPES } = consts;

export const uploadMediaContent = async (
  content,
  contentType,
  contentName = 'image',
  type = 'jpg'
) => {
  const uri = content.uri || content.cachedAttachment;
  const image = imageUploadMetadata(uri, content.mimeType);
  const formData = new FormData();
  formData.append('media_content[content_type]', contentType);
  const mimeType = type === MEDIA_TYPES.DOCUMENT ? 'application/pdf' : image.mimeType;
  const fileName = type === MEDIA_TYPES.DOCUMENT ? `${contentName}.${type}` : image.fileName;
  const file = new File(uri);
  // Expo's fetch reads file parts through bytes(); URI parts and File.slice() fail on iOS.
  formData.append('media_content[attachment]', {
    name: fileName,
    type: mimeType,
    bytes: () => file.bytes()
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

  let json;
  try {
    json = await response.json();
  } catch {
    throw new Error(`Media upload HTTP ${response.status}: invalid JSON response`);
  }

  if (!response.ok || response.status !== 201) {
    throw new Error(`Media upload HTTP ${response.status}`);
  }

  if (typeof json?.service_url !== 'string') {
    throw new Error('Media upload response missing service_url');
  }

  return json.service_url;
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

  return response.ok && response.status === 204;
};
