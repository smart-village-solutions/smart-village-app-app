import NetInfo from '@react-native-community/netinfo';
import _camelCase from 'lodash/camelCase';
import _mapKeys from 'lodash/mapKeys';

import { SUE_MY_REPORTS, SUE_STATUS, SUE_STATUS_SOURCE } from '../../config';
import {
  addToStore,
  fetchSueEndpoints,
  getVisibleSueStatus,
  inferSueStatusSource,
  readFromStore
} from '../../helpers';

import { requestsWithServiceRequestId } from './requestsWithServiceRequestId';
import {
  readSueOutbox,
  sueOutboxPresentation,
  updateSueOutboxStatuses
} from '../../helpers/sueReportStorage';

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

/* eslint-disable complexity */
export const myRequests = async ({
  showInternalPendingStatus
}: {
  showInternalPendingStatus?: unknown;
} = {}): Promise<any[]> => {
  let myReports = [];
  const now = Date.now();

  try {
    const jsonValue = await readFromStore(SUE_MY_REPORTS);

    if (jsonValue != null) {
      myReports = typeof jsonValue === 'string' ? JSON.parse(jsonValue) : jsonValue;
      if (!Array.isArray(myReports)) throw new Error('Invalid saved SUE reports');
    }
  } catch (e) {
    console.error('Error reading my reports values from AsyncStorage', e);
    throw e;
  }

  const outboxReports = (await readSueOutbox()).map(sueOutboxPresentation);
  const { suePostRequest } = outboxReports.length ? await fetchSueEndpoints() : {};
  const isConnected = (await NetInfo.fetch()).isConnected === true;

  // Process all reports and update statuses where needed
  const updatedReports = await Promise.all(
    [...outboxReports, ...myReports].map(async (item: any) => {
      if (!item) return item;

      const inferredStatusSource = inferSueStatusSource(item);
      if (inferredStatusSource && !item.statusSource) {
        item.statusSource = inferredStatusSource;
      }

      // Parse media_url if it exists and is a string
      if (item.media_url && typeof item.media_url === 'string') {
        try {
          item.media_url = JSON.parse(item.media_url);
        } catch (e) {
          // Do not let malformed stored media_url break the whole Promise.all
          console.error('Error parsing media_url for stored SUE report', e);
        }
      }

      const isFinalStatus = item.status === SUE_STATUS.CLOSED || item.status === SUE_STATUS.INVALID;

      // Only refresh non-final reports if the last check is older than our TTL (or missing)
      const shouldRefreshStatus =
        item.serviceRequestId &&
        isConnected &&
        (!item.submissionEndpoint || item.submissionEndpoint === suePostRequest) &&
        !isFinalStatus &&
        (!item.lastStatusCheck || now - item.lastStatusCheck > STATUS_TTL_MS);

      if (shouldRefreshStatus) {
        try {
          const onlineReport = (await requestsWithServiceRequestId(item.serviceRequestId)) as
            | Record<string, unknown>
            | undefined;
          const isSuccessfulLookup =
            !!onlineReport &&
            typeof onlineReport === 'object' &&
            String(onlineReport.serviceRequestId) === String(item.serviceRequestId) &&
            typeof onlineReport.status !== 'number';

          if (isSuccessfulLookup) {
            if (typeof onlineReport.status === 'string' && onlineReport.status.trim()) {
              item.statusSource = SUE_STATUS_SOURCE.API;
              item.status = onlineReport.status;
            }
            item.lastStatusCheck = now;
          }
        } catch (e) {
          console.error(`Error fetching status for ${item.serviceRequestId}`, e);
        }
      }

      const visibleStatus = getVisibleSueStatus(item, showInternalPendingStatus);
      const presentationItem = { ...item, status: visibleStatus };

      return _mapKeys(presentationItem, (value, key) => _camelCase(key));
    })
  );

  // Save updated reports back to AsyncStorage
  try {
    await addToStore(SUE_MY_REPORTS, JSON.stringify(myReports));
    await updateSueOutboxStatuses(outboxReports);
  } catch (e) {
    console.error('Error saving updated reports to AsyncStorage', e);
  }

  return updatedReports;
};
/* eslint-enable complexity */

export { postRequests } from './submitRequest';
