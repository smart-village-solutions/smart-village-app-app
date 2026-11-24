import _camelCase from 'lodash/camelCase';
import _mapKeys from 'lodash/mapKeys';
import NetInfo from '@react-native-community/netinfo';

import { SUE_MY_REPORTS, SUE_STATUS_SOURCE } from '../../config/sue';
import {
  fetchSueEndpoints,
  getVisibleSueStatus,
  inferSueStatusSource,
  readFromStore
} from '../../helpers';
import {
  readSueOutbox,
  sueOutboxPresentation,
  updateSueOutboxStatuses
} from '../../helpers/sueReportStorage';
import {
  shouldWaitForSueReportStatus,
  StoredSueReport,
  SUE_REPORT_STATUS_INTERVAL_MS,
  updateSueMyReports
} from '../../helpers/sueReportStorageHelper';

import { requestsWithServiceRequestId, SueRequestError } from './requestsWithServiceRequestId';

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

const shouldRefreshReport = (
  item: StoredSueReport,
  connected: boolean,
  endpoint: string | undefined,
  force: boolean,
  now: number
) =>
  item?.serviceRequestId &&
  connected &&
  (!item.submissionEndpoint || item.submissionEndpoint === endpoint) &&
  !shouldWaitForSueReportStatus(item.sentAt, now) &&
  (force || !item.lastStatusCheck || now - item.lastStatusCheck >= SUE_REPORT_STATUS_INTERVAL_MS);

const hasMatchingStatus = (report: StoredSueReport | undefined, item: StoredSueReport) =>
  report &&
  typeof report.status === 'string' &&
  report.status.trim() &&
  (!report.serviceRequestId || String(report.serviceRequestId) === String(item.serviceRequestId));

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
    myReports = typeof jsonValue === 'string' ? JSON.parse(jsonValue) : jsonValue || [];

    if (!Array.isArray(myReports)) {
      throw new Error('Invalid stored SUE reports');
    }
  } catch (error) {
    // Never overwrite recoverable reports when reading storage fails.
    console.error('Error reading my reports values from AsyncStorage', error);
    throw error;
  }

  const outboxReports = (await readSueOutbox()).map(sueOutboxPresentation);
  const network = await NetInfo.fetch().catch(() => ({ isConnected: false }));
  const isConnected = network.isConnected === true;
  const { suePostRequest } = isConnected && outboxReports.length ? await fetchSueEndpoints() : {};
  const reportKey = (item: StoredSueReport) =>
    item.localId ? `local:${item.localId}` : String(item.serviceRequestId);

  await Promise.all(
    [...outboxReports, ...myReports].map(async (item) => {
      if (!shouldRefreshReport(item, isConnected, suePostRequest, forceRefresh, now)) return;

      try {
        const onlineReport = await requestsWithServiceRequestId(item.serviceRequestId);

        if (hasMatchingStatus(onlineReport, item)) {
          statusUpdates.set(reportKey(item), {
            status: onlineReport.status,
            statusSource: SUE_STATUS_SOURCE.API,
            lastStatusCheck: now
          });
        }
      } catch (error) {
        if (error instanceof SueRequestError && (error.status === 404 || error.status === 410)) {
          // Newly submitted reports may be unavailable until moderation publishes them.
          const wasConfirmedByApi =
            inferSueStatusSource(item) === SUE_STATUS_SOURCE.API &&
            typeof item.lastStatusCheck === 'number' &&
            item.lastStatusCheck > 0;
          if (!item.localId && wasConfirmedByApi) statusUpdates.set(reportKey(item), null);
        } else {
          console.error(`Error fetching status for ${item.serviceRequestId}`, error);
        }
      }
    })
  );

  const mergeStatusUpdates = (reports: StoredSueReport[]) =>
    reports.filter(Boolean).flatMap((item) => {
      const update = statusUpdates.get(reportKey(item));

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

  const updatedOutbox = mergeStatusUpdates(outboxReports);
  await updateSueOutboxStatuses(updatedOutbox);
  return [...updatedOutbox, ...updatedReports].map((item) =>
    _mapKeys(
      { ...item, status: getVisibleSueStatus(item, showInternalPendingStatus) },
      (value, key) => _camelCase(key)
    )
  );
};
/* eslint-enable complexity */

export { postRequests } from './submitRequest';
