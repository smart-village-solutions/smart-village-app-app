/* eslint-disable complexity */
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext, useMemo, useState } from 'react';
import { RefreshControl } from 'react-native';
import { useQuery } from 'react-query';

import { NetworkContext } from '../../NetworkProvider';
import { SettingsContext } from '../../SettingsProvider';
import {
  Filter,
  ListComponent,
  SafeAreaViewFlex,
  StatusProps,
  SueLoadingIndicator,
  Wrapper
} from '../../components';
import { colors, consts } from '../../config';
import { parseListItemsFromQuery } from '../../helpers';
import { getQuery } from '../../queries';

type Props = {
  navigation: StackNavigationProp<Record<string, any>>;
  route: RouteProp<any, never>;
};

export const SueListScreen = ({ navigation, route }: Props) => {
  const { isConnected } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const { appDesignSystem = {} } = globalSettings;
  const { sueStatus = {} } = appDesignSystem;
  const { statuses }: { statuses: StatusProps[] } = sueStatus;
  const query = route.params?.query ?? '';
  const initialQueryVariables = route.params?.queryVariables ?? {
    start_date: '2020-01-01T00:00:00+01:00',
    isInitialStartDate: true
  };
  const [queryVariables, setQueryVariables] = useState(initialQueryVariables);
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery([query, queryVariables], () =>
    getQuery(query)(queryVariables)
  );

  const listItems = useMemo(() => {
    if (!data?.length) return [];

    return parseListItemsFromQuery(query, data, undefined, { appDesignSystem }).reverse();
  }, [data, query, queryVariables]);

  const refresh = async () => {
    setRefreshing(true);
    isConnected && (await refetch());
    setRefreshing(false);
  };

  return (
    <SafeAreaViewFlex>
      <ListComponent
        navigation={navigation}
        query={query}
        data={listItems}
        isLoading={isLoading}
        ListHeaderComponent={
          <Wrapper>
            <Filter
              filterTypes={[
                {
                  type: consts.FILTER_TYPES.DATE,
                  name: 'date',
                  data: [
                    { name: 'start_date', placeholder: 'Erstellt von' },
                    { name: 'end_date', placeholder: 'Erstellt bis' }
                  ]
                },
                {
                  type: consts.FILTER_TYPES.DROPDOWN,
                  label: 'Kategorie',
                  name: 'service_code',
                  data: [
                    {
                      id: 1,
                      index: 1,
                      value: 'Falschparker',
                      filterValue: 'TICKET_TYPE_FALSCHPARKER',
                      selected: false
                    },
                    {
                      id: 2,
                      index: 2,
                      value: 'Wilder Müll',
                      filterValue: 'TICKET_TYPE_WILDER_MUELL',
                      selected: false
                    }
                  ],
                  placeholder: 'Kategorie auswählen'
                },
                {
                  type: consts.FILTER_TYPES.SUE.STATUS,
                  label: 'Status',
                  name: 'status',
                  data: statuses
                }
              ]}
              initialFilters={initialQueryVariables}
              setQueryVariables={setQueryVariables}
            />
          </Wrapper>
        }
        ListFooterLoadingIndicator={SueLoadingIndicator}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
        showBackToTop
      />
    </SafeAreaViewFlex>
  );
};
