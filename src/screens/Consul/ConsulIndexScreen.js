import PropTypes from 'prop-types';
import React, { useState, useCallback, useEffect } from 'react';
import { RefreshControl, Text } from 'react-native';

import { LoadingSpinner, SafeAreaViewFlex, Debates, Proposals } from '../../components';
import { parseListItemsFromQuery, sortingHelper } from '../../helpers';
import { colors } from '../../config';
import { useConsulData } from '../../hooks';
import { texts } from '../../config';
import { QUERY_TYPES } from '../../queries';
import { IndexFilterWrapperAndList } from '../../components';

const text = texts.consul.sorting;
const type = QUERY_TYPES.CONSUL.SORTING;
const queryType = QUERY_TYPES.CONSUL;

const INITIAL_TOP_SORTING = [
  { id: type.MOSTACTIVE, title: text.mostActive, selected: true },
  { id: type.HIGHESTRATED, title: text.highestRated, selected: false },
  { id: type.NEWESTDATE, title: text.newest, selected: false }
];

const getComponent = (query) => {
  const COMPONENTS = {
    [queryType.DEBATES]: Debates,
    [queryType.PROPOSALS]: Proposals
  };
  return COMPONENTS[query];
};

export const ConsulIndexScreen = ({ navigation, route }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [listData, setListData] = useState([]);
  const [sorting, setSorting] = useState(INITIAL_TOP_SORTING);
  const [sortingLoading, setSortingLoading] = useState(true);
  const bookmarkable = route.params?.bookmarkable;
  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? {};

  const { data, refetch, isLoading, isError } = useConsulData({
    query,
    queryVariables
  });

  const listItems = parseListItemsFromQuery(query, data, {
    bookmarkable,
    skipLastDivider: true
  });

  useEffect(() => {
    setSortingLoading(true);
    let type = sorting.find((data) => data.selected);
    sortingHelper(type.id, listItems)
      .then((val) => setListData(val))
      .then(() => setSortingLoading(false))
      .catch((err) => console.error(err));
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

  // TODO: If Error true return error component
  if (isError) return <Text>{isError.message}</Text>;

  if (!listData || !Component) return null;

  return (
    <SafeAreaViewFlex>
      <IndexFilterWrapperAndList filter={sorting} setFilter={setSorting} />

      <Component
        query={query}
        listData={listData}
        navigation={navigation}
        route={route}
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

ConsulIndexScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired
  }).isRequired,
  route: PropTypes.object
};
