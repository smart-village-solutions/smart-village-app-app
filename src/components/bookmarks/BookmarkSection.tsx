import { useFocusEffect } from 'expo-router/react-navigation';
import { StackNavigationProp } from 'expo-router/js-stack';
import React, { useCallback, useMemo } from 'react';
import { useQuery as RQuseQuery } from 'react-query';

import { requestBookmarkData } from '../../BookmarkQueryClient';
import { texts } from '../../config';
import { parseListItemsFromQuery } from '../../helpers';
import { QUERY_TYPES } from '../../queries';
import { ScreenName } from '../../types';
import { DataListSection } from '../DataListSection';
import { RegularText } from '../Text';
import { WrapperVertical } from '../Wrapper';

type Props = {
  additionalIds?: string[];
  additionalQuery?: string;
  suffix?: number | string;
  categoryTitleDetail?: string;
  ids: string[];
  navigation: StackNavigationProp<Record<string, object | undefined>>;
  query: string;
  sectionTitle?: string;
};

type BookmarkQueryVariables = {
  ids: string[];
  onlyUniqEvents?: boolean;
};

const getPreviewIds = (ids: string[], includeAll: boolean) => (includeAll ? ids : ids.slice(0, 3));

const getBookmarkQueryVariables = (
  ids: string[],
  query: string,
  includeAll: boolean
): BookmarkQueryVariables => {
  const queryIds = getPreviewIds(ids, query === QUERY_TYPES.VOUCHERS || includeAll);

  return query === QUERY_TYPES.EVENT_RECORDS
    ? { ids: queryIds, onlyUniqEvents: true }
    : { ids: queryIds };
};

const getBookmarkQueryData = (query: string, queryKey: string, data?: Record<string, unknown>) =>
  query === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL ? data?.results : data?.[queryKey];

const parseAdditionalBookmarkData = (
  additionalQuery: string | undefined,
  additionalQueryData: Record<string, unknown> | undefined,
  categoryTitleDetail: string | undefined
) => {
  if (!additionalQuery) return undefined;

  const data =
    additionalQuery === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL
      ? additionalQueryData?.results
      : additionalQueryData;

  return parseListItemsFromQuery(additionalQuery, data, categoryTitleDetail, {
    withDate: true,
    isSectioned: additionalQuery === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL,
    skipLastDivider: false
  });
};

export const BookmarkSection = ({
  additionalIds = [],
  additionalQuery,
  suffix,
  categoryTitleDetail,
  ids,
  navigation,
  query,
  sectionTitle
}: Props) => {
  const isCombinedEventSection =
    query === QUERY_TYPES.EVENT_RECORDS && additionalQuery === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL;
  const variables = useMemo(
    () => getBookmarkQueryVariables(ids, query, isCombinedEventSection),
    [ids, isCombinedEventSection, query]
  );
  const queryKey = query === QUERY_TYPES.VOUCHERS ? QUERY_TYPES.GENERIC_ITEMS : query;
  const additionalVariables = useMemo(
    () => ({ ids: getPreviewIds(additionalIds, isCombinedEventSection) }),
    [additionalIds, isCombinedEventSection]
  );

  const {
    data,
    isError,
    isLoading: primaryLoading,
    refetch
  } = RQuseQuery([query, variables], () => requestBookmarkData(query, variables), {
    enabled: !!variables.ids.length
  });
  const {
    data: additionalQueryData,
    isError: isAdditionalError,
    isLoading: isAdditionalLoading,
    refetch: refetchAdditional
  } = RQuseQuery(
    [additionalQuery, additionalVariables],
    () => requestBookmarkData(additionalQuery ?? '', additionalVariables),
    { enabled: !!additionalQuery && !!additionalVariables.ids.length }
  );
  const isVolunteerCalendar = query === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL;
  const listData = getBookmarkQueryData(query, queryKey, data);
  const additionalListData = parseAdditionalBookmarkData(
    additionalQuery,
    additionalQueryData,
    categoryTitleDetail
  );
  const loading = primaryLoading || isAdditionalLoading;
  const hasListData = !!listData?.length || !!additionalListData?.length;

  const onPressShowMore = useCallback(
    () =>
      navigation.navigate(ScreenName.BookmarkCategory, {
        suffix,
        query,
        queryVariables: variables,
        additionalQuery,
        additionalQueryVariables: additionalVariables,
        title: sectionTitle,
        categoryTitleDetail
      }),
    [
      additionalQuery,
      additionalVariables,
      categoryTitleDetail,
      navigation,
      query,
      sectionTitle,
      suffix,
      variables
    ]
  );

  useFocusEffect(
    useCallback(() => {
      variables.ids.length && refetch();
      additionalQuery && additionalVariables.ids.length && refetchAdditional();
    }, [additionalQuery, additionalVariables.ids.length, refetch, refetchAdditional, variables.ids])
  );

  if (!loading && (isError || isAdditionalError)) {
    return (
      <WrapperVertical>
        <RegularText>{texts.errors.unexpected}</RegularText>
      </WrapperVertical>
    );
  }

  if (!loading && !hasListData) {
    return null;
  }

  return (
    <WrapperVertical>
      <DataListSection
        additionalData={additionalListData}
        buttonTitle={texts.bookmarks.showAll}
        limit={Math.min(ids.length + additionalIds.length, 3)}
        loading={loading}
        navigate={onPressShowMore}
        navigateButton={onPressShowMore}
        navigation={navigation}
        query={query}
        queryVariables={variables}
        sectionData={isVolunteerCalendar ? data?.results : data}
        sectionTitle={sectionTitle}
        sectionTitleDetail={categoryTitleDetail}
        showButton={ids.length + additionalIds.length > 3}
        showEventDateTime={query === QUERY_TYPES.EVENT_RECORDS}
        skipLastDivider
      />
    </WrapperVertical>
  );
};
