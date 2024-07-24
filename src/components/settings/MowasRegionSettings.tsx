import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { FlatList } from 'react-native';

import { LoadingSpinner, WrapperHorizontal } from '..';
import { readFromStore } from '../../helpers';
import { addMowasRegionalKeysToTokenOnServer } from '../../pushNotifications';
import { MOWAS_REGIONAL_KEYS, MowasFilterAction, mowasRegionalKeysReducer } from '../../reducers';
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
      type: MowasFilterAction.OverwriteMowasRegionalKeys,
      payload: ((await readFromStore(MOWAS_REGIONAL_KEYS)) ?? []) as string[]
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    !!mowasRegionalKeys?.length &&
      addMowasRegionalKeysToTokenOnServer(selectedMowasRegionalKeys.map((id) => parseInt(id, 10)));
  }, [selectedMowasRegionalKeys]);

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
              onActivate: () => {
                dispatch({ type: MowasFilterAction.RemoveMowasRegionalKey, payload: item.rs });
              },
              onDeactivate: () => {
                dispatch({ type: MowasFilterAction.AddMowasRegionalKey, payload: item.rs });
              }
            }}
          />
        </WrapperHorizontal>
      )}
    />
  );
};
