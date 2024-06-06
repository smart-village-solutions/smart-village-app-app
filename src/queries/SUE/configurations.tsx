import _camelCase from 'lodash/camelCase';
import _mapKeys from 'lodash/mapKeys';

import { fetchSueEndpoints } from '../../helpers';

export const configurations = async () => {
  const {
    sueConfigurationsUrl = '',
    sueContactRequiredFieldConfigurationUrl = '',
    sueFetchObj = {},
    sueGeoMapConfigurationUrl = ''
  } = await fetchSueEndpoints();

  const configPromise = await (await fetch(`${sueConfigurationsUrl}`, sueFetchObj)).json();
  const geoMapPromise = await (await fetch(`${sueGeoMapConfigurationUrl}`, sueFetchObj)).json();
  const requiredFieldPromise = await (
    await fetch(`${sueContactRequiredFieldConfigurationUrl}`, sueFetchObj)
  ).json();

  return Promise.all([configPromise, geoMapPromise, requiredFieldPromise])
    .then(([configResponse, geoMapResponse, requiredFieldResponse]) => {
      const mapKeysToCamelCase = (obj) => _mapKeys(obj, (value, key) => _camelCase(key));

      const limitation = configResponse
        ?.map((item) => mapKeysToCamelCase(item))
        ?.reduce((acc, curr) => {
          acc[_camelCase(curr?.shortName)] = curr;

          return acc;
        }, {});
      const geoMap = mapKeysToCamelCase(geoMapResponse);
      const requiredFields = mapKeysToCamelCase(requiredFieldResponse);

      return {
        geoMap,
        limitation,
        requiredFields
      };
    })
    .catch((error) => {
      throw new Error(`Failed to fetch configurations: ${error.message}`);
    });
};
