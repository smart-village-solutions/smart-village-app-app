import { namespace, secrets } from '../../../config';
import { getConsulAuthToken, uploadMultipartFile } from '../../../helpers';

// https://docs.expo.io/versions/latest/sdk/filesystem/#filesystemuploadasyncurl-fileuri-options
export const uploadAttachment = async (uri, resourceRelation, resourceType = 'Proposal') => {
  const token = await getConsulAuthToken();

  return await uploadMultipartFile({
    fieldName: 'attachment',
    fileUri: uri,
    headers: {
      'access-token': token ? `${JSON.parse(token).accessToken}` : '',
      client: token ? `${JSON.parse(token).client}` : '',
      uid: token ? `${JSON.parse(token).uid}` : ''
    },
    mimeType: 'jpg', // consul server requires jpg currently
    parameters: {
      'direct_upload[resource_relation]': resourceRelation, // 'image' or 'documents'
      'direct_upload[resource_type]': resourceType // 'Proposal'
    },
    url: `${secrets[namespace]?.consul?.serverUrl}/token_auth/direct_uploads`
  });
};

export const deleteAttachment = async (id) => {
  const token = await getConsulAuthToken();

  const fetchObj = {
    method: 'DELETE',
    headers: {
      'access-token': token ? `${JSON.parse(token).accessToken}` : '',
      client: token ? `${JSON.parse(token).client}` : '',
      uid: token ? `${JSON.parse(token).uid}` : ''
    }
  };

  return await fetch(
    `${secrets[namespace]?.consul?.serverUrl}/token_auth/direct_uploads/${id}`,
    fetchObj
  );
};
