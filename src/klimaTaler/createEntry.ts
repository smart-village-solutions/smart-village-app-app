import { ChangersError, createChangers, isOfferId } from '../../modules/expo-changers/src/api';
import type { Status } from '../../modules/expo-changers/src/types';

type Client = ReturnType<typeof createChangers>;
type EntryState = { phase: 'idle' | 'opening' | 'open' | 'error'; errorCode?: string };

const canRegister = (status: Status, firstActivation: boolean) =>
  status.registrationState === 'notStarted' ||
  (status.registrationState === undefined && firstActivation);

// One coordinator for every native entry. It never stores credentials or logs SDK errors.
export const createEntry = (
  client: Client,
  isEnabled: () => boolean,
  ready?: () => Promise<void>
) => {
  let state: EntryState = { phase: 'idle' };
  let pending: Promise<void> | undefined;
  let generation = 0;
  const listeners = new Set<() => void>();
  let subscription: { remove(): void } | undefined;
  const set = (next: EntryState) => {
    state = next;
    listeners.forEach((listener) => listener());
  };
  const closed = () => {
    generation++;
    set({ phase: 'idle' });
  };
  const ensureSession = async (requestGeneration: number) => {
    const checkCurrent = () => {
      if (requestGeneration !== generation || !isEnabled())
        throw new ChangersError('E_CANCELLED', '');
    };
    if (ready) await ready();
    checkCurrent();
    let status = await client.getStatus();
    if (status.state === 'unconfigured') throw new ChangersError('E_CONFIGURATION', '');
    checkCurrent();
    const firstActivation = !status.activated;
    if (firstActivation || !status.initialized) status = await client.activate();
    checkCurrent();
    if (status.authenticated || !client.capabilities.registerUser.supported) return;
    const uuid = await client.getUserUUID();
    checkCurrent();
    if (uuid) {
      await client.loginUser(uuid);
    } else if (canRegister(status, firstActivation)) {
      await client.registerUser();
    } else {
      // A lost/invalid existing session must not silently create a second account.
      throw new ChangersError(
        status.registrationState === 'uncertain' ? 'E_REGISTRATION_UNCERTAIN' : 'E_AUTHENTICATION',
        ''
      );
    }
  };
  const open = (offerId?: number): Promise<void> => {
    if (pending) return state.phase === 'idle' ? pending.then(() => open(offerId)) : pending;
    if (state.phase === 'open' && offerId === undefined) return Promise.resolve();
    if (!isEnabled()) {
      set({ phase: 'error', errorCode: 'E_DISABLED' });
      return Promise.resolve();
    }
    if (
      offerId !== undefined &&
      (!isOfferId(offerId) || !client.capabilities.offerDetails.supported)
    ) {
      set({
        phase: 'error',
        errorCode: isOfferId(offerId) ? 'E_NATIVE_UNAVAILABLE' : 'E_INVALID_ARGUMENT'
      });
      return Promise.resolve();
    }
    const requestGeneration = ++generation;
    set({ phase: 'opening' });
    pending = (async () => {
      try {
        await ensureSession(requestGeneration);
        if (requestGeneration !== generation || !isEnabled()) return;
        if (offerId === undefined) await client.openProvider();
        else await client.openOffer(offerId);
        if (requestGeneration === generation && isEnabled()) set({ phase: 'open' });
        else await client.closeProvider();
      } catch (error) {
        if (requestGeneration === generation) {
          set({
            phase: 'error',
            errorCode: error instanceof ChangersError ? error.code : 'E_PROVIDER'
          });
        }
      } finally {
        pending = undefined;
      }
    })();
    return pending;
  };
  return {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      subscription ??= client.addProviderClosedListener(closed);
      return () => {
        listeners.delete(listener);
        if (!listeners.size) {
          subscription?.remove();
          subscription = undefined;
        }
      };
    },
    open,
    checkReturn: async () => {
      if (state.phase !== 'open') return;
      const requestGeneration = generation;
      try {
        const status = await client.getStatus();
        if (requestGeneration === generation && !status.providerOpen) closed();
      } catch {
        // A temporary status failure is neither a logout nor confirmation of dismissal.
      }
    },
    cancel: () => {
      const wasOpen = state.phase === 'open' || state.phase === 'opening';
      closed();
      if (wasOpen) void client.closeProvider().catch(() => undefined);
    }
  };
};
