import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useInfiniteQuery } from 'react-query';

import {
  DefaultKeyboardAvoidingView,
  LoadingSpinner,
  SafeAreaViewFlex,
  VolunteerCommentModal,
  VolunteerPostModal
} from '../../components';
import { colors, consts, normalize } from '../../config';
import {
  getTitleForQuery,
  volunteerAuthToken,
  volunteerListDate,
  volunteerSubtitle,
  volunteerUserData
} from '../../helpers';
import { useOpenWebScreen, useRenderItem } from '../../hooks';
import { getQuery, QUERY_TYPES } from '../../queries';
import { ScreenName, VolunteerObjectModelType } from '../../types';

const { ROOT_ROUTE_NAMES } = consts;
const keyExtractor = (item, index) => `index${index}-id${item.id}`;

/* eslint-disable complexity */
export const VolunteerStreamScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const query = QUERY_TYPES.VOLUNTEER.STREAM;
  const headerTitle = route.params?.title ?? '';
  const queryKey = [query];
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [commentForModal, setCommentForModal] = useState();
  const [isCommentModalCollapsed, setIsCommentModalCollapsed] = useState(true);
  const [isPostModalCollapsed, setIsPostModalCollapsed] = useState(true);
  const [postForModal, setPostForModal] = useState();
  const [userGuid, setUserGuid] = useState<string | null>(null);
  const { data, isLoading, refetch, isRefetching, fetchNextPage, hasNextPage } = useInfiniteQuery(
    queryKey,
    ({ pageParam = 1 }) => getQuery(query)({ page: pageParam }),
    {
      getNextPageParam: (lastPage) => {
        if (!lastPage) return undefined;

        // try to determine page/pages from lastPage
        const current = typeof lastPage.page === 'number' ? lastPage.page : Number(lastPage.page);
        const totalPages =
          typeof lastPage.pages === 'number' ? lastPage.pages : Number(lastPage.pages);

        if (current && totalPages && current < totalPages) {
          return current + 1;
        }

        // fallback: get page param from links.next
        const next = lastPage?.links?.next;
        if (typeof next === 'string') {
          const match = next.match(/[?&]page=(\d+)/);
          if (match) return Number(match[1]);
        }
      }
    }
  );

  // action to open source urls
  const openWebScreen = useOpenWebScreen(headerTitle);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  useEffect(() => {
    const fetchAuthToken = async () => {
      const token = await volunteerAuthToken();
      setAuthToken(token);
    };

    const fetchUserGuid = async () => {
      const { currentUserGuid } = await volunteerUserData();
      setUserGuid(currentUserGuid);
    };

    fetchAuthToken();
    fetchUserGuid();
  }, []);

  const renderCalendarItem = useRenderItem(QUERY_TYPES.VOLUNTEER.CALENDAR, navigation, {
    openWebScreen,
    refetch
  });

  const renderPostItem = useRenderItem(QUERY_TYPES.VOLUNTEER.POSTS, navigation, {
    openWebScreen,
    queryVariables: {
      authToken,
      setCommentForModal,
      setIsCommentModalCollapsed: setIsCommentModalCollapsed,
      setIsPostModalCollapsed: setIsPostModalCollapsed,
      setPostForModal,
      userGuid
    },
    refetch
  });

  const renderItem = useCallback(
    (props) => {
      const objectModel = props?.item?.content?.metadata?.object_model;
      switch (objectModel) {
        case VolunteerObjectModelType.CALENDAR:
          return renderCalendarItem(props);
        case VolunteerObjectModelType.POST:
          return renderPostItem(props);
        default:
          return null;
      }
    },
    [renderCalendarItem, renderPostItem]
  );

  const onEndReached = useCallback(async () => {
    if (hasNextPage) {
      return await fetchNextPage();
    }

    return {};
  }, [fetchNextPage, hasNextPage]);

  const results = data?.pages?.flatMap((page) => page?.results)?.filter(Boolean) || [];

  const volunteerData = useMemo(() => {
    // Filter out deleted entries (state === 100)
    // see states here: https://github.com/humhub/humhub/blob/master/protected/humhub/modules/content/models/Content.php#L133-L136
    const activeEntries = results?.filter(
      (item: { content?: { metadata?: { state?: number } } }) =>
        item.content?.metadata?.state !== 100
    );

    // return keys and values are taken from `parseVolunteerData` in volunteerHelper
    return activeEntries?.map((volunteer) => {
      const objectModel = volunteer?.content?.metadata?.object_model;
      let teaserTitle;

      if (objectModel === VolunteerObjectModelType.CALENDAR) {
        teaserTitle = volunteer.content?.topics?.map((topic) => topic.name).join(', ');
      }

      return {
        ...volunteer,
        title: volunteer.title || volunteer.name,
        subtitle:
          volunteer.subtitle ||
          volunteerSubtitle(
            volunteer,
            objectModel === VolunteerObjectModelType.CALENDAR
              ? QUERY_TYPES.VOLUNTEER.CALENDAR
              : query,
            true,
            false
          ),
        badge: volunteer.badge,
        statustitle: volunteer.statustitle,
        statustitleIcon: volunteer.statustitleIcon,
        teaserTitle,
        picture: volunteer.picture,
        routeName: ScreenName.VolunteerDetail,
        onPress: volunteer.onPress,
        listDate: volunteer.listDate || volunteerListDate(volunteer),
        status: volunteer.status,
        params: {
          title: getTitleForQuery(
            objectModel === VolunteerObjectModelType.CALENDAR ? QUERY_TYPES.VOLUNTEER.CALENDAR : '',
            volunteer
          ),
          query:
            objectModel === VolunteerObjectModelType.CALENDAR
              ? QUERY_TYPES.VOLUNTEER.CALENDAR
              : undefined,
          queryVariables: { id: volunteer.user?.id ? `${volunteer.user.id}` : `${volunteer.id}` },
          rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER,
          details: volunteer
        },
        bottomDivider: false
      };
    });
  }, [results]);

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <FlatList
          keyExtractor={keyExtractor}
          data={volunteerData}
          renderItem={renderItem}
          ListEmptyComponent={isLoading ? <LoadingSpinner loading /> : null}
          ListFooterComponent={isRefetching ? <LoadingSpinner loading /> : null}
          onEndReachedThreshold={0.5}
          onEndReached={onEndReached}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refetch}
              colors={[colors.refreshControl]}
              tintColor={colors.refreshControl}
            />
          }
          keyboardShouldPersistTaps="handled"
          style={styles.container}
        />

        {!!postForModal?.contentContainerId && (
          <VolunteerPostModal
            authToken={authToken}
            contentContainerId={postForModal.contentContainerId}
            isCollapsed={isPostModalCollapsed}
            post={postForModal}
            setIsCollapsed={setIsPostModalCollapsed}
          />
        )}

        {!!commentForModal?.objectId && !!commentForModal?.objectModel && (
          <VolunteerCommentModal
            authToken={authToken}
            comment={commentForModal}
            isCollapsed={isCommentModalCollapsed}
            objectId={commentForModal.objectId}
            objectModel={commentForModal.objectModel}
            setIsCollapsed={setIsCommentModalCollapsed}
          />
        )}
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: normalize(16)
  }
});
