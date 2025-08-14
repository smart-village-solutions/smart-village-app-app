import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { FlatList } from 'react-native';

import { LoadingSpinner, WrapperHorizontal } from '..';
import { readFromStore } from '../../helpers';
import { addMowasRegionalKeysToTokenOnServer } from '../../pushNotifications';
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

  const handleToggle = async (rs: string, makeActive: boolean) => {
    let next = selectedMowasRegionalKeys;

    if (makeActive) {
      next = selectedMowasRegionalKeys.filter((x) => x !== rs);
      dispatch({ type: MowasRegionalKeysActions.RemoveMowasRegionalKey, payload: rs });
    } else {
      next = [...selectedMowasRegionalKeys, rs];
      dispatch({ type: MowasRegionalKeysActions.AddMowasRegionalKey, payload: rs });
    }

    await addMowasRegionalKeysToTokenOnServer(next.map((id) => parseInt(id, 10)));
  };

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
              onActivate: () => handleToggle(item.rs, true), // kullanıcı açtı
              onDeactivate: () => handleToggle(item.rs, false) // kullanıcı kapattı
            }}
          />
        </WrapperHorizontal>
      )}
    />
  );
};
