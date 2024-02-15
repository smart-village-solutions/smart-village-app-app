/* eslint-disable complexity */
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext, useEffect, useMemo, useState } from 'react';
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
import { QUERY_TYPES, getQuery } from '../../queries';

const { FILTER_TYPES } = consts;

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
    initial_start_date: '2020-01-01T00:00:00+01:00'
  };
  const [queryVariables, setQueryVariables] = useState(initialQueryVariables);
  const [refreshing, setRefreshing] = useState(false);
  const [isOpening, setIsOpening] = useState(true);

  const { data, isLoading, refetch } = useQuery(
    [
      query,
      {
        ...queryVariables,
        start_date: queryVariables.start_date || queryVariables.initial_start_date
      }
    ],
    () =>
      getQuery(query)({
        ...queryVariables,
        start_date: queryVariables.start_date || queryVariables.initial_start_date
      })
  );

  const { data: servicesData } = useQuery([QUERY_TYPES.SUE.SERVICES], () =>
    getQuery(QUERY_TYPES.SUE.SERVICES)()
  );

  const services = useMemo(() => {
    if (!servicesData?.length) return;

    return servicesData.map((item: any, index: number) => ({
      filterValue: item.serviceCode,
      id: index,
      index,
      selected: false,
      value: item.serviceName
    }));
  }, [servicesData]);

  // there is some peformance issue with rendering the screen so we return null first
  useEffect(() => {
    setTimeout(() => {
      setIsOpening(false);
    }, 50);
  }, []);

  const listItems = useMemo(() => {
    if (!data?.length) return [];

    return parseListItemsFromQuery(query, data, undefined, { appDesignSystem }).reverse();
  }, [data, query, queryVariables]);

  const refresh = async () => {
    setRefreshing(true);
    isConnected && (await refetch());
    setRefreshing(false);
  };

  if (isOpening) return null;

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
                  type: FILTER_TYPES.DATE,
                  name: 'date',
                  data: [
                    { name: 'start_date', placeholder: 'Erstellt von' },
                    { name: 'end_date', placeholder: 'Erstellt bis' }
                  ]
                },
                {
                  type: FILTER_TYPES.DROPDOWN,
                  label: 'Kategorie',
                  name: 'service_code',
                  data: services,
                  placeholder: 'Kategorie auswählen'
                },
                {
                  type: FILTER_TYPES.SUE.STATUS,
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
