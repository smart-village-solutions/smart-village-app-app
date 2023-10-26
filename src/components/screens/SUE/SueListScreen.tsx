/* eslint-disable complexity */
import React, { useContext, useMemo } from 'react';
import { View } from 'react-native';
import { useQuery } from 'react-query';

import { SettingsContext } from '../../../SettingsProvider';
import { parseListItemsFromQuery } from '../../../helpers';
import { getQuery } from '../../../queries';
import { ListComponent } from '../../ListComponent';

export const SueListScreen = ({ navigation, route }: { navigation: any; route: any }) => {
  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? {};
  const { globalSettings } = useContext(SettingsContext);

  const { data } = useQuery([query, queryVariables], () => getQuery(query)(queryVariables));

  const listItems = useMemo(() => {
    const parserData = parseListItemsFromQuery(query, data, undefined, {
      withDate: false
    });

    return parserData;
  }, [data, query, queryVariables]);

  return (
    <View>
      <ListComponent data={listItems} query={query} navigation={navigation} />
    </View>
  );
};
