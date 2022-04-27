import { useFocusEffect } from '@react-navigation/native';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView } from 'react-native';

import {
  DebateDetail,
  DefaultKeyboardAvoidingView,
  EmptyMessage,
  LoadingSpinner,
  PollDetail,
  ProposalDetail,
  SafeAreaViewFlex,
  UserCommentDetail
} from '../../components';
import { colors, texts } from '../../config';
import { useConsulData } from '../../hooks';
import { QUERY_TYPES } from '../../queries';
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
      text: texts.consul.ok,
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

  useFocusEffect(
    useCallback(() => {
      refetch();

      return;
    }, [refetch])
  );

  if (isLoading) return <LoadingSpinner loading />;

  if (isError) showRegistrationFailAlert(navigation);

  const Component = getComponent(query);

  if (!Component || !data) return <EmptyMessage title={texts.empty.content} />;

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
          <Component data={data} navigation={navigation} route={route} onRefresh={refetch} />
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
