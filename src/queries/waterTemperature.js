import { waterTemperatureEndpoint } from '../config';

export const getWaterTemperature = async () => {
  const fetchObj = {
    method: 'GET',
    headers: { Authorization: 'readonly:LjjhVGU46EBcKND9j3cX' }
  };

  return await fetch(waterTemperatureEndpoint, fetchObj)
    .then((response) => response.json())
    .catch((err) => console.error(err));
};
