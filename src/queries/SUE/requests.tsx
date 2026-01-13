import _camelCase from 'lodash/camelCase';
import _mapKeys from 'lodash/mapKeys';

import { SUE_STATUS } from '../../components';
import { addToStore, fetchSueEndpoints, readFromStore } from '../../helpers';
import { SUE_MY_REPORTS } from '../../screens';

import { requestsWithServiceRequestId } from './requestsWithServiceRequestId';

export const requests = async (queryVariables) => {
  const queryParams = new URLSearchParams(queryVariables);
  const { sueFetchObj = {}, sueRequestsUrl = '' } = await fetchSueEndpoints();

  const response = await (
    await fetch(`${sueRequestsUrl}?${queryParams.toString()}`, sueFetchObj)
  ).json();

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

export const myRequests = async (): Promise<any[]> => {
  let myReports = [];

  try {
    const jsonValue = await readFromStore(SUE_MY_REPORTS);

    if (jsonValue?.length) {
      myReports = JSON.parse(jsonValue);
    }
  } catch (e) {
    console.error('Error reading my reports values from AsyncStorage', e);
  }

  // Process all reports and update statuses where needed
  const updatedReports = await Promise.all(
    myReports.map(async (item: any) => {
      if (!item) return item;

      // Parse media_url if it exists and is a string
      if (item.media_url && typeof item.media_url === 'string') {
        item.media_url = JSON.parse(item.media_url);
      }

      const isFinalStatus = item.status === SUE_STATUS.CLOSED || item.status === SUE_STATUS.INVALID;

      if (item.serviceRequestId && !isFinalStatus) {
        try {
          const onlineReport = await requestsWithServiceRequestId(item.serviceRequestId);

          // Update status if it changed
          if (onlineReport?.status && onlineReport.status !== item.status) {
            item.status = onlineReport.status;
          }
        } catch (e) {
          console.error(`Error fetching status for ${item.serviceRequestId}`, e);
        }
      }

      return _mapKeys(item, (value, key) => _camelCase(key));
    })
  );

  // Save updated reports back to AsyncStorage
  try {
    await addToStore(SUE_MY_REPORTS, JSON.stringify(myReports));
  } catch (e) {
    console.error('Error saving updated reports to AsyncStorage', e);
  }

  return updatedReports;
};

/* eslint-disable complexity */
export const postRequests = async (data: any) => {
  const { apiKey = '', suePostRequest = '' } = await fetchSueEndpoints();
  const formData = new FormData();

  if (data) {
    const fieldMappings = {
      addressString: 'address_string',
      description: 'description',
      email: 'email',
      firstName: 'first_name',
      lastName: 'last_name',
      lat: 'lat',
      long: 'long',
      phone: 'phone',
      serviceCode: 'service_code',
      title: 'title'
    };

    Object.entries(fieldMappings).forEach(([key, formKey]) => {
      data[key] && formData.append(formKey, data[key]);
    });
  }

  const images = JSON.parse(data?.images) || [];
  for (let i = 0; i < images.length; i++) {
    const image = images[i];

    formData.append(`media_file_${i + 1}`, {
      uri: image?.uri,
      name: image?.imageName,
      type: image?.mimeType
    });
  }

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
/* eslint-enable complexity */
