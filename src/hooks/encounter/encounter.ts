import { useCallback, useEffect, useState } from 'react';

import { createEncounterAsync, getEncountersAsync } from '../../encounterApi';
import { Encounter, User } from '../../types';

export const useCreateEncounter = (
  onSuccess: (user: User) => void,
  onError: () => void
): {
  createEncounter: (qrId: string, userId: string) => void;
  loading: boolean;
} => {
  const [loading, setLoading] = useState(false);

  const createEncounter = useCallback(async (qrId: string) => {
    setLoading(true);
    try {
      const res = await createEncounterAsync(qrId);

      if (!res) {
        onError();
      } else {
        onSuccess(res);
      }
    } catch {
      onError();
    } finally {
      setLoading(false);
    }
  }, []);

  return { createEncounter, loading };
};

export const useEncounterList = (): {
  loading: boolean;
  data?: Encounter[];
} => {
  const [data, setData] = useState<Encounter[]>();
  const [loading, setLoading] = useState(true);

  const getEncounters = useCallback(async () => {
    const res = await getEncountersAsync();

    setData(res);
    setLoading(false);
  }, []);

  useEffect(() => {
    getEncounters();
  }, []);

  return { loading, data };
};
