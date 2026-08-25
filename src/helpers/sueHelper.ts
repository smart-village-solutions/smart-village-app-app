import { SUE_INTERNAL_PENDING_STATUS, SUE_STATUS_SOURCE } from '../config/sue';

import { storageHelper } from './storageHelper';

export type StoredSueStatus = {
  status?: unknown;
  statusSource?: SUE_STATUS_SOURCE;
};

export const shouldShowInternalSuePendingStatus = (value?: unknown) => value !== false;

export const inferSueStatusSource = ({ status, statusSource }: StoredSueStatus) => {
  if (typeof status !== 'string' || !status.trim()) return;

  if (statusSource === SUE_STATUS_SOURCE.API || statusSource === SUE_STATUS_SOURCE.INTERNAL) {
    return statusSource;
  }

  return status === SUE_INTERNAL_PENDING_STATUS
    ? SUE_STATUS_SOURCE.INTERNAL
    : SUE_STATUS_SOURCE.API;
};

export const getVisibleSueStatus = (
  report: StoredSueStatus,
  showInternalPendingStatus?: unknown
) => {
  const statusSource = inferSueStatusSource(report);

  if (!statusSource) return;
  if (
    statusSource === SUE_STATUS_SOURCE.INTERNAL &&
    !shouldShowInternalSuePendingStatus(showInternalPendingStatus)
  ) {
    return;
  }

  return report.status as string;
};

export const getInitialSueStatus = (showInternalPendingStatus?: unknown) =>
  shouldShowInternalSuePendingStatus(showInternalPendingStatus)
    ? {
        status: SUE_INTERNAL_PENDING_STATUS,
        statusSource: SUE_STATUS_SOURCE.INTERNAL
      }
    : {};

export const getSueApiConfig = (apiConfig: Record<string, any> = {}) =>
  (apiConfig?.whichApi ? apiConfig?.[apiConfig.whichApi] : undefined) || apiConfig;

export const hasSueApiConfiguration = (sueConfig: { apiConfig?: Record<string, unknown> } = {}) => {
  const { apiKey, serverUrl } = getSueApiConfig(sueConfig.apiConfig);

  return !!(apiKey && serverUrl);
};

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
