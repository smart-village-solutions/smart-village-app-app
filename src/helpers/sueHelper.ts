import { storageHelper } from './storageHelper';

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
    suePostRequest,
    suePrioritiesUrl,
    sueRequestsUrl,
    sueRequestsUrlWithServiceId,
    sueServicesUrl,
    sueStatusesUrl
  };
};
