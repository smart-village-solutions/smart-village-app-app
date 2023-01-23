import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet } from 'react-native';

import {
  Button,
  Calendar,
  CalendarListToggle,
  DefaultKeyboardAvoidingView,
  EmptyMessage,
  ListComponent,
  LoadingSpinner,
  SafeAreaViewFlex,
  VolunteerPostTextField,
  Wrapper
} from '../../components';
import { colors, consts, texts } from '../../config';
import {
  useCalendarsHeader,
  useConversationsHeader,
  useGroupsHeader,
  useOpenWebScreen,
  useVolunteerData
} from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import { ScreenName, VolunteerUser } from '../../types';

const { ROOT_ROUTE_NAMES } = consts;

// eslint-disable-next-line complexity
export const VolunteerIndexScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const [queryVariables] = useState(route.params?.queryVariables ?? {});
  const [showCalendar, setShowCalendar] = useState(false);
  const query = route.params?.query ?? '';
  const queryOptions = route.params?.queryOptions;
  const titleDetail = route.params?.titleDetail ?? '';
  const bookmarkable = route.params?.bookmarkable;
  const rootRouteName = route.params?.rootRouteName ?? '';
  const headerTitle = route.params?.title ?? '';
  const isGroupMember = route.params?.isGroupMember ?? false;
  const isAttendingEvent = route.params?.isAttendingEvent ?? false;
  // const showFilter = false; // TODO: filter?
  const isCalendar =
    query === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL || query === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL_MY;
  const isPosts = query === QUERY_TYPES.VOLUNTEER.POSTS;
  const hasDailyFilterSelection = !!queryVariables.dateRange;

  const { data, isLoading, refetch } = useVolunteerData({
    query,
    queryVariables,
    queryOptions,
    isCalendar,
    titleDetail,
    bookmarkable,
    onlyUpcoming: !showCalendar
  });

  // action to open source urls
  const openWebScreen = useOpenWebScreen(headerTitle, undefined, rootRouteName);

  useConversationsHeader({ query, navigation, route });
  useCalendarsHeader({ query, navigation, route });
  useGroupsHeader({ query, navigation, route });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  if (isLoading) {
    return <LoadingSpinner loading />;
  }

  if (!data) return null;

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        {isCalendar && !hasDailyFilterSelection && (
          <CalendarListToggle showCalendar={showCalendar} setShowCalendar={setShowCalendar} />
        )}
        <ListComponent
          ListHeaderComponent={
            <>
              {/* {showFilter && <DropdownHeader {...{ query: query, queryVariables, data }} />} */}
              {isPosts && isGroupMember && (
                <VolunteerPostTextField
                  contentContainerId={queryVariables?.contentContainerId}
                  refetch={refetch}
                />
              )}
            </>
          }
          ListEmptyComponent={
            showCalendar ? (
              <Calendar
                query={query}
                queryVariables={queryVariables}
                calendarData={data}
                isLoading={isLoading}
                navigation={navigation}
              />
            ) : (
              <EmptyMessage title={texts.empty.list} />
            )
          }
          navigation={navigation}
          data={isCalendar && showCalendar ? [] : data}
          sectionByDate={isCalendar && !showCalendar}
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
          (query === QUERY_TYPES.VOLUNTEER.CALENDAR && isAttendingEvent)) &&
          data?.length > 1 && (
            <Wrapper style={styles.noPaddingBottom}>
              <Button
                onPress={() =>
                  navigation.push(ScreenName.VolunteerForm, {
                    title: texts.volunteer.conversationAllStart,
                    query: QUERY_TYPES.VOLUNTEER.CONVERSATION,
                    rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER,
                    selectedUserIds: data.map(({ id }: VolunteerUser) => id)
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
