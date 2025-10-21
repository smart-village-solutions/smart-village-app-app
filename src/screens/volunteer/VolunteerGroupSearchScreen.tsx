import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useInfiniteQuery } from 'react-query';

import {
  DefaultKeyboardAvoidingView,
  Filter,
  HtmlView,
  LoadingSpinner,
  RegularText,
  SafeAreaViewFlex,
  Search,
  VolunteerCommentModal,
  VolunteerPostListItem,
  VolunteerPostModal,
  WrapperVertical
} from '../../components';
import { colors, consts, normalize, texts } from '../../config';
import { volunteerAuthToken } from '../../helpers';
import { useOpenWebScreen, useStaticContent } from '../../hooks';
import { getQuery, QUERY_TYPES } from '../../queries';

const { FILTER_TYPES } = consts;

const keyExtractor = (item, index) => `index${index}-id${item.id}`;

const ORDER_BY = {
  DATE: 'date',
  SCORE: 'score'
};

const ORDER_OPTIONS = [
  {
    value: texts.filter.sorting.score,
    selected: false,
    filterValue: ORDER_BY.SCORE,
    index: 1,
    id: 1
  },
  {
    value: texts.filter.sorting.date,
    selected: false,
    filterValue: ORDER_BY.DATE,
    index: 2,
    id: 2
  }
];

/* eslint-disable complexity */
export const VolunteerGroupSearchScreen = ({ route }: StackScreenProps<any>) => {
  const query = QUERY_TYPES.VOLUNTEER.GROUP_SEARCH;
  const headerTitle = route.params?.title ?? '';
  const contentContainerId = route.params?.contentContainerId ?? '';
  const guid = route.params?.guid ?? '';
  const userGuid = route.params?.userGuid ?? '';
  const initialQueryVariables = route.params?.queryVariables ?? {
    page: 1,
    spaces: [guid]
  };
  const [queryVariables, setQueryVariables] = useState(initialQueryVariables);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [commentForModal, setCommentForModal] = useState();
  const [isCommentModalCollapsed, setIsCommentModalCollapsed] = useState(true);
  const [isPostModalCollapsed, setIsPostModalCollapsed] = useState(true);
  const [postForModal, setPostForModal] = useState();
  const [didAutoFetch, setDidAutoFetch] = useState(false);
  const { start_date, end_date, dateRange, ...restQueryVariables } = queryVariables;
  const adjustedQueryVariables = {
    ...restQueryVariables,
    ...(start_date ? { start_date, dateFrom: start_date } : {}),
    ...(end_date ? { end_date, dateTo: end_date } : {})
  };
  const queryKey = [query, adjustedQueryVariables];
  const { data, isLoading, refetch, isRefetching, fetchNextPage, hasNextPage } = useInfiniteQuery(
    queryKey,
    ({ pageParam = 1 }) =>
      getQuery(query)({
        ...adjustedQueryVariables,
        page: pageParam
      }),
    {
      getNextPageParam: (lastPage) => {
        if (!lastPage?.pagination) return undefined;

        return lastPage.pagination.isLastPage ? undefined : lastPage.pagination.currentPage + 1;
      }
    }
  );

  const {
    data: dataGroupSearchIntroText,
    loading: isLoadingGroupSearchIntroText,
    refetch: refetchGroupSearchIntroText
  } = useStaticContent({
    refreshTimeKey: 'publicJsonFile-volunteerGroupSearchIntroText',
    name: 'volunteerGroupSearchIntroText',
    type: 'html'
  });

  // action to open source urls
  const openWebScreen = useOpenWebScreen(headerTitle);

  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchGroupSearchIntroText();
    }, [])
  );

  useEffect(() => {
    const fetchAuthToken = async () => {
      const token = await volunteerAuthToken();
      setAuthToken(token);
    };

    fetchAuthToken();
  }, []);

  useEffect(() => {
    // automatically receive more than 3 results from the api on first load, if there is a next page
    if (data && hasNextPage && !didAutoFetch) {
      fetchNextPage();
      setDidAutoFetch(true);
    }
  }, [data, hasNextPage, didAutoFetch, fetchNextPage]);

  useEffect(() => {
    // reset auto fetcher when query key changes with a new search
    setDidAutoFetch(false);
  }, [queryKey]);

  const onEndReached = useCallback(async () => {
    if (hasNextPage) {
      return await fetchNextPage();
    }

    return {};
  }, [fetchNextPage, hasNextPage]);

  if (isLoadingGroupSearchIntroText) {
    return <LoadingSpinner loading />;
  }

  const results = data?.pages?.flatMap((page) => page?.results)?.filter(Boolean) || [];
  const totalResults = data?.pages?.[0]?.pagination?.totalResults || 0;

  const ListHeaderComponent = (
    <>
      {!!dataGroupSearchIntroText && (
        <WrapperVertical>
          <HtmlView html={dataGroupSearchIntroText} />
        </WrapperVertical>
      )}
      <WrapperVertical>
        <Search
          placeholder={texts.volunteer.groupSearchNew}
          setQueryVariables={setQueryVariables}
        />
      </WrapperVertical>
      <Filter
        filterTypes={[
          {
            type: FILTER_TYPES.DATE,
            name: 'date',
            data: [
              {
                hasFutureDates: false,
                hasPastDates: true,
                name: 'start_date',
                placeholder: texts.volunteer.filter.dateFrom
              },
              {
                hasFutureDates: false,
                hasPastDates: true,
                name: 'end_date',
                placeholder: texts.volunteer.filter.dateTo
              }
            ]
          },
          {
            type: FILTER_TYPES.DROPDOWN,
            label: texts.volunteer.filter.sort,
            name: 'orderBy',
            data: ORDER_OPTIONS,
            placeholder: texts.volunteer.filter.chooseSort
          }
        ]}
        initialQueryVariables={initialQueryVariables}
        isOverlay
        queryVariables={adjustedQueryVariables}
        setQueryVariables={setQueryVariables}
        withSearch
      />
      <RegularText small>
        {totalResults} {totalResults === 1 ? texts.filter.result : texts.filter.results}
      </RegularText>
    </>
  );

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <FlatList
          keyExtractor={keyExtractor}
          data={results}
          renderItem={({ item: post }) => (
            <VolunteerPostListItem
              authToken={authToken}
              bottomDivider={false}
              openWebScreen={openWebScreen}
              post={{
                ...post,
                content: {
                  files: post.files,
                  metadata: { created_at: post.created_at, created_by: post.author }
                }
              }}
              setCommentForModal={setCommentForModal}
              setIsCommentModalCollapsed={setIsCommentModalCollapsed}
              setIsPostModalCollapsed={setIsPostModalCollapsed}
              setPostForModal={setPostForModal}
              userGuid={userGuid}
            />
          )}
          ListHeaderComponent={ListHeaderComponent}
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

        {!!contentContainerId && (
          <VolunteerPostModal
            authToken={authToken}
            contentContainerId={contentContainerId}
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
