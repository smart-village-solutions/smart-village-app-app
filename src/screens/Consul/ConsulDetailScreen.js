import PropTypes from 'prop-types';
import React, { useState, useCallback } from 'react';
import { Text, RefreshControl, ScrollView } from 'react-native';

import {
  LoadingSpinner,
  DebateDetail,
  ProposalDetail,
  PollDetail,
  UserCommentDetail,
  SafeAreaViewFlex,
  DefaultKeyboardAvoidingView
} from '../../components';
import { useConsulData } from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import { colors } from '../../config';

const queryType = QUERY_TYPES.CONSUL;

const getComponent = (query) => {
  const COMPONENTS = {
    [queryType.DEBATE]: DebateDetail,
    [queryType.PROPOSAL]: ProposalDetail,
    [queryType.POLL]: PollDetail,
    [queryType.PUBLIC_COMMENT]: UserCommentDetail
  };

  return COMPONENTS[query];
};

export const ConsulDetailScreen = ({ navigation, route }) => {
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
      <DefaultKeyboardAvoidingView>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => refresh(refetch)}
              colors={[colors.accent]}
              tintColor={colors.accent}
            />
          }
        >
          <Component
            listData={data}
            navigation={navigation}
            route={route}
            onRefresh={() => refresh(refetch)}
          />
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

ConsulDetailScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired
  }).isRequired,
  route: PropTypes.object
};
