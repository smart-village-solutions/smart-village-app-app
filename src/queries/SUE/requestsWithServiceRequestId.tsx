import { apiKey, sueRequestsUrlWithServiceId } from '../../helpers';

export const requestsWithServiceRequestId = async (serviceRequestId: number) => {
  const fetchObj = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      api_key: apiKey
    }
  };

  return (await fetch(`${sueRequestsUrlWithServiceId(serviceRequestId)}`, fetchObj)).json();
};
