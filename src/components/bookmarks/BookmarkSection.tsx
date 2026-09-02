import { useFocusEffect } from 'expo-router/react-navigation';
import { StackNavigationProp } from 'expo-router/js-stack';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useQuery as RQuseQuery } from 'react-query';

import { ReactQueryClient } from '../../ReactQueryClient';
import { texts } from '../../config';
import { QUERY_TYPES, getQuery } from '../../queries';
import { ScreenName } from '../../types';
import { DataListSection } from '../DataListSection';
import { WrapperVertical } from '../Wrapper';

type Props = {
  suffix?: number | string;
  categoryTitleDetail?: string;
  ids: string[];
  bookmarkKey: string;
  navigation: StackNavigationProp<Record<string, object | undefined>>;
  query: string;
  sectionTitle?: string;
  setConnectionState: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
};

type BookmarkQueryVariables = {
  ids: string[];
  onlyUniqEvents?: boolean;
};

export const BookmarkSection = ({
  suffix,
  categoryTitleDetail,
  ids,
  bookmarkKey,
  navigation,
  query,
  sectionTitle,
  setConnectionState
}: Props) => {
  // slice the first 3 entries off of the bookmark ids, to get the 3 most recently bookmarked items,
  // skip that for vouchers
  const variables: BookmarkQueryVariables = useMemo(() => {
    const queryIds = query === QUERY_TYPES.VOUCHERS ? ids : ids.slice(0, 3);

    return query === QUERY_TYPES.EVENT_RECORDS
      ? { ids: queryIds, onlyUniqEvents: true }
      : { ids: queryIds };
  }, [ids, query]);
  const queryKey = query === QUERY_TYPES.VOUCHERS ? QUERY_TYPES.GENERIC_ITEMS : query;

  const {
    data,
    isError,
    isLoading: loading,
    refetch
  } = RQuseQuery(
    [query, variables],
    async () => {
      const client = await ReactQueryClient();

      return await client.request(getQuery(query), variables);
    },
    { enabled: !!variables.ids.length }
  );
  const listData = data?.[queryKey];

  const onPressShowMore = useCallback(
    () =>
      navigation.navigate(ScreenName.BookmarkCategory, {
        suffix,
        query,
        queryVariables: variables,
        title: sectionTitle,
        categoryTitleDetail
      }),
    [categoryTitleDetail, navigation, query, sectionTitle, suffix, variables]
  );

  useEffect(() => {
    if (!loading) {
      setConnectionState((state) => {
        const newState = { ...state };
        newState[bookmarkKey] = !isError && !!listData?.length;
        return newState;
      });
    }
  }, [bookmarkKey, isError, listData?.length, loading, setConnectionState]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  if (!loading && !listData?.length) {
    return null;
  }

  return (
    <WrapperVertical>
      <DataListSection
        buttonTitle={texts.bookmarks.showAll}
        limit={variables?.ids.length}
        loading={loading}
        navigate={onPressShowMore}
        navigateButton={onPressShowMore}
        navigation={navigation}
        query={query}
        queryVariables={variables}
        sectionData={data}
        sectionTitle={sectionTitle}
        sectionTitleDetail={categoryTitleDetail}
        showButton={ids.length > 3}
        showEventDateTime={query === QUERY_TYPES.EVENT_RECORDS}
      />
    </WrapperVertical>
  );
};
