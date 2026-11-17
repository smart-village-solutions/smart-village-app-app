import { ChangersError, createChangers } from '../../modules/expo-changers/src/api';
import { Statistics } from '../../modules/expo-changers/src/types';

export type SummaryState = {
  phase:
    | 'loading'
    | 'disabled'
    | 'unconfigured'
    | 'noSession'
    | 'ready'
    | 'empty'
    | 'error'
    | 'unsupported';
  coins?: number;
  stale?: boolean;
};

// Memory-only cache, scoped to the provider identity. Never activates or creates an account.
export const createSummary = (
  client: ReturnType<typeof createChangers>,
  isEnabled: () => boolean,
  ready: () => Promise<void> = () => Promise.resolve()
) => {
  let state: SummaryState = { phase: 'loading' };
  let cache: { uuid: string; coins: number } | undefined;
  let generation = 0;
  let pending: Promise<void> | undefined;
  let statisticsPending: Promise<Statistics> | undefined;
  let paused = false;
  let validatedAt: number | undefined;
  const listeners = new Set<() => void>();
  const set = (next: SummaryState) => {
    state = next;
    listeners.forEach((listener) => listener());
  };
  const identity = async (current: () => boolean) => {
    const status = await client.getStatus();
    if (!current()) return null;
    if (status.state === 'unconfigured') throw new ChangersError('E_CONFIGURATION', '');
    if (!status.activated || !status.initialized || !status.authenticated) return null;
    return client.getUserUUID();
  };
  const applyStatistics = (uuid: string, confirmedUUID: string | null, statistics: Statistics) => {
    if (confirmedUUID !== uuid) {
      cache = undefined;
      set({ phase: confirmedUUID ? 'empty' : 'noSession' });
    } else if (typeof statistics?.coins !== 'number' || !Number.isFinite(statistics.coins)) {
      cache = undefined;
      set({ phase: 'empty' });
    } else {
      cache = { uuid, coins: statistics.coins };
      set({ phase: 'ready', coins: statistics.coins });
    }
  };
  const recover = async (error: unknown, uuid: string | null, current: () => boolean) => {
    if (!current()) return;
    const code = error instanceof ChangersError ? error.code : '';
    if (code === 'E_SIMULATOR_UNSUPPORTED') {
      set({ phase: 'unsupported' });
      return;
    }
    if (code === 'E_AUTHENTICATION') {
      cache = undefined;
      set({ phase: 'noSession' });
      return;
    }
    if (['E_CONFIGURATION', 'E_NATIVE_UNAVAILABLE'].includes(code)) {
      set({ phase: 'unconfigured' });
      return;
    }
    let confirmedUUID: string | null = null;
    try {
      confirmedUUID = await identity(current);
    } catch {
      // Preserve private cache, hide values while identity cannot be verified.
    }
    if (!current()) return;
    if (confirmedUUID && confirmedUUID === uuid && cache?.uuid === uuid) {
      set({ phase: 'error', coins: cache.coins, stale: true });
    } else {
      set({ phase: 'error' });
    }
  };
  const finish = (requestGeneration: number) => {
    if (generation !== requestGeneration) return;
    pending = undefined;
    if (!['loading', 'error', 'disabled'].includes(state.phase)) validatedAt = Date.now();
  };
  // Invalidation hides stale results, but the native read still owns the SDK operation slot.
  const waitForIdle = async () => {
    while (statisticsPending) await statisticsPending.catch(() => undefined);
  };
  const readStatistics = async () => {
    const request = client.fetchStatistics();
    statisticsPending = request;
    try {
      return await request;
    } finally {
      if (statisticsPending === request) statisticsPending = undefined;
    }
  };
  const invalidate = () => {
    generation++;
    pending = undefined;
    validatedAt = undefined;
    set({ phase: isEnabled() ? 'loading' : 'disabled' });
  };
  return {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    // Hide data before provider/account changes and backgrounding. A later refresh must
    // revalidate identity before either cached or fresh values can become visible again.
    invalidate,
    pause: () => {
      if (paused) return;
      paused = true;
      invalidate();
    },
    resume: () => {
      paused = false;
    },
    waitForIdle,
    refresh: ({ reuse = false }: { reuse?: boolean } = {}): Promise<void> => {
      if (paused) return Promise.resolve();
      if (pending) return pending;
      if (reuse && validatedAt !== undefined && Date.now() - validatedAt < 5 * 60 * 1000)
        return Promise.resolve();
      validatedAt = undefined;
      const requestGeneration = ++generation;
      const current = () => generation === requestGeneration && isEnabled();
      set({ phase: 'loading' });
      pending = Promise.resolve().then(async () => {
        let uuid: string | null = null;
        try {
          if (!isEnabled()) {
            cache = undefined;
            set({ phase: 'disabled' });
            return;
          }
          await ready();
          if (!current()) return;
          uuid = await identity(current);
          if (!current()) return;
          if (!uuid) {
            cache = undefined;
            set({ phase: 'noSession' });
            return;
          }
          if (cache?.uuid !== uuid) cache = undefined;
          if (!client.capabilities.statistics.supported) {
            set({ phase: 'unsupported' });
            return;
          }
          await waitForIdle();
          if (!current()) return;
          const statistics = await readStatistics();
          if (!current()) return;
          const confirmedUUID = await identity(current);
          if (!current()) return;
          applyStatistics(uuid, confirmedUUID, statistics);
        } catch (error) {
          await recover(error, uuid, current);
        } finally {
          finish(requestGeneration);
        }
      });
      return pending;
    }
  };
};
