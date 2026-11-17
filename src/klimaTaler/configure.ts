import { klimaTalerConfiguration } from './configuration';
import { klimaTalerEntry } from './entry';
import { observeKlimaTaler } from './lifecycle';

let stopObserving: (() => void) | undefined;

export const configureKlimaTaler = (enabled: boolean) => {
  const changed = klimaTalerConfiguration.isEnabled() !== enabled;
  klimaTalerConfiguration.setEnabled(enabled);
  if (changed) {
    stopObserving?.();
    stopObserving = undefined;
    klimaTalerEntry.cancel();
    if (enabled) stopObserving = observeKlimaTaler();
  }
};
