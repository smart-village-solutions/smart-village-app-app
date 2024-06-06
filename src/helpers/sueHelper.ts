import { storageHelper } from './storageHelper';

export const fetchSueEndpoints = async (serviceRequestId?: number) => {
  const configurations = await storageHelper.configurations();
  const { sueConfig = {} } = configurations;
  const { apiConfig = {} } = sueConfig;

  const { apiKey, jurisdictionId, serverUrl } = apiConfig[apiConfig?.whichApi] || apiConfig;

  const sueFetchObj = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      api_key: apiKey
    }
  };

  const suePostRequest = `${serverUrl}/requests`;
  const suePrioritiesUrl = `${serverUrl}/priorities?jurisdiction_id=${jurisdictionId}`;
  const sueRequestsUrl = `${serverUrl}/requests?jurisdiction_id=${jurisdictionId}`;
  const sueRequestsUrlWithServiceId = `${serverUrl}/requests/${serviceRequestId}?jurisdiction_id=${jurisdictionId}`;
  const sueServicesUrl = `${serverUrl}/services?jurisdiction_id=${jurisdictionId}`;
  const sueStatusesUrl = `${serverUrl}/statuses?jurisdiction_id=${jurisdictionId}`;

  const sueConfigurationsUrl = `${serverUrl}/configurations?jurisdiction_id=${jurisdictionId}`;
  const sueContactRequiredFieldConfigurationUrl = `${serverUrl}/configurations/contactRequiredFieldConfiguration?jurisdiction_id=${jurisdictionId}`;
  const sueGeoMapConfigurationUrl = `${serverUrl}/configurations/geoMapConfiguration?jurisdiction_id=${jurisdictionId}`;

  return {
    apiKey,
    jurisdictionId,
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
