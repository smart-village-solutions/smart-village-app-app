/* eslint-disable complexity */
import React, { useContext, useMemo } from 'react';
import { View } from 'react-native';
import { useQuery } from 'react-query';

import { SettingsContext } from '../../../SettingsProvider';
import { sueParser } from '../../../helpers';
import { getQuery } from '../../../queries';
import { ListComponent } from '../../ListComponent';

export const SueListScreen = ({ navigation, route }: { navigation: any; route: any }) => {
  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? {};
  const { globalSettings } = useContext(SettingsContext);

  const { data } = useQuery([query, queryVariables], () => getQuery(query)(queryVariables));

  const listItems = useMemo(() => {
    const parserData = sueParser(query, data);

    return parserData;
  }, [data, query, queryVariables]);

  return (
    <View>
      <ListComponent data={listItems} query={query} navigation={navigation} />
    </View>
  );
};
