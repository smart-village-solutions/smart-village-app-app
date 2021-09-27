import { StackNavigationProp } from '@react-navigation/stack';
import { useCallback, useEffect, useState } from 'react';

import { createEncounterAsync, getEncountersAsync, pollEncountersAsync } from '../../encounterApi';
import { Encounter, ScreenName, User } from '../../types';

const ENCOUNTER_POLL_INTERVAL = 1000;

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

export const useEncounterPolling = (
  navigation: StackNavigationProp<any>,
  userId?: string,
  qrValue?: string
) => {
  useEffect(() => {
    let mounted = true;
    const intervalId = setInterval(() => {
      const fetchNewEncounters = async () => {
        if (userId && qrValue) {
          const encounters = await pollEncountersAsync(userId, qrValue);

          encounters.forEach((encounter, index) => {
            setTimeout(() => {
              mounted &&
                navigation.push(ScreenName.EncounterUserDetail, {
                  data: encounter,
                  fromPoll: true
                });
            }, index);
          });
        }
      };

      fetchNewEncounters();
    }, ENCOUNTER_POLL_INTERVAL);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [navigation, qrValue, userId]);
};
