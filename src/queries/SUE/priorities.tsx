import { sueApiKey, suePrioritiesUrl } from '../../helpers';

export const priorities = async () => {
  const fetchObj = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      api_key: sueApiKey
    }
  };

  return (await fetch(`${suePrioritiesUrl}`, fetchObj)).json();
};
