import AsyncStorage from '@react-native-async-storage/async-storage';

import { SUE_REPORT_VALUES } from '../config/sue/constants';

import { addToStore, readFromStore } from './storageHelper';

let sessionInitialization: Promise<void> | undefined;
let canRestoreDraft = false;

export const initializeSueReportSession = () => {
  if (!sessionInitialization) {
    sessionInitialization = AsyncStorage.removeItem(SUE_REPORT_VALUES)
      .then(() => {
        canRestoreDraft = true;
      })
      .catch(() => {
        // Startup can continue, but an old draft must not enter the new session.
        canRestoreDraft = false;
      });
  }

  return sessionInitialization;
};

export const readSueReportDraft = async () => {
  await initializeSueReportSession();
  return canRestoreDraft ? readFromStore(SUE_REPORT_VALUES) : undefined;
};

export const storeSueReportDraft = async (draft: Record<string, unknown>) => {
  await initializeSueReportSession();
  await addToStore(SUE_REPORT_VALUES, draft);
  canRestoreDraft = true;
};

const boundDraftKey = (endpoint: string) => {
  if (!endpoint) throw new Error('Missing SUE draft endpoint');
  return `sueReportDraftV2:${endpoint}`;
};

export const readSueReportDraftForEndpoint = async (endpoint: string) => {
  const stored = await readFromStore(boundDraftKey(endpoint));
  if (stored == null) return undefined;
  if (
    stored.version !== 2 ||
    stored.endpoint !== endpoint ||
    !stored.values ||
    typeof stored.values !== 'object' ||
    Array.isArray(stored.values)
  ) {
    throw new Error('Cannot read SUE draft');
  }
  return stored.values;
};

export const storeSueReportDraftForEndpoint = (values: Record<string, unknown>, endpoint: string) =>
  addToStore(boundDraftKey(endpoint), { version: 2, endpoint, values });

export const removeSueReportDraftForEndpoint = (endpoint: string) =>
  AsyncStorage.removeItem(boundDraftKey(endpoint));
