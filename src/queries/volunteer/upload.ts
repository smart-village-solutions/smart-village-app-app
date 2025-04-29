import * as FileSystem from 'expo-file-system';

import { volunteerApiV1Url, volunteerAuthToken } from '../../helpers/volunteerHelper';

// https://docs.expo.io/versions/latest/sdk/filesystem/#filesystemuploadasyncurl-fileuri-options
export const uploadFile = async ({
  id,
  fileUri,
  mimeType
}: {
  id: number;
  fileUri: string;
  mimeType: string;
}) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'POST',
    headers: {
      Authorization: authToken ? `Bearer ${authToken}` : ''
    },
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName: 'files',
    mimeType
  };

  return await FileSystem.uploadAsync(
    `${volunteerApiV1Url}post/${id}/upload-files`,
    fileUri,
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
