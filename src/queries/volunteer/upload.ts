import * as FileSystem from 'expo-file-system/legacy';

import {
  volunteerApiV1Url,
  volunteerApiV2Url,
  volunteerAuthToken
} from '../../helpers/volunteerHelper';
import { VolunteerObjectModelType } from '../../types';

// https://docs.expo.io/versions/latest/sdk/filesystem/#filesystemuploadasyncurl-fileuri-options
export const uploadFile = async ({
  id,
  fileUri,
  mimeType,
  objectModel = VolunteerObjectModelType.POST
}: {
  id: number;
  fileUri: string;
  mimeType: string;
  objectModel: VolunteerObjectModelType;
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

  const apiUrl =
    objectModel === VolunteerObjectModelType.POST ? volunteerApiV1Url : volunteerApiV2Url;

  return await FileSystem.uploadAsync(
    `${apiUrl}${objectModel.split('\\').pop()?.toLowerCase()}/${id}/upload-files`,
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
