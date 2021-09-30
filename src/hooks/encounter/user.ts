import { useCallback, useContext, useEffect, useState } from 'react';

import { showUserAsync } from '../../encounterApi';
import { getEncounterUserId } from '../../helpers';
import { NetworkContext } from '../../NetworkProvider';
import { User } from '../../types';

const loadUser = async (userId: string) => {
  const user = await showUserAsync(userId);

  if (user) {
    return user;
  }

  throw new Error('Error while loading user: ' + userId);
};

export const useEncounterUser = (): {
  error: boolean;
  loading: boolean;
  refresh: () => void;
  refreshing: boolean;
  user?: User;
  userId?: string;
} => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User>();
  const [userId, setUserId] = useState<string>();
  const [refreshing, setRefreshing] = useState(false);

  const loadUserCallback = useCallback(async () => {
    setRefreshing(true);
    setError(false);

    try {
      const storedId = await getEncounterUserId();
      setUserId(storedId || undefined);

      if (storedId) {
        setUser(await loadUser(storedId));
      }
    } catch (e) {
      console.warn(e);
      setError(true);
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (isConnected && isMainserverUp && !user) {
      loadUserCallback();
    } else {
      setLoading(false);
      setError(true);
    }
  }, [isConnected, isMainserverUp, loadUserCallback]);

  return { error, loading, refresh: loadUserCallback, refreshing, user, userId };
};
