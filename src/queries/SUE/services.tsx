import { sueApiKey, sueServicesUrl } from '../../helpers';

export const services = async () => {
  const fetchObj = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      api_key: sueApiKey
    }
  };

  return (await fetch(`${sueServicesUrl}`, fetchObj)).json();
};
