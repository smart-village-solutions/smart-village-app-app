import { apiKey, sueRequestsUrl } from '../../helpers';

export const requests = async () => {
  const fetchObj = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      api_key: apiKey
    }
  };

  return (await fetch(`${sueRequestsUrl}`, fetchObj)).json();
};
