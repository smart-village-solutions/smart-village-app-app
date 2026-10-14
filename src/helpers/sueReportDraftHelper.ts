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
