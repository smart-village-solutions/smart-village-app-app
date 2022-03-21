import PropTypes from 'prop-types';
import React, { useState, useCallback, useEffect } from 'react';
import { RefreshControl, Text } from 'react-native';

import {
  ListComponent,
  LoadingSpinner,
  SafeAreaViewFlex,
  WrapperRow,
  WrapperWithOrientation,
  ConsulSortingButtons
} from '../../../components';
import { parseListItemsFromQuery, sortingHelper } from '../../../helpers';
import { colors } from '../../../config';
import { useConsulData } from '../../../hooks';
import { texts } from '../../../config';
import { QUERY_TYPES } from '../../../queries';

const text = texts.consul.sorting;
const type = QUERY_TYPES.CONSUL.SORTING;

export const ConsulDebatesHomeScreen = ({ navigation, route }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [listData, setListData] = useState([]);
  const [orderType, setOrderType] = useState(type.MOSTACTIVE);
  const [orderLoading, setOrderLoading] = useState(true);
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
    setOrderLoading(true);
    sortingHelper(orderType, listItems)
      .then((val) => setListData(val))
      .then(() => setOrderLoading(false))
      .catch((err) => console.error(err));
  }, [orderType, isLoading]);

  const refresh = useCallback(
    async (refetch) => {
      setRefreshing(true);
      await refetch();
      setRefreshing(false);
    },
    [setRefreshing]
  );

  if (isLoading || orderLoading) return <LoadingSpinner loading />;

  // TODO: If Error true return error component
  if (isError) return <Text>{isError.message}</Text>;

  if (!listData) return null;

  return (
    <SafeAreaViewFlex>
      <WrapperWithOrientation>
        <WrapperRow center spaceAround>
          {sortingButtons.map((item, index) => (
            <ConsulSortingButtons
              buttonType="type2"
              item={item}
              key={index}
              orderType={orderType}
              onPress={() => setOrderType(item.type)}
            />
          ))}
        </WrapperRow>
      </WrapperWithOrientation>

      <ListComponent
        navigation={navigation}
        query={query}
        data={listData}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => refresh(refetch)}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
        showBackToTop
      />
    </SafeAreaViewFlex>
  );
};

const sortingButtons = [
  { title: text.mostActive, type: type.MOSTACTIVE },
  { title: text.newest, type: type.NEWESTDATE },
  { title: text.highestRated, type: type.HIGHESTRATED }
];

ConsulDebatesHomeScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired
  }).isRequired,
  route: PropTypes.object
};
