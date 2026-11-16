import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';

import {
  postRequests,
  fetchSueWithTimeout,
  SueSubmissionError
} from '../queries/SUE/submitRequest';

import { fetchSueEndpoints } from './sueHelper';
import { readSueOutbox, SueOutboxReport, updateSueOutbox } from './sueReportStorage';

let activeSync: Promise<void> | undefined;

const maySend = async () => {
  const network = await NetInfo.fetch();
  return (
    AppState.currentState === 'active' &&
    network.isConnected === true &&
    network.isInternetReachable !== false
  );
};

const deferReport = (entry: SueOutboxReport) => {
  entry.attempts += 1;
  entry.nextAttemptAt =
    Date.now() + Math.min(30_000 * 2 ** Math.min(entry.attempts - 1, 5), 900_000);
};

const isDue = (entry: SueOutboxReport, force: boolean) =>
  entry.deliveryStatus === 'pending' && (force || entry.nextAttemptAt <= Date.now());

const sendClaimedReport = async (
  claimed: SueOutboxReport,
  endpoints: Awaited<ReturnType<typeof fetchSueEndpoints>>
) => {
  try {
    const response = await postRequests(claimed.payload, endpoints);
    const result = Array.isArray(response) ? response[0] : response;
    await updateSueOutbox((reports) => {
      const entry = reports.find((item) => item.localId === claimed.localId);
      if (!entry) return;
      entry.serviceRequestId = result.service_request_id;
      entry.deliveryStatus = 'sent';
    });
  } catch (error) {
    await updateSueOutbox((reports) => {
      const entry = reports.find((item) => item.localId === claimed.localId);
      if (!entry) return;
      // Only an explicit rejection is known not to have created a report. Timeouts, 5xx,
      // invalid confirmations and interrupted writes must not cause duplicate submissions.
      const rejected =
        error instanceof SueSubmissionError &&
        [400, 401, 403, 404, 405, 413, 415, 422].includes(error.status);
      entry.deliveryStatus = rejected ? 'failed' : 'uncertain';
    });
  }
};

const isBackendHealthy = async (endpoints: Awaited<ReturnType<typeof fetchSueEndpoints>>) => {
  try {
    return (await fetchSueWithTimeout(endpoints.sueServicesUrl, endpoints.sueFetchObj)).ok;
  } catch {
    // No POST has happened: retrying this health check is safe.
    return false;
  }
};

const sendPendingReport = async (candidate: SueOutboxReport, force: boolean) => {
  if (!isDue(candidate, force)) return true;
  if (!(await maySend())) return false;
  const endpoints = await fetchSueEndpoints();
  // Never redirect a queued report when its customer configuration changes.
  if (!endpoints.apiKey || candidate.endpoint !== endpoints.suePostRequest) return true;
  if (!(await isBackendHealthy(endpoints))) {
    await updateSueOutbox((reports) => {
      const entry = reports.find((item) => item.localId === candidate.localId);
      if (entry?.deliveryStatus === 'pending') deferReport(entry);
    });
    return true;
  }
  if (!(await maySend())) return false;
  const claimed = await updateSueOutbox((reports) => {
    const entry = reports.find((item) => item.localId === candidate.localId);
    if (entry?.deliveryStatus !== 'pending') return;
    entry.deliveryStatus = 'sending';
    return entry;
  });
  if (claimed) await sendClaimedReport(claimed, endpoints);
  return true;
};

const sendPendingReports = async (force: boolean) => {
  // A process may have died after POST. Without backend idempotency its result is unknown.
  const stored = await readSueOutbox();
  if (stored.some((entry) => entry.deliveryStatus === 'sending')) {
    await updateSueOutbox((reports) => {
      reports.forEach((entry) => {
        if (entry.deliveryStatus === 'sending') entry.deliveryStatus = 'uncertain';
      });
    });
  }
  // Deliberately serialize submissions and stop starting requests after background/offline.
  await (
    await readSueOutbox()
  ).reduce(async (previous, candidate) => {
    if (!(await previous)) return false;
    return sendPendingReport(candidate, force);
  }, Promise.resolve(true));
};

export const syncSueOutbox = (force = false): Promise<void> => {
  if (activeSync) return activeSync;
  activeSync = sendPendingReports(force).finally(() => {
    activeSync = undefined;
  });
  return activeSync;
};

// Called only after an explicit user action (and a duplicate-risk alert for uncertain results).
export const retrySueReport = async (localId: string) => {
  await updateSueOutbox((reports) => {
    const entry = reports.find((item) => item.localId === localId);
    if (!entry || !['failed', 'uncertain'].includes(entry.deliveryStatus)) return;
    entry.deliveryStatus = 'pending';
    entry.nextAttemptAt = 0;
  });
  await syncSueOutbox(true);
};
