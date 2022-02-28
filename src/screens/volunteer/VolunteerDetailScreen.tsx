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
  VolunteerMessage,
  VolunteerMessageTextField,
  VolunteerTask
} from '../../components';
import { colors } from '../../config';
import {
  additionalData,
  allGroups,
  myGroups,
  myGroupsFollowing,
  myMessages,
  myTasks
} from '../../helpers/parser/volunteer';
import { getQuery, QUERY_TYPES } from '../../queries';

const getComponent = (query: string) => {
  const COMPONENTS = {
    [QUERY_TYPES.VOLUNTEER.CALENDAR]: VolunteerEventRecord,
    [QUERY_TYPES.VOLUNTEER.GROUPS]: PointOfInterest,
    [QUERY_TYPES.VOLUNTEER.GROUPS_FOLLOWING]: PointOfInterest,
    [QUERY_TYPES.VOLUNTEER.ALL_GROUPS]: PointOfInterest,
    [QUERY_TYPES.VOLUNTEER.MESSAGES]: VolunteerMessage,
    [QUERY_TYPES.VOLUNTEER.TASKS]: VolunteerTask,
    [QUERY_TYPES.VOLUNTEER.ADDITIONAL]: PointOfInterest
  };

  return COMPONENTS[query];
};

// eslint-disable-next-line complexity
export const VolunteerDetailScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? {};

  const { data, isLoading, isRefetching, refetch } = useQuery([query, queryVariables?.id], () =>
    getQuery(query)(queryVariables?.id)
  );

  // TODO: remove if all queries exist
  const details = {
    [QUERY_TYPES.VOLUNTEER.GROUPS]: myGroups(),
    [QUERY_TYPES.VOLUNTEER.GROUPS_FOLLOWING]: myGroupsFollowing(),
    [QUERY_TYPES.VOLUNTEER.ALL_GROUPS]: allGroups(),
    [QUERY_TYPES.VOLUNTEER.MESSAGES]: myMessages(),
    [QUERY_TYPES.VOLUNTEER.TASKS]: myTasks(),
    [QUERY_TYPES.VOLUNTEER.ADDITIONAL]: additionalData()
  }[query]?.find((entry: { id: number }) => entry.id == queryVariables.id);

  if (isLoading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  // we can have `data` from the query or `details` from the previous list view.
  // if there is no cached `data` or network fetched `data` we fallback to the `details`.
  if (!data && !details) return null;

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
          <Component
            data={data || details}
            refetch={refetch}
            navigation={navigation}
            route={route}
          />
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
