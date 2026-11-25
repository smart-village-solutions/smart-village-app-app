import _camelCase from 'lodash/camelCase';
import _mapKeys from 'lodash/mapKeys';

import { fetchSueEndpoints } from '../../helpers/sueHelper';
import { withSueResourceCache } from '../../helpers/sueResourceCache';

import { fetchSueJson } from './submitRequest';

export const configurations = async () => {
  const {
    apiKey,
    sueConfigurationsUrl = '',
    sueContactRequiredFieldConfigurationUrl = '',
    sueFetchObj = {},
    sueGeoMapConfigurationUrl = ''
  } = await fetchSueEndpoints();

  if (!apiKey) throw new Error('SUE API key is missing');

  const urls = [
    sueConfigurationsUrl,
    sueGeoMapConfigurationUrl,
    sueContactRequiredFieldConfigurationUrl
  ];

  return withSueResourceCache(urls, async () => {
    const [configResponse, geoMapResponse, requiredFieldResponse] = await Promise.all(
      urls.map((url) => fetchSueJson(url, sueFetchObj))
    );

    const mapKeysToCamelCase = (obj) => _mapKeys(obj, (value, key) => _camelCase(key));

    const limitation = configResponse
      ?.map((item) => mapKeysToCamelCase(item))
      ?.reduce((acc, curr) => {
        acc[_camelCase(curr?.shortName)] = curr;
        return acc;
      }, {});
    const geoMap = mapKeysToCamelCase(geoMapResponse);
    const requiredFields = mapKeysToCamelCase(requiredFieldResponse?.contact);

    return {
      geoMap,
      limitation,
      requiredFields
    };
  });
};
