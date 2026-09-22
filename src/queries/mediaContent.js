import * as SecureStore from 'expo-secure-store';

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
  formData.append('media_content[attachment]', {
    uri,
    type: type === MEDIA_TYPES.DOCUMENT ? 'application/pdf' : image.mimeType,
    name: type === MEDIA_TYPES.DOCUMENT ? `${contentName}.${type}` : image.fileName
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

  if (response.ok && response.status === 201 && typeof json?.service_url === 'string') {
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

  return response.ok && response.status === 204;
};
