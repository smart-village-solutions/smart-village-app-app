import { useCallback, useState } from 'react';

import { createEncounterAsync } from '../../encounterApi';
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

const dummyEncounters: Encounter[] = [
  { createdAt: new Date().toISOString(), encounterId: '32155' },
  { createdAt: new Date().toISOString(), encounterId: '12125' },
  { createdAt: new Date().toISOString(), encounterId: '92444' },
  { createdAt: new Date().toISOString(), encounterId: '42185' }
];

export const useEncounterList = (): { loading: boolean; data: Encounter[] } => {
  // TODO: implement api call
  return { data: dummyEncounters, loading: false };
};
