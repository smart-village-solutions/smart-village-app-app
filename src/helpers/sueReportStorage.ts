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

export const updateSueOutbox = <T>(
  update: (reports: SueOutboxReport[]) => T | Promise<T>
): Promise<T> => {
  const operation = storageOperation.then(async () => {
    const reports = await readSueOutbox();
    const before = JSON.stringify(reports);
    const result = await update(reports);
    if (before === JSON.stringify(reports)) return result;
    await addToStore(SUE_OUTBOX, { version: 1, reports });
    listeners.forEach((listener) => listener());
    return result;
  });
  storageOperation = operation.catch(() => undefined);
  return operation;
};

export const enqueueSueReport = async (entry: SueOutboxReport, replaceRejectedId?: string) =>
  updateSueOutbox(async (reports) => {
    const existing = reports.find((report) => report.localId === entry.localId);
    if (existing) return existing;
    const rejected = reports.find((report) => report.localId === replaceRejectedId);
    if (
      replaceRejectedId &&
      (rejected?.deliveryStatus !== 'failed' || rejected.endpoint !== entry.endpoint)
    ) {
      throw new Error('Only a rejected report from the same backend can be replaced');
    }

    const images: SueReportImage[] = JSON.parse(entry.payload.images || '[]');
    if (!Array.isArray(images)) throw new Error('Invalid SUE images');
    const directory = new Directory(Paths.document, 'sue-reports', entry.localId);
    if (images.length) directory.create({ intermediates: true, idempotent: true });
    const savedImages: SueReportImage[] = [];
    for (const [index, image] of images.entries()) {
      const source = new File(image.uri);
      const target = new File(directory, `image-${index}`);
      if (!source.exists) throw new Error('SUE attachment is missing');
      await source.copy(target, { overwrite: true });
      savedImages.push({ ...image, uri: target.uri });
    }
    const saved = {
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
  id: entry.serviceRequestId || entry.localId
});

export const updateSueOutboxStatuses = async (updates: Record<string, unknown>[]) => {
  if (!updates.length) return;
  await updateSueOutbox((reports) => {
    updates.forEach((update) => {
      const entry = reports.find((report) => report.localId === update.localId);
      if (entry?.deliveryStatus === 'sent' && update.lastStatusCheck) {
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
