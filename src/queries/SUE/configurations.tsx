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

  const urls = [
    sueConfigurationsUrl,
    sueGeoMapConfigurationUrl,
    sueContactRequiredFieldConfigurationUrl
  ];

  const fetchPromises = urls.map((url) => fetch(url, sueFetchObj));

  try {
    const responses = await Promise.all(fetchPromises);
    const jsonDataPromises = responses.map((response) => response.json());

    const [configResponse, geoMapResponse, requiredFieldResponse] = await Promise.all(
      jsonDataPromises
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
  } catch (error) {
    throw new Error(`Failed to fetch configurations: ${error.message}`);
  }
};
