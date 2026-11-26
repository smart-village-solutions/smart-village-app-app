import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import { addToStore, readFromStore } from './helpers/storageHelper';

const STORAGE_KEY = 'PERSONALIZED_WIDGET_ORDER';

export const WidgetOrderContext = createContext<
  { order: string[]; loaded: boolean; save: (order: string[]) => Promise<void> } | undefined
>(undefined);

export const WidgetOrderProvider = ({ children }: { children: React.ReactNode }) => {
  const [order, setOrder] = useState<string[]>();

  useEffect(() => {
    let active = true;
    readFromStore(STORAGE_KEY)
      .then((stored: unknown) => {
        if (active)
          setOrder(Array.isArray(stored) ? stored.filter((id) => typeof id === 'string') : []);
      })
      .catch(() => {
        if (active) setOrder([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const save = useCallback(async (nextOrder: string[]) => {
    await addToStore(STORAGE_KEY, nextOrder);
    setOrder(nextOrder);
  }, []);

  const context = useMemo(() => ({ order: order ?? [], loaded: true, save }), [order, save]);

  // Keep navigation (and the native splash dismissal) behind local preference hydration.
  // Home must never render a temporary default order, including after a screen remount.
  if (!order) return null;

  return <WidgetOrderContext.Provider value={context}>{children}</WidgetOrderContext.Provider>;
};
