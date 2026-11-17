import { AppState } from 'react-native';

import { klimaTalerEntry } from './entry';

// Keep native dismissal subscribed independently of the originating screen.
export const observeKlimaTaler = () => {
  const unsubscribe = klimaTalerEntry.subscribe(() => undefined);
  const appState = AppState.addEventListener('change', (next) => {
    if (next === 'active') void klimaTalerEntry.checkReturn();
  });
  return () => {
    appState.remove();
    unsubscribe();
  };
};
