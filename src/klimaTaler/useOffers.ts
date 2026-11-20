import { useCallback, useEffect, useRef, useState } from 'react';

import { OffersError } from './createOffersClient';
import { loadKlimaTalerOffers } from './offers';
import type { KlimaTalerOffers, OffersQuery } from './offersTypes';

export const useOffers = (query: OffersQuery | null) => {
  const key = JSON.stringify(query);
  const [state, setState] = useState<{
    loading: boolean;
    data?: KlimaTalerOffers;
    error?: OffersError | Error;
    key?: string;
  }>({ loading: true });
  const [blocked, setBlocked] = useState(false);
  const generation = useRef(0);
  const pending = useRef(false);
  const cooldown = useRef(0);
  const retryAt = state.error instanceof OffersError ? state.error.retryAt : undefined;
  const refresh = useCallback(async () => {
    if (!query || pending.current || cooldown.current > Date.now()) return;
    pending.current = true;
    const request = ++generation.current;
    setState((previous) => ({
      loading: true,
      key,
      data: previous.key === key ? previous.data : undefined
    }));
    try {
      const data = await loadKlimaTalerOffers(query);
      if (generation.current === request) setState({ loading: false, key, data });
    } catch (error) {
      if (generation.current === request) {
        cooldown.current = error instanceof OffersError ? error.retryAt ?? 0 : 0;
        setState((previous) => ({
          loading: false,
          key,
          data: previous.data,
          error: error as Error
        }));
      }
    } finally {
      if (generation.current === request) pending.current = false;
    }
  }, [query, key]);

  const cancel = useCallback(() => {
    generation.current++;
    pending.current = false;
  }, []);
  // Query changes remount this hook. Late results cannot update a closed or disabled screen.
  useEffect(() => {
    void refresh();
    return cancel;
  }, [refresh, cancel]);
  useEffect(() => {
    const delay = (retryAt ?? 0) - Date.now();
    setBlocked(delay > 0);
    if (delay <= 0) return;
    const timer = setTimeout(() => setBlocked(false), Math.min(delay, 2147483647));
    return () => clearTimeout(timer);
  }, [retryAt]);

  return {
    data: query && state.key === key ? state.data : undefined,
    error: query && state.key === key ? state.error : undefined,
    loading: !!query && (state.key !== key || state.loading),
    blocked: !!query && blocked,
    refresh
  };
};
