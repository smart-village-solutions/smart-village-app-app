import { SUE_MY_REPORTS, SUE_STATUS_SOURCE } from '../config/sue';

import { addToStore, readFromStore } from './storageHelper';

export type StoredSueReport = Record<string, unknown> & {
  serviceRequestId?: number | string;
  lastStatusCheck?: number;
  status?: unknown;
  statusSource?: SUE_STATUS_SOURCE;
};

let pendingUpdate: Promise<unknown> = Promise.resolve();

// Serialize the read/write step only; network requests must finish before entering this queue.
export const updateSueMyReports = (
  update: (reports: StoredSueReport[]) => StoredSueReport[]
): Promise<StoredSueReport[]> => {
  const nextUpdate = pendingUpdate.then(async () => {
    const storedValue = await readFromStore(SUE_MY_REPORTS);
    const reports = storedValue ? JSON.parse(storedValue) : [];

    if (!Array.isArray(reports)) {
      throw new Error('Invalid stored SUE reports');
    }

    const updatedReports = update(reports);
    await addToStore(SUE_MY_REPORTS, JSON.stringify(updatedReports));

    return updatedReports;
  });

  // A failed storage operation must not block later updates or submissions.
  pendingUpdate = nextUpdate.catch(() => undefined);

  return nextUpdate;
};
