import { sueApiKey, sueRequestsUrl } from '../../helpers';

export const requests = async () => {
  const fetchObj = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      api_key: sueApiKey
    }
  };

  return (await fetch(`${sueRequestsUrl}`, fetchObj)).json();
};
