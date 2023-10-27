import { apiKey, suePrioritiesUrl } from '../../helpers';

export const priorities = async () => {
  const fetchObj = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      api_key: apiKey
    }
  };

  return (await fetch(`${suePrioritiesUrl}`, fetchObj)).json();
};
