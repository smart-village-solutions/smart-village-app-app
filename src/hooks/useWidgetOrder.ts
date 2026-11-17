import { useCallback, useEffect, useState } from 'react';

import { addToStore, readFromStore } from '../helpers/storageHelper';

const STORAGE_KEY = 'PERSONALIZED_WIDGET_ORDER';

export const useWidgetOrder = (enabled: boolean) => {
  const [order, setOrder] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let active = true;
    readFromStore(STORAGE_KEY)
      .then((stored: unknown) => {
        if (active && Array.isArray(stored))
          setOrder(stored.filter((id) => typeof id === 'string'));
      })
      .catch(() => undefined)
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, []);

  const save = useCallback(async (nextOrder: string[]) => {
    await addToStore(STORAGE_KEY, nextOrder);
    setOrder(nextOrder);
  }, []);
  return { order: enabled ? order : [], loaded, save };
};
