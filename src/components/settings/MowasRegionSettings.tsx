import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { FlatList } from 'react-native';

import { LoadingSpinner, WrapperHorizontal } from '..';
import { readFromStore } from '../../helpers';
import {
  addMowasRegionalKeysToTokenOnServer,
  serverConnectionAlert
} from '../../pushNotifications';
import {
  MOWAS_REGIONAL_KEYS,
  MowasRegionalKeysActions,
  mowasRegionalKeysReducer
} from '../../reducers';
import { SettingsToggle } from '../SettingsToggle';

type MowasRegionalKeys = {
  name: string;
  rs: string;
}[];

const keyExtractor = (item: { rs: string }, index: number) => `index${index}-rs${item.rs}`;

export const MowasRegionSettings = ({
  mowasRegionalKeys
}: {
  mowasRegionalKeys: MowasRegionalKeys;
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedMowasRegionalKeys, dispatch] = useReducer(mowasRegionalKeysReducer, []);

  const loadFilters = useCallback(async () => {
    setLoading(true);

    dispatch({
      type: MowasRegionalKeysActions.OverwriteMowasRegionalKeys,
      payload: ((await readFromStore(MOWAS_REGIONAL_KEYS)) ?? []) as string[]
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  const handleToggle = useCallback(
    async (rs: string, nextEnabled: boolean) => {
      const isCurrentlyEnabled = !selectedMowasRegionalKeys.includes(rs);
      if (isCurrentlyEnabled === nextEnabled) return;

      const nextList = nextEnabled
        ? selectedMowasRegionalKeys.filter((x) => x !== rs)
        : [...selectedMowasRegionalKeys, rs];

      // optimistic update
      dispatch({
        type: nextEnabled
          ? MowasRegionalKeysActions.RemoveMowasRegionalKey
          : MowasRegionalKeysActions.AddMowasRegionalKey,
        payload: rs
      });

      try {
        await addMowasRegionalKeysToTokenOnServer(nextList.map((id) => parseInt(id, 10)));
      } catch (e) {
        // rollback on failure
        dispatch({
          type: nextEnabled
            ? MowasRegionalKeysActions.AddMowasRegionalKey
            : MowasRegionalKeysActions.RemoveMowasRegionalKey,
          payload: rs
        });
        console.error('Failed to update MOWAS regional keys on server', e);
        serverConnectionAlert(false);
      }
    },
    [selectedMowasRegionalKeys, dispatch]
  );

  if (!mowasRegionalKeys?.length || loading) {
    return <LoadingSpinner loading />;
  }

  return (
    <FlatList
      data={mowasRegionalKeys}
      keyExtractor={keyExtractor}
      renderItem={({ item }) => (
        <WrapperHorizontal>
          <SettingsToggle
            item={{
              title: item.name,
              bottomDivider: true,
              value: !selectedMowasRegionalKeys.includes(item.rs),
              onActivate: () => handleToggle(item.rs, true),
              onDeactivate: () => handleToggle(item.rs, false)
            }}
          />
        </WrapperHorizontal>
      )}
    />
  );
};
