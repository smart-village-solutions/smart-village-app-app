import { useCallback, useState } from 'react';

import { isUser } from '../../jsonValidation';
import { Encounter, User } from '../../types';

const createEncounterAsync = async (
  qrId: string,
  userId: string
): Promise<{ data?: User; error: boolean }> => {
  // TODO: implement API Call
  const res = {
    birthDate: new Date(42).toISOString(),
    createdAt: new Date(1337).toISOString(),
    firstName: 'Max',
    imageUri: 'https://smart-village.solutions/wp-content/uploads/2020/01/Services.png',
    lastName: 'Mustermann',
    phone: '0123 123123',
    userId: 'userId',
    verified: false,
    village: 'Utopia'
  };

  const error = !isUser(res);

  return {
    data: error ? undefined : res,
    error
  };
};

export const useCreateEncounter = (
  onSuccess: (user: User) => void,
  onError: () => void
): {
  createEncounter: (qrId: string, userId: string) => void;
  loading: boolean;
} => {
  const [loading, setLoading] = useState(false);

  const createEncounter = useCallback(async (qrId: string, userId: string) => {
    setLoading(true);
    try {
      const res = await createEncounterAsync(qrId, userId);

      if (!res.data || res.error) {
        onError();
      } else {
        onSuccess(res.data);
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
