import { AppState } from 'react-native';

import { klimaTalerEntry } from './entry';
import { klimaTalerSummary } from './summary';

// Keep native dismissal subscribed even when no Home widget is mounted.
export const observeKlimaTaler = () => {
  let disposed = false;
  let previousPhase = klimaTalerEntry.getSnapshot().phase;
  const unsubscribe = klimaTalerEntry.subscribe(() => {
    const phase = klimaTalerEntry.getSnapshot().phase;
    const returning =
      ['idle', 'error'].includes(phase) && ['opening', 'open'].includes(previousPhase);
    previousPhase = phase;
    if (phase === 'opening') klimaTalerSummary.invalidate();
    if (returning) void klimaTalerSummary.refresh();
  });
  const appState = AppState.addEventListener('change', async (next) => {
    if (next === 'background') klimaTalerSummary.invalidate();
    if (next !== 'active') return;
    await klimaTalerEntry.checkReturn();
    if (!disposed && !['opening', 'open'].includes(klimaTalerEntry.getSnapshot().phase))
      void klimaTalerSummary.refresh({ reuse: true });
  });
  return () => {
    disposed = true;
    unsubscribe();
    appState.remove();
  };
};
