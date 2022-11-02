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
import { useConversationsHeader, useOpenWebScreen, useVolunteerData } from '../../hooks';
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
    isCalendar,
    titleDetail,
    bookmarkable
  });

  // action to open source urls
  const openWebScreen = useOpenWebScreen(headerTitle, undefined, rootRouteName);

  useConversationsHeader({ query, navigation });
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
        <ListComponent
          ListHeaderComponent={
            <>
              {showFilter && <DropdownHeader {...{ query: query, queryVariables, data }} />}
              {isPosts && isGroupMember && (
                <VolunteerPostTextField
                  contentContainerId={queryVariables?.contentContainerId}
                  refetch={refetch}
                />
              )}
            </>
          }
          navigation={navigation}
          data={data}
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
