import { Alert } from 'react-native';

import changers from '../../modules/expo-changers';
import { texts } from '../config/texts';

import { klimaTalerConfiguration } from './configuration';
import { createEntry } from './createEntry';

export const isKlimaTalerEnabled = klimaTalerConfiguration.isEnabled;
export const klimaTalerEntry = createEntry(
  changers,
  isKlimaTalerEnabled,
  klimaTalerConfiguration.ready
);

let opening: Promise<void> | undefined;

// Present above the current screen; never push an intermediate SVA route.
export const openKlimaTaler = (): Promise<void> => {
  if (opening) return opening;
  if (!isKlimaTalerEnabled()) return Promise.resolve();
  opening = klimaTalerEntry.open().then(() => {
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
        : [{ text: texts.klimaTaler.retry, onPress: () => void openKlimaTaler() }])
    ]);
  });
  return opening;
};
