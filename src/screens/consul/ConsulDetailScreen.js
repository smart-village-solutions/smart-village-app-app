import { useFocusEffect } from '@react-navigation/native';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { Alert, ScrollView } from 'react-native';

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
import { texts } from '../../config';
import { useConsulData, usePullToRefetch } from '../../hooks';
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
  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? {};

  const { data, refetch, isLoading, isError } = useConsulData({
    query,
    queryVariables
  });

  const RefreshControl = usePullToRefetch(refetch);

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
        <ScrollView keyboardShouldPersistTaps="handled" refreshControl={RefreshControl}>
          <Component data={data} navigation={navigation} route={route} refetch={refetch} />
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

ConsulDetailScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object
};
