import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useCallback, useContext, useState } from 'react';
import { RefreshControl, StyleSheet } from 'react-native';

import { SettingsContext } from '../../SettingsProvider';
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
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { calendarToggle = false } = settings;
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

  useFocusEffect(
    useCallback(() => {
      if (query === QUERY_TYPES.VOLUNTEER.CONVERSATIONS) {
        // this is needed because the chat screen is locked to portrait mode
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
      }
    }, [])
  );

  if (isLoading) {
    return <LoadingSpinner loading />;
  }

  if (!data) return null;

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        {isCalendar && calendarToggle && !hasDailyFilterSelection && (
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
                isListRefreshing={isLoading}
                query={query}
                queryVariables={queryVariables}
                navigation={navigation}
                additionalData={data}
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
              colors={[colors.refreshControl]}
              tintColor={colors.refreshControl}
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
