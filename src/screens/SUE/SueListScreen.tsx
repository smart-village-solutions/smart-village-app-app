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

const SORT_BY = {
  REQUESTED_DATE_TIME: 'requestedDatetime',
  STATUS: 'status',
  TITLE: 'title',
  UPDATED_DATE_TIME: 'updatedDatetime'
};

const SORT_OPTIONS = [
  {
    value: 'Erstelldatum',
    selected: false,
    filterValue: SORT_BY.REQUESTED_DATE_TIME,
    index: 0,
    id: 0
  },
  {
    value: 'Ändernugsdatum',
    selected: false,
    filterValue: SORT_BY.UPDATED_DATE_TIME,
    index: 1,
    id: 1
  },
  { value: 'Betreff', selected: false, filterValue: SORT_BY.TITLE, index: 2, id: 2 },
  { value: 'Status', selected: false, filterValue: SORT_BY.STATUS, index: 3, id: 3 }
];

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

  const { data: servicesData } = useQuery([QUERY_TYPES.SUE.SERVICES, {}], () =>
    getQuery(QUERY_TYPES.SUE.SERVICES)({})
  );

  const servicesFilterData = useMemo(() => {
    if (!servicesData?.length) return;

    return servicesData.map((item: any, index: number) => ({
      selected: false,
      value: item.serviceName,
      filterValue: item.serviceCode,
      id: index,
      index
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

    let parsedListItem = parseListItemsFromQuery(query, data, undefined, {
      appDesignSystem
    }).reverse();

    if (queryVariables.sortBy) {
      const { sortBy } = queryVariables;

      parsedListItem = parsedListItem.sort((a, b) => {
        if (sortBy === SORT_BY.REQUESTED_DATE_TIME || sortBy === SORT_BY.UPDATED_DATE_TIME) {
          return new Date(b[sortBy]) - new Date(a[sortBy]);
        }

        return a[sortBy].localeCompare(b[sortBy]);
      });
    }

    return parsedListItem;
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
                  data: servicesFilterData,
                  placeholder: 'Kategorie auswählen'
                },
                {
                  type: FILTER_TYPES.SUE.STATUS,
                  label: 'Status',
                  name: 'status',
                  data: statuses
                },
                {
                  type: FILTER_TYPES.DROPDOWN,
                  label: 'Sortieren nach',
                  name: 'sortBy',
                  data: SORT_OPTIONS,
                  placeholder: 'Art auswählen'
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
