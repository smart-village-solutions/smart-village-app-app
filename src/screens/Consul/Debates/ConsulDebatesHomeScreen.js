import PropTypes from 'prop-types';
import React, { useState, useCallback } from 'react';
import { RefreshControl, Text } from 'react-native';

import { ListComponent, LoadingSpinner, SafeAreaViewFlex } from '../../../components';
import { parseListItemsFromQuery } from '../../../helpers';
import { colors } from '../../../config';
import { useConsulData } from '../../../hooks';

export const ConsulDebatesHomeScreen = ({ navigation, route }) => {
  const [refreshing, setRefreshing] = useState(false);
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

  const refresh = useCallback(
    async (refetch) => {
      setRefreshing(true);
      await refetch();
      setRefreshing(false);
    },
    [setRefreshing]
  );

  if (isLoading) return <LoadingSpinner loading />;

  // TODO: If Error true return error component
  if (isError) return <Text>{isError.message}</Text>;

  if (!listItems) return null;

  return (
    <SafeAreaViewFlex>
      <ListComponent
        navigation={navigation}
        query={query}
        data={listItems}
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

ConsulDebatesHomeScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired
  }).isRequired,
  route: PropTypes.object
};
