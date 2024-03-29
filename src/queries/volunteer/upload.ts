import * as FileSystem from 'expo-file-system';

import { volunteerApiV1Url, volunteerAuthToken } from '../../helpers/volunteerHelper';

// https://docs.expo.io/versions/latest/sdk/filesystem/#filesystemuploadasyncurl-fileuri-options
export const uploadFile = async (uri: string, contentContainerId: number, folderId: number) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    },
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName: 'files',
    parameters: {
      folder_id: folderId
    },
    mimeType: 'png'
  };

  return await FileSystem.uploadAsync(
    `${volunteerApiV1Url}cfiles/files/container/${contentContainerId}`,
    uri,
    fetchObj
  );
};

export const deleteFile = async (id: number) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return await fetch(`${volunteerApiV1Url}/cfiles/file/${id}`, fetchObj);
};
