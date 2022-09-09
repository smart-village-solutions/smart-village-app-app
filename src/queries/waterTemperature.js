import { waterTemperature } from '../config';

export const getWaterTemperature = async () => {
  const { serverUrl, authSecret } = waterTemperature;

  const fetchObj = {
    method: 'GET',
    headers: { Authorization: authSecret }
  };

  return (await fetch(serverUrl, fetchObj)).json();
};
