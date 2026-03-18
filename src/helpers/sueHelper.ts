import { storageHelper } from './storageHelper';

/**
 * Resolves the SUE limit-of-area city with the following priority:
 * 1. Use the explicitly configured city from `globalSettings`.
 * 2. Otherwise derive it from the first SUE configs geo map area name.
 * 3. Remove bracketed suffixes like "[kreisfreie Stadt]" from the derived name.
 */
export const getSueLimitOfAreaCity = ({
  areaName = '',
  configuredCity = ''
}: {
  areaName?: string;
  configuredCity?: string;
}) => {
  if (configuredCity) {
    return configuredCity;
  }

  return areaName.replace(/\s*\[[^\]]*]\s*/g, '').trim();
};

export const fetchSueEndpoints = async (serviceRequestId?: number) => {
  const configurations = await storageHelper.configurations();
  const { sueConfig = {} } = configurations;
  const { apiConfig = {} } = sueConfig;

  const { apiKey, serverUrl } = apiConfig[apiConfig?.whichApi] || apiConfig;

  const sueFetchObj = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      api_key: apiKey
    }
  };

  const sueLocationsUrl = `${serverUrl}/locations`;
  const suePostRequest = `${serverUrl}/requests`;
  const suePrioritiesUrl = `${serverUrl}/priorities`;
  const sueRequestsUrl = `${serverUrl}/requests`;
  const sueRequestsUrlWithServiceId = `${serverUrl}/requests/${serviceRequestId}`;
  const sueServicesUrl = `${serverUrl}/services`;
  const sueStatusesUrl = `${serverUrl}/statuses`;

  const sueConfigurationsUrl = `${serverUrl}/configurations`;
  const sueContactRequiredFieldConfigurationUrl = `${serverUrl}/configurations/contactRequiredFieldConfiguration`;
  const sueGeoMapConfigurationUrl = `${serverUrl}/configurations/geoMapConfiguration`;

  return {
    apiKey,
    sueConfigurationsUrl,
    sueContactRequiredFieldConfigurationUrl,
    sueFetchObj,
    sueGeoMapConfigurationUrl,
    sueLocationsUrl,
    suePostRequest,
    suePrioritiesUrl,
    sueRequestsUrl,
    sueRequestsUrlWithServiceId,
    sueServicesUrl,
    sueStatusesUrl
  };
};
