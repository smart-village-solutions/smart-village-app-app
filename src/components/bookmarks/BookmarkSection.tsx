import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect } from 'react';
import { useQuery as RQuseQuery } from 'react-query';

import { BookmarkContext } from '../../BookmarkProvider';
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
  navigation: StackNavigationProp<any>;
  listType: string;
  query: string;
  sectionTitle?: string;
  setConnectionState: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
};

export const BookmarkSection = ({
  suffix,
  categoryTitleDetail,
  ids,
  bookmarkKey,
  navigation,
  listType,
  query,
  sectionTitle,
  setConnectionState
}: Props) => {
  const { toggleBookmark } = useContext(BookmarkContext);
  // slice the first 3 entries off of the bookmark ids, to get the 3 most recently bookmarked items,
  // skip that for vouchers
  const variables = query === QUERY_TYPES.VOUCHERS ? { ids } : { ids: ids.slice(0, 3) };

  if (query === QUERY_TYPES.EVENT_RECORDS) {
    variables.onlyUniqEvents = true;
  }

  const {
    data,
    isLoading: loading,
    refetch
  } = RQuseQuery([query, variables], async () => {
    const client = await ReactQueryClient();

    return await client.request(getQuery(query), variables);
  });

  const onPressShowMore = useCallback(
    () =>
      navigation.navigate(ScreenName.BookmarkCategory, {
        suffix,
        query,
        queryVariables: variables,
        title: sectionTitle,
        categoryTitleDetail,
        listType
      }),
    [navigation, suffix]
  );

  useEffect(() => {
    if (!loading) {
      setConnectionState((state) => {
        const newState = { ...state };
        newState[bookmarkKey] = !!data;
        return newState;
      });

      if (!data?.[query === QUERY_TYPES.VOUCHERS ? QUERY_TYPES.GENERIC_ITEMS : query]?.length) {
        for (const id of ids) {
          toggleBookmark(query, id, suffix);
        }
      }
    }
  }, [data]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  if (!data?.[query === QUERY_TYPES.VOUCHERS ? QUERY_TYPES.GENERIC_ITEMS : query]?.length) {
    return null;
  }

  return (
    <WrapperVertical>
      <DataListSection
        buttonTitle={texts.bookmarks.showAll}
        limit={variables?.ids.length}
        listType={listType}
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
      />
    </WrapperVertical>
  );
};
