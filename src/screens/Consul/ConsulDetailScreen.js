import PropTypes from 'prop-types';
import React, { useState, useCallback } from 'react';
import { Text, RefreshControl, ScrollView } from 'react-native';

import { LoadingSpinner, DebateDetail, SafeAreaViewFlex } from '../../components';
import { useConsulData } from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import { colors } from '../../config';

const queryType = QUERY_TYPES.CONSUL;

const getComponent = (query) => {
  const COMPONENTS = {
    [queryType.DEBATE]: DebateDetail
  };

  return COMPONENTS[query];
};

export const ConsulDetailScreen = ({ route }) => {
  const [refreshing, setRefreshing] = useState(false);
  const queryVariables = route.params?.queryVariables ?? {};
  const query = route.params?.query ?? '';

  const { data, refetch, isLoading, isError } = useConsulData({
    query,
    queryVariables
  });

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

  // TODO: If Error true return error component
  if (isError) return <Text>{isError.message}</Text>;

  if (!data || !Component) return null;

  return (
    <SafeAreaViewFlex>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => refresh(refetch)}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
      >
        <Component listData={data} route={route} onRefresh={() => refresh(refetch)} />
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

ConsulDetailScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired
  }).isRequired,
  route: PropTypes.object
};
