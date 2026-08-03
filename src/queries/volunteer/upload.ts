import {
  uploadMultipartFile,
  volunteerApiV1Url,
  volunteerApiV2Url,
  volunteerAuthToken
} from '../../helpers';
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

  const apiUrl =
    objectModel === VolunteerObjectModelType.POST ? volunteerApiV1Url : volunteerApiV2Url;

  return await uploadMultipartFile({
    fieldName: 'files',
    fileUri,
    headers: {
      Authorization: authToken ? `Bearer ${authToken}` : ''
    },
    mimeType,
    url: `${apiUrl}${objectModel.split('\\').pop()?.toLowerCase()}/${id}/upload-files`
  });
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
