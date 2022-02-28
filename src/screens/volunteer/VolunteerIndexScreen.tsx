import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { RefreshControl } from 'react-native';

import { DropdownHeader, ListComponent, SafeAreaViewFlex } from '../../components';
import { colors } from '../../config';
import { parseListItemsFromQuery } from '../../helpers';
import {
  additionalData,
  allGroups,
  myGroups,
  myGroupsFollowing,
  myMessages,
  myProfile,
  myTasks
} from '../../helpers/parser/volunteer';
import { useLogoutHeader, useVolunteerData } from '../../hooks';
import { QUERY_TYPES } from '../../queries';

// eslint-disable-next-line complexity
export const VolunteerIndexScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const [queryVariables, setQueryVariables] = useState(route.params?.queryVariables ?? {});
  const query = route.params?.query ?? '';
  const titleDetail = route.params?.titleDetail ?? '';
  const bookmarkable = route.params?.bookmarkable;
  const showFilter = false; // TODO: filter?
  const isCalendar =
    query === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL || query === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL_MY;
  const { data, isRefetching, refetch } = useVolunteerData({ query, queryVariables, isCalendar });

  useLogoutHeader({ query, navigation });

  // TODO: remove if all queries exist
  const details = {
    [QUERY_TYPES.VOLUNTEER.GROUPS]: myGroups(),
    [QUERY_TYPES.VOLUNTEER.GROUPS_FOLLOWING]: myGroupsFollowing(),
    [QUERY_TYPES.VOLUNTEER.ALL_GROUPS]: allGroups(),
    [QUERY_TYPES.VOLUNTEER.MESSAGES]: myMessages(),
    [QUERY_TYPES.VOLUNTEER.PROFILE]: myProfile(),
    [QUERY_TYPES.VOLUNTEER.TASKS]: myTasks(),
    [QUERY_TYPES.VOLUNTEER.ADDITIONAL]: additionalData()
  }[query];

  const listItems = parseListItemsFromQuery(query, data || details, titleDetail, {
    bookmarkable,
    withDate: false,
    skipLastDivider: true
  });

  if (!listItems) return null;

  return (
    <SafeAreaViewFlex>
      <ListComponent
        ListHeaderComponent={
          showFilter ? <DropdownHeader {...{ query: query, queryVariables, data }} /> : null
        }
        navigation={navigation}
        data={listItems}
        sectionByDate={isCalendar}
        query={query}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
        showBackToTop
      />
    </SafeAreaViewFlex>
  );
};
