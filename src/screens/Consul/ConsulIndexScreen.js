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

const text = texts.consul.sorting;
const type = QUERY_TYPES.CONSUL.SORTING;
const queryType = QUERY_TYPES.CONSUL;

const INITIAL_TOP_SORTING = [
  { id: type.MOSTACTIVE, title: text.mostActive, selected: true },
  { id: type.HIGHESTRATED, title: text.highestRated, selected: false },
  { id: type.NEWESTDATE, title: text.newest, selected: false }
];

const INITIAL_TOP_FILTERING_FOR_POLLS = [
  { id: type.CURRENT, title: text.current, selected: true },
  { id: type.EXPIRED, title: text.expired, selected: false }
];

const getComponent = (query) => {
  const COMPONENTS = {
    [queryType.DEBATES]: Debates,
    [queryType.PROPOSALS]: Proposals,
    [queryType.POLLS]: Polls,
    [queryType.USER]: User
  };
  return COMPONENTS[query];
};

// Alerts
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
  const [listData, setListData] = useState([]);
  const [sorting, setSorting] = useState(
    route.params?.query === queryType.POLLS ? INITIAL_TOP_FILTERING_FOR_POLLS : INITIAL_TOP_SORTING
  );
  const [sortingLoading, setSortingLoading] = useState(false);
  const [queryVariables, setQueryVariables] = useState(route.params?.queryVariables ?? {});
  const bookmarkable = route.params?.bookmarkable;
  const query = route.params?.query ?? '';
  const extraQuery = route.params?.extraQuery ?? '';

  //GraphQL
  const { data, refetch, isLoading, isError } = useConsulData({
    query,
    queryVariables
  });

  let listItems = parseListItemsFromQuery(query, data, {
    bookmarkable,
    skipLastDivider: true
  });

  useEffect(() => {
    let type = sorting.find((data) => data.selected);
    let d = listItems;
    setSortingLoading(true);

    if (query === queryType.POLLS)
      filterHelper(type.id)
        .then((val) => setQueryVariables(val))
        .then(() => setSortingLoading(false))
        .catch((err) => console.error(err));

    if (query !== queryType.USER)
      sortingHelper(type.id, d)
        .then((val) => setListData(val))
        .then(() => setSortingLoading(false))
        .catch((err) => console.error(err));

    if (query === queryType.USER) setSortingLoading(false);
  }, [sorting, isLoading]);

  const refresh = useCallback(
    async (refetch) => {
      setRefreshing(true);
      await refetch();
      setRefreshing(false);
    },
    [setRefreshing]
  );

  const Component = getComponent(query);

  if (isLoading || sortingLoading) return <LoadingSpinner loading />;

  if (isError) showRegistrationFailAlert(navigation);

  if ((query !== queryType.USER && !listData) || !Component) return null;

  return (
    <SafeAreaViewFlex>
      {query !== queryType.USER && (
        <IndexFilterWrapperAndList filter={sorting} setFilter={setSorting} />
      )}

      <Component
        query={query}
        listData={listData}
        pollData={listItems}
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
