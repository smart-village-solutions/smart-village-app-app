import { useFocusEffect } from '@react-navigation/native';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl } from 'react-native';

import {
  Debates,
  IndexFilterWrapperAndList,
  LoadingSpinner,
  Polls,
  Proposals,
  SafeAreaViewFlex,
  User
} from '../../components';
import { colors, texts } from '../../config';
import { filterHelper, parseListItemsFromQuery, sortingHelper } from '../../helpers';
import { useConsulData } from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import { ScreenName } from '../../types';

const { MOSTACTIVE, HIGHESTRATED, NEWESTDATE } = QUERY_TYPES.CONSUL.SORTING;
const { CURRENT, EXPIRED } = QUERY_TYPES.CONSUL.FILTER;

const INITIAL_TOP_SORTING = [
  { id: MOSTACTIVE, title: texts.consul.sorting.mostActive, selected: true },
  { id: HIGHESTRATED, title: texts.consul.sorting.highestRated, selected: false },
  { id: NEWESTDATE, title: texts.consul.sorting.newest, selected: false }
];

const INITIAL_TOP_FILTERING_FOR_POLLS = [
  { id: CURRENT, title: texts.consul.filter.current, selected: true },
  { id: EXPIRED, title: texts.consul.filter.expired, selected: false }
];

const getComponent = (query) => {
  const COMPONENTS = {
    [QUERY_TYPES.CONSUL.DEBATES]: Debates,
    [QUERY_TYPES.CONSUL.PROPOSALS]: Proposals,
    [QUERY_TYPES.CONSUL.POLLS]: Polls,
    [QUERY_TYPES.CONSUL.USER]: User
  };

  return COMPONENTS[query];
};

const showRegistrationFailAlert = (navigation) =>
  Alert.alert(texts.consul.serverErrorAlertTitle, texts.consul.serverErrorAlertBody, [
    {
      text: texts.consul.ok,
      onPress: () => navigation?.navigate(ScreenName.ConsulHomeScreen)
    }
  ]);

/* eslint-disable complexity */
export const ConsulIndexScreen = ({ navigation, route }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [sortingType, setSortingType] = useState(INITIAL_TOP_SORTING);
  const [filterType, setFilterType] = useState(INITIAL_TOP_FILTERING_FOR_POLLS);
  const [queryVariables, setQueryVariables] = useState(route.params?.queryVariables ?? {});
  const bookmarkable = route.params?.bookmarkable;
  const query = route.params?.query ?? '';
  const extraQuery = route.params?.extraQuery ?? '';

  const { data, refetch, isLoading, isError } = useConsulData({
    query,
    queryVariables
  });

  const listItems = parseListItemsFromQuery(query, data, {
    bookmarkable,
    skipLastDivider: true
  });

  let type = sortingType.find((data) => data.selected);

  const listData = useCallback(
    (listItems) => {
      type = sortingType.find((data) => data.selected);

      if (query !== QUERY_TYPES.CONSUL.USER || query !== QUERY_TYPES.CONSUL.POLLS)
        listItems = sortingHelper(type.id, listItems);

      return listItems;
    },
    [sortingType, filterType, isLoading]
  );

  useEffect(() => {
    type = filterType.find((data) => data.selected);
    if (query === QUERY_TYPES.CONSUL.POLLS)
      filterHelper(type.id).then((val) => setQueryVariables(val));
  }, [filterType]);

  const refresh = useCallback(
    async (refetch) => {
      setRefreshing(true);
      await refetch();
      setRefreshing(false);
    },
    [setRefreshing]
  );

  useFocusEffect(
    useCallback(() => {
      refetch();

      return;
    }, [refetch])
  );
  const Component = getComponent(query);

  if (isLoading) return <LoadingSpinner loading />;

  if (isError) showRegistrationFailAlert(navigation);

  if (!Component) return null;

  return (
    <SafeAreaViewFlex>
      {query === QUERY_TYPES.CONSUL.POLLS && (
        <IndexFilterWrapperAndList filter={filterType} setFilter={setFilterType} />
      )}
      {query !== QUERY_TYPES.CONSUL.USER && query !== QUERY_TYPES.CONSUL.POLLS && (
        <IndexFilterWrapperAndList filter={sortingType} setFilter={setSortingType} />
      )}

      <Component
        query={query}
        data={query === QUERY_TYPES.CONSUL.USER ? data : listData(listItems)}
        navigation={navigation}
        route={route}
        extraQuery={extraQuery}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => refresh(refetch)}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
      />
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

ConsulIndexScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired
  }).isRequired,
  route: PropTypes.object
};
