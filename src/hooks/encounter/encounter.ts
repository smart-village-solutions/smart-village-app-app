import { StackNavigationProp } from '@react-navigation/stack';
import { useCallback, useEffect, useState } from 'react';

import { createEncounterAsync, getEncountersAsync } from '../../encounterApi';
import { Encounter, ScreenName, User } from '../../types';

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

const POLLING_INTERVAL = 1000;

const dummy: User = {
  birthDate: new Date(42).toISOString(),
  firstName: 'Max',
  imageUri: 'https://smart-village.solutions/wp-content/uploads/2020/01/Services.png',
  lastName: 'Mustermann',
  phone: '0123 123123',
  verified: false
};

export const usePollingForEncounters = (navigation: StackNavigationProp<any>, qrId?: string) => {
  useEffect(() => {
    if (!qrId) {
      return;
    }

    const intervalId = setInterval(() => {
      // TODO: use API call here
      // TODO: check if we need/want a "mounted" variable here
      const testing = false;
      const newScans = testing ? new Array<User>(Math.floor(Math.random() * 3)).fill(dummy) : [];

      newScans.forEach((data) => {
        navigation.push(ScreenName.EncounterUserDetail, { data, fromPoll: true });
      });
      // parse new data from result (createdAt filter for query?)
      // navigation.push onto user detail screen when new data has been added (for each new set of data)
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [navigation, qrId]);
};
