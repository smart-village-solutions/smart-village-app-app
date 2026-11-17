// Serialize native changes so a late enable cannot override a subsequent disable.
export const createConfiguration = (setEnabled: (enabled: boolean) => Promise<void>) => {
  let enabled = false;
  let previous: boolean | undefined;
  let pending = Promise.resolve();
  let generation = 0;
  const apply = (next: boolean) => {
    enabled = next;
    if (previous === next) return;
    previous = next;
    const request = ++generation;
    pending = pending.catch(() => undefined).then(() => setEnabled(next));
    // Keep failures available to explicit entry/summary calls without an unhandled rejection.
    void pending.catch(() => {
      if (generation === request) previous = undefined;
    });
  };
  return {
    isEnabled: () => enabled,
    ready: () => {
      if (previous === undefined) apply(enabled);
      return pending;
    },
    setEnabled: apply
  };
};
