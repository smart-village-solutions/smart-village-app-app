import PropTypes from 'prop-types';
import React, { useCallback, useContext, useState } from 'react';
import { RefreshControl } from 'react-native';

import { DropdownHeader, ListComponent, SafeAreaViewFlex } from '../../components';
import { colors, consts } from '../../config';
import { parseListItemsFromQuery } from '../../helpers';
import {
  allGroups,
  myCalendar,
  myGroups,
  myGroupsFollowing,
  myMessages,
  myProfile,
  myTasks
} from '../../helpers/parser/volunteer';
import { useMatomoTrackScreenView } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { QUERY_TYPES } from '../../queries';

const { MATOMO_TRACKING, ROOT_ROUTE_NAMES } = consts;

export const VolunteerIndexScreen = ({ navigation, route }) => {
  const [refreshing, setRefreshing] = useState(false);
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const [queryVariables, setQueryVariables] = useState(route.params?.queryVariables ?? {});
  const title = route.params?.title ?? '';
  const titleDetail = route.params?.titleDetail ?? '';
  const bookmarkable = route.params?.bookmarkable;
  const showFilter = false;
  const query = route.params?.query ?? '';

  // useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.MORE);

  if (!query) return null;

  const data = {
    [QUERY_TYPES.VOLUNTEER.CALENDAR]: myCalendar(),
    [QUERY_TYPES.VOLUNTEER.GROUPS]: myGroups(),
    [QUERY_TYPES.VOLUNTEER.GROUPS_FOLLOWING]: myGroupsFollowing(),
    [QUERY_TYPES.VOLUNTEER.ALL_GROUPS]: allGroups(),
    [QUERY_TYPES.VOLUNTEER.MESSAGES]: myMessages(),
    [QUERY_TYPES.VOLUNTEER.PROFILE]: myProfile(),
    [QUERY_TYPES.VOLUNTEER.TASKS]: myTasks()
  }[query];

  // TODO: filter?
  const queryVariableForQuery = {
    [QUERY_TYPES.VOLUNTEER.CALENDAR]: 'categoryId',
    [QUERY_TYPES.VOLUNTEER.GROUPS]: 'categoryId',
    [QUERY_TYPES.VOLUNTEER.GROUPS_FOLLOWING]: 'categoryId',
    [QUERY_TYPES.VOLUNTEER.ALL_GROUPS]: 'categoryId',
    [QUERY_TYPES.VOLUNTEER.MESSAGES]: 'categoryId',
    [QUERY_TYPES.VOLUNTEER.PROFILE]: 'categoryId',
    [QUERY_TYPES.VOLUNTEER.TASKS]: 'categoryId'
  }[query];

  const refetch = () => undefined;

  const refresh = useCallback(
    async (refetch) => {
      setRefreshing(true);
      isConnected && (await refetch());
      setRefreshing(false);
    },
    [isConnected, setRefreshing]
  );

  const updateListData = useCallback(
    (selectedValue) => {
      if (selectedValue) {
        // remove a refetch key if present, which was necessary for the "- Alle -" selection
        delete queryVariables.refetch;

        setQueryVariables({
          ...queryVariables,
          [queryVariableForQuery]: selectedValue
        });
      } else {
        setQueryVariables((prevQueryVariables) => {
          // remove the filter key for the specific query, when selecting "- Alle -"
          delete prevQueryVariables[queryVariableForQuery];
          // need to spread the `prevQueryVariables` into a new object with additional refetch key
          // to force the Query component to update the data, otherwise it is not fired somehow
          // because the state variable wouldn't change
          return { ...prevQueryVariables, refetch: true };
        });
      }
    },
    [setQueryVariables, queryVariables]
  );

  let listItems = parseListItemsFromQuery(query, data, titleDetail, {
    bookmarkable,
    withDate: false,
    skipLastDivider: true
  });

  if (queryVariables.dateRange) {
    listItems = listItems.filter(
      (listItem) => listItem.params?.details?.listDate == queryVariables.dateRange
    );
  }

  if (!listItems) return null;

  return (
    <SafeAreaViewFlex>
      <ListComponent
        ListHeaderComponent={
          showFilter ? (
            <DropdownHeader {...{ query, queryVariables, data, updateListData }} />
          ) : null
        }
        navigation={navigation}
        data={listItems}
        sectionByDate={query === QUERY_TYPES.VOLUNTEER.CALENDAR}
        query={query}
        fetchMoreData={null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => refresh(refetch)}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
        showBackToTop
      />
    </SafeAreaViewFlex>
  );
};

VolunteerIndexScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
