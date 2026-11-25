import { Alert } from 'react-native';

import changers from '../../modules/expo-changers';
import { texts } from '../config/texts';

import { klimaTalerConfiguration } from './configuration';
import { createEntry } from './createEntry';
import { klimaTalerSummary } from './summary';
import type { KlimaTalerTarget } from './createEntry';

export const isKlimaTalerEnabled = klimaTalerConfiguration.isEnabled;
export const klimaTalerEntry = createEntry(changers, isKlimaTalerEnabled, async () => {
  klimaTalerSummary.pause();
  await klimaTalerConfiguration.ready();
  await klimaTalerSummary.waitForIdle();
});

let opening: Promise<void> | undefined;

// Present above the current screen; never push an intermediate SVA route.
export const openKlimaTaler = (target?: KlimaTalerTarget): Promise<void> => {
  if (opening) return opening;
  if (!isKlimaTalerEnabled()) return Promise.resolve();
  opening = klimaTalerEntry.open(target).then(() => {
    opening = undefined;
    const state = klimaTalerEntry.getSnapshot();
    if (state.phase !== 'error' || !isKlimaTalerEnabled()) return;
    const message =
      texts.klimaTaler.errors[state.errorCode as keyof typeof texts.klimaTaler.errors] ??
      texts.klimaTaler.errors.E_PROVIDER;
    Alert.alert(texts.klimaTaler.title, message, [
      { text: texts.accessibilityLabels.actions.cancel, style: 'cancel' },
      ...(state.errorCode === 'E_REGISTRATION_UNCERTAIN'
        ? []
        : [{ text: texts.klimaTaler.retry, onPress: () => void openKlimaTaler(target) }])
    ]);
  });
  return opening;
};
