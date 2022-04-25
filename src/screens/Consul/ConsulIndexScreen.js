import PropTypes from 'prop-types';
import React, { useState, useCallback, useEffect } from 'react';
import { RefreshControl, Alert } from 'react-native';

import {
  LoadingSpinner,
  SafeAreaViewFlex,
  Debates,
  Proposals,
  Polls,
  User
} from '../../components';
import { filterHelper, parseListItemsFromQuery, sortingHelper } from '../../helpers';
import { colors } from '../../config';
import { useConsulData } from '../../hooks';
import { texts } from '../../config';
import { QUERY_TYPES } from '../../queries';
import { IndexFilterWrapperAndList } from '../../components';
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
      text: texts.consul.tryAgain,
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
        sortingHelper(type.id, listItems).catch((err) => console.error(err));

      if (listItems) return listItems;
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

  const Component = getComponent(query);

  if (isLoading) return <LoadingSpinner loading />;

  if (isError) showRegistrationFailAlert(navigation);

  if ((query !== QUERY_TYPES.CONSUL.USER && !listItems) || !Component) return null;

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
        listData={listData(listItems)}
        data={data}
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
