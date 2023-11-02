import _camelCase from 'lodash/camelCase';
import _mapKeys from 'lodash/mapKeys';

import { apiKey, jurisdictionId, sueFetchObj, suePostRequest, sueRequestsUrl } from '../../helpers';

export const requests = async () => {
  const response = await (await fetch(`${sueRequestsUrl}`, sueFetchObj)).json();

  return new Promise((resolve) => {
    // return with converted keys to camelCase for being accessible per JavaScript convention
    resolve(
      response.map((item: any) => {
        // convert media_url to JSON, as it is returned as a string by the API
        if (item?.media_url) {
          item.media_url = JSON.parse(item.media_url);
        }

        return _mapKeys(item, (value, key) => _camelCase(key));
      })
    );
  });
};

export const postRequests = async (data: any) => {
  const formData = new FormData();
  formData.append('address_string', data?.addressString);
  formData.append('description', data?.description);
  formData.append('email', data?.email);
  formData.append('first_name', data?.firstName);
  formData.append('jurisdiction_id', jurisdictionId);
  formData.append('last_name', data?.lastName);
  formData.append('lat', data?.lat);
  formData.append('long', data?.long);
  formData.append('phone', data?.phone);
  formData.append('service_code', data.serviceCode);
  formData.append('title', data?.title);
  formData.append('media_file_1', {
    uri: JSON.parse(data.images)[0]?.uri,
    name: JSON.parse(data.images)[0]?.imageName,
    type: JSON.parse(data.images)[0]?.mimeType
  });
  formData.append('media_file_2', {
    uri: JSON.parse(data.images)[1]?.uri,
    name: JSON.parse(data.images)[1]?.imageName,
    type: JSON.parse(data.images)[1]?.mimeType
  });
  formData.append('media_file_3', {
    uri: JSON.parse(data.images)[2]?.uri,
    name: JSON.parse(data.images)[2]?.imageName,
    type: JSON.parse(data.images)[2]?.mimeType
  });
  formData.append('media_file_4', {
    uri: JSON.parse(data.images)[3]?.uri,
    name: JSON.parse(data.images)[3]?.imageName,
    type: JSON.parse(data.images)[3]?.mimeType
  });
  formData.append('media_file_5', {
    uri: JSON.parse(data.images)[4]?.uri,
    name: JSON.parse(data.images)[4]?.imageName,
    type: JSON.parse(data.images)[4]?.mimeType
  });

  const fetchObj = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      api_key: apiKey,
      'Content-Type': 'multipart/form-data'
    },
    body: formData
  };

  return (await fetch(`${suePostRequest}`, fetchObj)).json();
};
