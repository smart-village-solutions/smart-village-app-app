import { StackScreenProps } from '@react-navigation/stack';
import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { useQuery } from 'react-query';

import {
  DefaultKeyboardAvoidingView,
  LoadingContainer,
  PointOfInterest,
  SafeAreaViewFlex,
  VolunteerEventRecord,
  VolunteerGroup,
  VolunteerMessage,
  VolunteerMessageTextField,
  VolunteerTask
} from '../../components';
import { colors } from '../../config';
import { additionalData, myMessages, myTasks } from '../../helpers/parser/volunteer';
import { getQuery, QUERY_TYPES } from '../../queries';
import { VolunteerQuery } from '../../types';

const getComponent = (query: VolunteerQuery) => {
  switch (query) {
    case QUERY_TYPES.VOLUNTEER.CALENDAR:
      return VolunteerEventRecord;
    case QUERY_TYPES.VOLUNTEER.GROUP:
      return VolunteerGroup;
    case QUERY_TYPES.VOLUNTEER.MESSAGES:
      return VolunteerMessage;
    case QUERY_TYPES.VOLUNTEER.TASKS:
      return VolunteerTask;
    case QUERY_TYPES.VOLUNTEER.ADDITIONAL:
      return PointOfInterest;
  }
};

export const VolunteerDetailScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? {};
  const details = route.params?.details;

  const { data, isLoading, isRefetching, refetch } = useQuery([query, queryVariables?.id], () =>
    getQuery(query)(queryVariables?.id)
  );

  if (isLoading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  // TODO: remove if all queries exist
  const dummyData = {
    [QUERY_TYPES.VOLUNTEER.MESSAGES]: myMessages(),
    [QUERY_TYPES.VOLUNTEER.TASKS]: myTasks(),
    [QUERY_TYPES.VOLUNTEER.ADDITIONAL]: additionalData()
  }[query]?.find((entry: { id: number }) => entry.id == queryVariables.id);

  // there could be no access to detailed, so we want to show the data we have already fetched
  // with index query as details
  const componentData = data?.code !== 403 ? data : details || dummyData;

  // we can have `data` from the query or `details` from the previous list view.
  // if there is no cached `data` or network fetched `data` we fallback to the `details`.
  if (!componentData) return null;

  const Component = getComponent(query);

  if (!Component) return null;

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[colors.accent]}
              tintColor={colors.accent}
            />
          }
        >
          <Component data={componentData} refetch={refetch} navigation={navigation} route={route} />
        </ScrollView>
        {query === QUERY_TYPES.VOLUNTEER.MESSAGES && <VolunteerMessageTextField />}
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

VolunteerDetailScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
