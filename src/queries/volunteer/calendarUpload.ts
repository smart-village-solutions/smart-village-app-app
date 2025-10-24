import * as FileSystem from 'expo-file-system/legacy';

import { volunteerApiV1Url, volunteerAuthToken } from '../../helpers/volunteerHelper';

// https://docs.expo.io/versions/latest/sdk/filesystem/#filesystemuploadasyncurl-fileuri-options
export const calendarUpload = async (uri: string, entryId: number, mimeType: string) => {
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
    `${volunteerApiV1Url}calendar/entry/${entryId}/upload-files`,
    uri,
    fetchObj
  );
};

export const calendarDeleteFile = async (fileId: number, entryId: number) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'DELETE',
    headers: {
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return await fetch(
    `${volunteerApiV1Url}calendar/entry/${entryId}/remove-file/${fileId}`,
    fetchObj
  );
};
