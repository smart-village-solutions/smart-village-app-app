import { apiKey, sueServicesUrl } from '../../helpers';

export const services = async () => {
  const fetchObj = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      api_key: apiKey
    }
  };

  return (await fetch(`${sueServicesUrl}`, fetchObj)).json();
};
