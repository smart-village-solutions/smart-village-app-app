import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet } from 'react-native';

import {
  Button,
  DefaultKeyboardAvoidingView,
  DropdownHeader,
  ListComponent,
  LoadingSpinner,
  SafeAreaViewFlex,
  VolunteerPostTextField,
  Wrapper
} from '../../components';
import { colors, consts, texts } from '../../config';
import { parseListItemsFromQuery } from '../../helpers';
import { additionalData, myProfile, myTasks } from '../../helpers/parser/volunteer';
import {
  useConversationsHeader,
  useLogoutHeader,
  useOpenWebScreen,
  useVolunteerData
} from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import { ScreenName, VolunteerUser } from '../../types';

const { ROOT_ROUTE_NAMES } = consts;

// eslint-disable-next-line complexity
export const VolunteerIndexScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const [queryVariables] = useState(route.params?.queryVariables ?? {});
  const query = route.params?.query ?? '';
  const queryOptions = route.params?.queryOptions;
  const titleDetail = route.params?.titleDetail ?? '';
  const bookmarkable = route.params?.bookmarkable;
  const rootRouteName = route.params?.rootRouteName ?? '';
  const headerTitle = route.params?.title ?? '';
  const isGroupMember = route.params?.isGroupMember ?? false;
  const isAttendingEvent = route.params?.isAttendingEvent ?? false;
  const showFilter = false; // TODO: filter?
  const isCalendar =
    query === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL || query === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL_MY;
  const isPosts = query === QUERY_TYPES.VOLUNTEER.POSTS;

  const { data, isLoading, refetch } = useVolunteerData({
    query,
    queryVariables,
    queryOptions,
    isCalendar
  });

  // action to open source urls
  const openWebScreen = useOpenWebScreen(headerTitle, undefined, rootRouteName);

  useLogoutHeader({ query, navigation });
  useConversationsHeader({ query, navigation });
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  // TODO: remove if all queries exist
  const details = {
    [QUERY_TYPES.VOLUNTEER.PROFILE]: myProfile(),
    [QUERY_TYPES.VOLUNTEER.TASKS]: myTasks(),
    [QUERY_TYPES.VOLUNTEER.ADDITIONAL]: additionalData()
  }[query];

  const listItems = parseListItemsFromQuery(query, data || details, titleDetail, {
    bookmarkable,
    skipLastDivider: true,
    withDate: query === QUERY_TYPES.VOLUNTEER.CONVERSATIONS || isCalendar,
    isSectioned: isCalendar
  });

  if (isLoading) {
    return <LoadingSpinner loading />;
  }

  if (!listItems) return null;

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ListComponent
          ListHeaderComponent={
            <>
              {showFilter && <DropdownHeader {...{ query: query, queryVariables, data }} />}
              {isPosts && (
                <VolunteerPostTextField contentContainerId={queryVariables} refetch={refetch} />
              )}
            </>
          }
          navigation={navigation}
          data={listItems}
          sectionByDate={isCalendar}
          query={query}
          refetch={refetch}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refetch}
              colors={[colors.accent]}
              tintColor={colors.accent}
            />
          }
          showBackToTop
          openWebScreen={openWebScreen}
        />
        {(((query === QUERY_TYPES.VOLUNTEER.MEMBERS ||
          query === QUERY_TYPES.VOLUNTEER.APPLICANTS) &&
          isGroupMember) ||
          (query === QUERY_TYPES.VOLUNTEER.CALENDAR && isAttendingEvent)) && (
          <Wrapper style={styles.noPaddingBottom}>
            <Button
              onPress={() =>
                navigation.push(ScreenName.VolunteerForm, {
                  title: texts.volunteer.conversationAllStart,
                  query: QUERY_TYPES.VOLUNTEER.CONVERSATION,
                  rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER,
                  selectedUserIds: listItems.map(({ id }: VolunteerUser) => id)
                })
              }
              title={texts.volunteer.conversationAllStart}
            />
          </Wrapper>
        )}
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  noPaddingBottom: {
    paddingBottom: 0
  }
});
