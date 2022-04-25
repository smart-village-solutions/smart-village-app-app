import PropTypes from 'prop-types';
import React, { useState, useCallback } from 'react';
import { Alert, RefreshControl, ScrollView } from 'react-native';

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
import { colors, texts } from '../../config';
import { ScreenName } from '../../types';

const getComponent = (query) => {
  const COMPONENTS = {
    [QUERY_TYPES.CONSUL.DEBATE]: DebateDetail,
    [QUERY_TYPES.CONSUL.PROPOSAL]: ProposalDetail,
    [QUERY_TYPES.CONSUL.POLL]: PollDetail,
    [QUERY_TYPES.CONSUL.PUBLIC_COMMENT]: UserCommentDetail
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

  if (isError) return showRegistrationFailAlert(navigation);

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
            onRefresh={() => refetch()}
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
