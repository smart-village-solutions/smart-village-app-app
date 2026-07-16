import { storageHelper } from './storageHelper';

export const getSueApiConfig = (apiConfig: Record<string, any> = {}) =>
  (apiConfig?.whichApi ? apiConfig?.[apiConfig.whichApi] : undefined) || apiConfig;

export const fetchSueEndpoints = async (serviceRequestId?: number) => {
  const configurations = await storageHelper.configurations();
  const { sueConfig = {} } = configurations;
  const { apiConfig = {} } = sueConfig;
  const { apiKey, serverUrl } = getSueApiConfig(apiConfig);

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
