import * as FileSystem from 'expo-file-system/legacy';

import {
  volunteerApiV1Url,
  volunteerApiV2Url,
  volunteerAuthToken
} from '../../helpers/volunteerHelper';

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

export const deleteFile = async (guid: string) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'DELETE',
    headers: {
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return await fetch(`${volunteerApiV2Url}file/${guid}`, fetchObj);
};
