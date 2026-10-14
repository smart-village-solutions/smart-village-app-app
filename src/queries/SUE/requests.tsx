import _camelCase from 'lodash/camelCase';
import _mapKeys from 'lodash/mapKeys';
import { File } from 'expo-file-system';

import { SUE_MY_REPORTS, SUE_STATUS_SOURCE } from '../../config/sue';
import {
  fetchSueEndpoints,
  getVisibleSueStatus,
  inferSueStatusSource,
  readFromStore
} from '../../helpers';
import { StoredSueReport, updateSueMyReports } from '../../helpers/sueReportStorageHelper';

import { requestsWithServiceRequestId, SueRequestError } from './requestsWithServiceRequestId';

// TTL for how often we refresh the status of a stored report (in ms)
const STATUS_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const requests = async (queryVariables) => {
  const queryParams = new URLSearchParams(queryVariables);
  const { sueFetchObj = {}, sueRequestsUrl = '' } = await fetchSueEndpoints();

  const response = await (
    await fetch(`${sueRequestsUrl}?${queryParams.toString()}`, sueFetchObj)
  ).json();

  return new Promise((resolve) => {
    // return with converted keys to camelCase for being accessible per JavaScript convention
    resolve(
      response.map((item: any) => {
        // convert media_url to JSON, as it is returned as a string by the API
        if (item?.media_url && typeof item.media_url === 'string') {
          try {
            item.media_url = JSON.parse(item.media_url);
          } catch (e) {
            // Do not let malformed media_url break the whole response
            console.error('Error parsing media_url from SUE requests response', e);
          }
        }

        return _mapKeys(item, (value, key) => _camelCase(key));
      })
    );
  });
};

const normalizeStoredReport = (item: StoredSueReport) => {
  const report = { ...item };
  const statusSource = inferSueStatusSource(report);

  if (statusSource && !report.statusSource) {
    report.statusSource = statusSource;
  }

  if (typeof report.media_url === 'string') {
    try {
      report.media_url = JSON.parse(report.media_url);
    } catch (error) {
      console.error('Error parsing media_url for stored SUE report', error);
    }
  }

  return report;
};

/* eslint-disable complexity */
export const myRequests = async ({
  forceRefresh = false,
  showInternalPendingStatus
}: {
  forceRefresh?: boolean;
  showInternalPendingStatus?: unknown;
} = {}): Promise<StoredSueReport[]> => {
  let myReports: StoredSueReport[] = [];
  const now = Date.now();
  const statusUpdates = new Map<string, Partial<StoredSueReport> | null>();

  try {
    const jsonValue = await readFromStore(SUE_MY_REPORTS);
    myReports = jsonValue ? JSON.parse(jsonValue) : [];

    if (!Array.isArray(myReports)) {
      throw new Error('Invalid stored SUE reports');
    }
  } catch (error) {
    // Never overwrite recoverable reports when reading storage fails.
    console.error('Error reading my reports values from AsyncStorage', error);
    throw error;
  }

  await Promise.all(
    myReports.map(async (item) => {
      const shouldRefreshStatus =
        item?.serviceRequestId &&
        (forceRefresh || !item.lastStatusCheck || now - item.lastStatusCheck > STATUS_TTL_MS);

      if (!shouldRefreshStatus) return;

      try {
        const onlineReport = await requestsWithServiceRequestId(item.serviceRequestId);

        if (
          onlineReport &&
          typeof onlineReport.status === 'string' &&
          onlineReport.status.trim() &&
          (!onlineReport.serviceRequestId ||
            String(onlineReport.serviceRequestId) === String(item.serviceRequestId))
        ) {
          statusUpdates.set(String(item.serviceRequestId), {
            status: onlineReport.status,
            statusSource: SUE_STATUS_SOURCE.API,
            lastStatusCheck: now
          });
        }
      } catch (error) {
        const wasConfirmedByApi =
          inferSueStatusSource(item) === SUE_STATUS_SOURCE.API &&
          typeof item.lastStatusCheck === 'number' &&
          item.lastStatusCheck > 0;

        // A newly submitted report may be unavailable until moderation publishes it.
        // Only remove a missing report that this endpoint previously confirmed.
        if (
          wasConfirmedByApi &&
          error instanceof SueRequestError &&
          (error.status === 404 || error.status === 410)
        ) {
          statusUpdates.set(String(item.serviceRequestId), null);
        } else {
          console.error(`Error fetching status for ${item.serviceRequestId}`, error);
        }
      }
    })
  );

  const mergeStatusUpdates = (reports: StoredSueReport[]) =>
    reports.filter(Boolean).flatMap((item) => {
      const update = statusUpdates.get(String(item.serviceRequestId));

      // Do not let an older refresh replace the result of a newer successful lookup.
      if (item.lastStatusCheck && item.lastStatusCheck > now) return [normalizeStoredReport(item)];
      if (update === null) return [];

      return [normalizeStoredReport({ ...item, ...update })];
    });

  let updatedReports: StoredSueReport[];

  try {
    // Read current storage inside the update queue: reports submitted while the network
    // requests were pending must remain present, and removed reports must not reappear.
    updatedReports = await updateSueMyReports(mergeStatusUpdates);
  } catch (error) {
    console.error('Error saving updated reports to AsyncStorage', error);
    updatedReports = mergeStatusUpdates(myReports);
  }

  return updatedReports.map((item) =>
    _mapKeys(
      { ...item, status: getVisibleSueStatus(item, showInternalPendingStatus) },
      (value, key) => _camelCase(key)
    )
  );
};
/* eslint-enable complexity */

/* eslint-disable complexity */
export const postRequests = async (data: any) => {
  const { apiKey = '', suePostRequest = '' } = await fetchSueEndpoints();
  const formData = new FormData();

  if (data) {
    const fieldMappings = {
      addressString: 'address_string',
      description: 'description',
      email: 'email',
      firstName: 'first_name',
      lastName: 'last_name',
      lat: 'lat',
      long: 'long',
      phone: 'phone',
      serviceCode: 'service_code',
      title: 'title'
    };

    Object.entries(fieldMappings).forEach(([key, formKey]) => {
      data[key] && formData.append(formKey, data[key]);
    });
  }

  const images = JSON.parse(data?.images) || [];
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const file = new File(image.uri);

    formData.append(`media_file_${i + 1}`, {
      name: image?.imageName,
      type: image?.mimeType,
      bytes: () => file.bytes()
    });
  }

  const fetchObj = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      api_key: apiKey
    },
    body: formData
  };

  return (await fetch(`${suePostRequest}`, fetchObj)).json();
};
/* eslint-enable complexity */
