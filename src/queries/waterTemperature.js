import { waterTemperatureEndpoint } from '../config';

export const getWaterTemperature = async () => {
  const { serverUrl, authSecret } = waterTemperatureEndpoint;

  const fetchObj = {
    method: 'GET',
    headers: { Authorization: `readonly:${authSecret}` }
  };

  return (await fetch(serverUrl, fetchObj)).json();
};
