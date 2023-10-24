import { sueApiKey, sueStatusesUrl } from '../../helpers';

export const statuses = async () => {
  const fetchObj = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      api_key: sueApiKey
    }
  };

  return (await fetch(`${sueStatusesUrl}`, fetchObj)).json();
};
