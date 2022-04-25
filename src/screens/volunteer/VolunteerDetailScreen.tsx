import { StackScreenProps } from '@react-navigation/stack';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { useQuery } from 'react-query';

import {
  DefaultKeyboardAvoidingView,
  LoadingSpinner,
  PointOfInterest,
  SafeAreaViewFlex,
  VolunteerEventRecord,
  VolunteerGroup,
  VolunteerMessage,
  VolunteerMessageTextField,
  VolunteerTask,
  VolunteerUser
} from '../../components';
import { colors } from '../../config';
import { additionalData, myTasks } from '../../helpers/parser/volunteer';
import { getQuery, QUERY_TYPES } from '../../queries';
import { VolunteerQuery } from '../../types';

const getComponent = (query: VolunteerQuery): any => {
  switch (query) {
    case QUERY_TYPES.VOLUNTEER.CALENDAR:
      return VolunteerEventRecord;
    case QUERY_TYPES.VOLUNTEER.GROUP:
      return VolunteerGroup;
    case QUERY_TYPES.VOLUNTEER.CONVERSATION:
      return VolunteerMessage;
    case QUERY_TYPES.VOLUNTEER.TASKS:
      return VolunteerTask;
    case QUERY_TYPES.VOLUNTEER.ADDITIONAL:
      return PointOfInterest;
    case QUERY_TYPES.VOLUNTEER.USER:
      return VolunteerUser;
  }
};

export const VolunteerDetailScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? {};
  const queryOptions = route.params?.queryOptions ?? {};
  const details = route.params?.details;

  // TODO: remove if all queries exist
  const dummyData = {
    [QUERY_TYPES.VOLUNTEER.TASKS]: myTasks(),
    [QUERY_TYPES.VOLUNTEER.ADDITIONAL]: additionalData()
  }[query]?.find((entry: { id: number }) => entry.id == queryVariables.id);

  const { data, isLoading, refetch, isRefetching } = useQuery(
    [query, queryVariables?.id],
    () => getQuery(query)(queryVariables?.id),
    {
      ...queryOptions,
      enabled: !dummyData // the query will not execute if there is dummy data
    }
  );

  if (isLoading) {
    return <LoadingSpinner loading />;
  }

  // there could be no access to detailed, so we want to show the data we have already fetched
  // with index query as details
  const componentData = dummyData || (data?.code !== 403 ? data : details);

  // we can have `data` from the query or `details` from the previous list view.
  // if there is no cached `data` or network fetched `data` we fallback to the `details`.
  if (!componentData) return null;

  const Component = getComponent(query);

  if (!Component) return null;

  if (query === QUERY_TYPES.VOLUNTEER.CONVERSATION) {
    return (
      <SafeAreaViewFlex>
        <DefaultKeyboardAvoidingView>
          <ScrollView ref={scrollViewRef}>
            <Component data={componentData} conversationId={queryVariables.id} />
          </ScrollView>
          <VolunteerMessageTextField
            conversationId={queryVariables.id}
            refetch={refetch}
            dataCount={data.results.length}
            scrollToBottom={(animated = true) => scrollViewRef?.current?.scrollToEnd({ animated })}
          />
        </DefaultKeyboardAvoidingView>
      </SafeAreaViewFlex>
    );
  }

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => !dummyData && refetch()}
              colors={[colors.accent]}
              tintColor={colors.accent}
            />
          }
          keyboardShouldPersistTaps="handled"
        >
          <Component
            data={componentData}
            refetch={refetch}
            isRefetching={isRefetching}
            navigation={navigation}
            route={route}
          />
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

VolunteerDetailScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
