import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
import { FlatList, RefreshControl, ScrollView } from 'react-native';

import {
  allGroups,
  myCalendar,
  myGroups,
  myGroupsFollowing,
  myMessages,
  myTasks
} from '../../helpers/parser/volunteer';
import {
  DefaultKeyboardAvoidingView,
  EventRecord,
  PointOfInterest,
  RegularText,
  SafeAreaViewFlex,
  VolunteerMessage,
  VolunteerMessageTextField,
  VolunteerTask
} from '../../components';
import { colors } from '../../config';
import { NetworkContext } from '../../NetworkProvider';
import { QUERY_TYPES } from '../../queries';

const getComponent = (query) => {
  const COMPONENTS = {
    [QUERY_TYPES.VOLUNTEER.CALENDAR]: EventRecord,
    [QUERY_TYPES.VOLUNTEER.GROUPS]: PointOfInterest,
    [QUERY_TYPES.VOLUNTEER.GROUPS_FOLLOWING]: PointOfInterest,
    [QUERY_TYPES.VOLUNTEER.ALL_GROUPS]: PointOfInterest,
    [QUERY_TYPES.VOLUNTEER.MESSAGES]: VolunteerMessage,
    [QUERY_TYPES.VOLUNTEER.TASKS]: VolunteerTask
  };

  return COMPONENTS[query];
};

export const VolunteerDetailScreen = ({ navigation, route }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? {};

  const [refreshing, setRefreshing] = useState(false);

  if (!query) return null;

  const data = {
    [QUERY_TYPES.VOLUNTEER.CALENDAR]: myCalendar(),
    [QUERY_TYPES.VOLUNTEER.GROUPS]: myGroups(),
    [QUERY_TYPES.VOLUNTEER.GROUPS_FOLLOWING]: myGroupsFollowing(),
    [QUERY_TYPES.VOLUNTEER.ALL_GROUPS]: allGroups(),
    [QUERY_TYPES.VOLUNTEER.MESSAGES]: myMessages(),
    [QUERY_TYPES.VOLUNTEER.TASKS]: myTasks()
  }[query];

  const details = data.find((entry) => entry.id == queryVariables.id);

  const refetch = () => undefined;

  const refresh = async (refetch) => {
    setRefreshing(true);
    isConnected && (await refetch());
    setRefreshing(false);
  };

  // we can have `data` from GraphQL or `details` from the previous list view.
  // if there is no cached `data` or network fetched `data` we fallback to the `details`.
  if (!details) return null;

  const Component = getComponent(query);

  if (!Component) return null;

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
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
          <Component data={details} navigation={navigation} route={route} />
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
