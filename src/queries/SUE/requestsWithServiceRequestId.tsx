import { sueApiKey, sueRequestsUrlWithServiceId } from '../../helpers';

export const requestsWithServiceRequestId = async (serviceRequestId: number) => {
  const fetchObj = {
    method: 'GET',
    headers: {
      accept: 'application/json;charset=UTF-8',
      api_key: sueApiKey
    }
  };

  return (await fetch(`${sueRequestsUrlWithServiceId(serviceRequestId)}`, fetchObj)).json();
};
