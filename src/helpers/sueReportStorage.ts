import { Directory, File, Paths } from 'expo-file-system';

import { addToStore, readFromStore } from './storageHelper';

// Deliberately separate from sueMyReports: legacy reports must never enter the outbox.
export const SUE_OUTBOX = 'sueOutboxV1';
export type SueDeliveryStatus = 'pending' | 'sending' | 'sent' | 'failed' | 'uncertain';
export type SueReportImage = { uri: string; imageName?: string; mimeType?: string };
export type SueOutboxReport = {
  localId: string;
  endpoint: string;
  deliveryStatus: SueDeliveryStatus;
  payload: Record<string, unknown> & { images: string };
  report: Record<string, unknown>;
  attempts: number;
  nextAttemptAt: number;
  serviceRequestId?: string | number;
  sentAt?: number;
};

type Outbox = { version: 1; reports: SueOutboxReport[] };
let storageOperation: Promise<unknown> = Promise.resolve();
const listeners = new Set<() => void>();

export const subscribeSueOutbox = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const readSueOutbox = async (): Promise<SueOutboxReport[]> => {
  const value = (await readFromStore(SUE_OUTBOX)) as Outbox | null;
  if (value == null) return [];
  if (
    value.version !== 1 ||
    !Array.isArray(value.reports) ||
    value.reports.some(
      (item) =>
        !item ||
        typeof item.localId !== 'string' ||
        typeof item.endpoint !== 'string' ||
        !item.payload ||
        !item.report ||
        !['pending', 'sending', 'sent', 'failed', 'uncertain'].includes(item.deliveryStatus)
    )
  ) {
    // Never replace unreadable or newer data with an empty queue.
    throw new Error('Cannot read SUE outbox');
  }
  // iOS may move the application's sandbox after an update/restore. Rebuild paths for our
  // own attachments from the current document directory; legacy files are never modified.
  return value.reports.map((entry) => {
    const images: SueReportImage[] = JSON.parse(entry.payload.images);
    const directory = new Directory(Paths.document, 'sue-reports', entry.localId);
    const restoredImages = images.map((image, index) => ({
      ...image,
      uri: new File(directory, `image-${index}`).uri
    }));
    return {
      ...entry,
      payload: { ...entry.payload, images: JSON.stringify(restoredImages) },
      report: {
        ...entry.report,
        mediaUrl: restoredImages.map((image, index) => ({
          id: `local-${index}`,
          url: image.uri,
          visible: true,
          contentType: 'image'
        }))
      }
    };
  });
};

const serializeOutboxOperation = <T>(operation: () => Promise<T>): Promise<T> => {
  const result = storageOperation.then(operation);
  storageOperation = result.catch(() => undefined);
  return result;
};

const saveOutbox = async (reports: SueOutboxReport[]) => {
  await addToStore(SUE_OUTBOX, { version: 1, reports });
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // A subscriber failure must not roll back attachments after the queue was saved.
      console.error('Could not notify SUE outbox subscriber');
    }
  });
};

export const updateSueOutbox = <T>(
  update: (reports: SueOutboxReport[]) => T | Promise<T>
): Promise<T> =>
  serializeOutboxOperation(async () => {
    const reports = await readSueOutbox();
    const before = JSON.stringify(reports);
    const result = await update(reports);
    if (before !== JSON.stringify(reports)) await saveOutbox(reports);
    return result;
  });

const removeAttachments = (localId: string) => {
  try {
    const directory = new Directory(Paths.document, 'sue-reports', localId);
    if (directory.exists) directory.delete();
  } catch {
    // Storage may be temporarily unavailable. Keep the durable report and its receipt intact.
    console.error('Could not remove unused SUE attachments');
  }
};

const copyAttachments = async (entry: SueOutboxReport) => {
  const images: SueReportImage[] = JSON.parse(entry.payload.images || '[]');
  if (!Array.isArray(images)) throw new Error('Invalid SUE images');
  const directory = new Directory(Paths.document, 'sue-reports', entry.localId);
  if (images.length) directory.create({ intermediates: true, idempotent: true });
  // Wait for every copy to finish before rollback can remove the directory.
  const copies = await Promise.allSettled(
    images.map(async (image, index) => {
      const source = new File(image.uri);
      const target = new File(directory, `image-${index}`);
      if (!source.exists) throw new Error('SUE attachment is missing');
      await source.copy(target, { overwrite: true });
      return { ...image, uri: target.uri };
    })
  );
  const failure = copies.find((copy) => copy.status === 'rejected');
  if (failure?.status === 'rejected') throw failure.reason;
  return copies.map((copy) => (copy as PromiseFulfilledResult<SueReportImage>).value);
};

export const enqueueSueReport = (entry: SueOutboxReport, replaceRejectedId?: string) =>
  serializeOutboxOperation(async () => {
    const reports = await readSueOutbox();
    const existing = reports.find((report) => report.localId === entry.localId);
    if (existing) return existing;
    const rejected = reports.find((report) => report.localId === replaceRejectedId);
    if (
      replaceRejectedId &&
      (rejected?.deliveryStatus !== 'failed' || rejected.endpoint !== entry.endpoint)
    ) {
      throw new Error('Only a rejected report from the same backend can be replaced');
    }

    let saved: SueOutboxReport;
    try {
      const savedImages = await copyAttachments(entry);
      saved = {
        ...entry,
        payload: { ...entry.payload, images: JSON.stringify(savedImages) },
        report: {
          ...entry.report,
          mediaUrl: savedImages.map((image, index) => ({
            id: `local-${index}`,
            url: image.uri,
            visible: true,
            contentType: 'image'
          }))
        }
      };
      if (rejected) reports.splice(reports.indexOf(rejected), 1);
      reports.unshift(saved);
      await saveOutbox(reports);
    } catch (error) {
      // Still inside the storage lock: a concurrent retry cannot reuse this directory yet.
      removeAttachments(entry.localId);
      throw error;
    }
    // The superseded report's files remain recoverable until replacement is durable.
    if (rejected) removeAttachments(rejected.localId);
    return saved;
  });

export const sueOutboxPresentation = (entry: SueOutboxReport) => ({
  ...entry.report,
  status: entry.deliveryStatus === 'sent' ? entry.report.status : undefined,
  statusSource: entry.deliveryStatus === 'sent' ? entry.report.statusSource : undefined,
  localId: entry.localId,
  submissionEndpoint: entry.endpoint,
  deliveryStatus: entry.deliveryStatus,
  serviceRequestId: entry.serviceRequestId,
  sentAt: entry.sentAt,
  id: entry.serviceRequestId || entry.localId
});

export const updateSueOutboxStatuses = async (updates: Record<string, unknown>[]) => {
  if (!updates.length) return;
  await updateSueOutbox((reports) => {
    updates.forEach((update) => {
      const entry = reports.find((report) => report.localId === update.localId);
      if (
        entry?.deliveryStatus === 'sent' &&
        typeof update.lastStatusCheck === 'number' &&
        !(Number(entry.report.lastStatusCheck) > update.lastStatusCheck)
      ) {
        entry.report = {
          ...entry.report,
          status: update.status,
          statusSource: update.statusSource,
          lastStatusCheck: update.lastStatusCheck
        };
      }
    });
  });
};
