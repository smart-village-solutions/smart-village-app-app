import { uploadMultipartFile, volunteerApiV1Url, volunteerAuthToken } from '../../helpers';

// https://docs.expo.io/versions/latest/sdk/filesystem/#filesystemuploadasyncurl-fileuri-options
export const calendarUpload = async (uri: string, entryId: number, mimeType: string) => {
  const authToken = await volunteerAuthToken();

  return await uploadMultipartFile({
    fieldName: 'files',
    fileUri: uri,
    headers: {
      Authorization: authToken ? `Bearer ${authToken}` : ''
    },
    mimeType,
    url: `${volunteerApiV1Url}calendar/entry/${entryId}/upload-files`
  });
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
