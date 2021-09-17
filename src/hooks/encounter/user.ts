import { useCallback, useContext, useEffect, useState } from 'react';

import { showUserAsync } from '../../encounterApi';
import { getEncounterUserId } from '../../helpers';
import { NetworkContext } from '../../NetworkProvider';
import { User } from '../../types';

const loadUser = async () => {
  const userId = await getEncounterUserId();

  if (userId) {
    const user = await showUserAsync(userId);

    if (user) {
      return user;
    }
  }

  throw new Error('Error wile loading user: ' + userId ?? 'Missing user id');
};

export const useEncounterUser = (): {
  error: boolean;
  loading: boolean;
  refresh: () => void;
  refreshing: boolean;
  user?: User;
} => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User>();
  const [refreshing, setRefreshing] = useState(false);

  const loadUserCallback = useCallback(async () => {
    setRefreshing(true);
    setError(false);

    try {
      setUser(await loadUser());
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

  return { error, loading, refresh: loadUserCallback, refreshing, user };
};
