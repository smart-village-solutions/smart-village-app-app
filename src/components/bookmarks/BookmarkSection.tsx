import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect } from 'react';
import { useQuery } from 'react-apollo';

import { NetworkContext } from '../../NetworkProvider';
import { consts, texts } from '../../config';
import { graphqlFetchPolicy } from '../../helpers';
import { useRefreshTime } from '../../hooks';
import { QUERY_TYPES, getQuery } from '../../queries';
import { ScreenName } from '../../types';
import { DataListSection } from '../DataListSection';

const { REFRESH_INTERVALS } = consts;

type Props = {
  suffix?: number | string;
  categoryTitleDetail?: string;
  ids: string[];
  bookmarkKey: string;
  navigation: StackNavigationProp<any>;
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
  query,
  sectionTitle,
  setConnectionState
}: Props) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  // slice the first 3 entries off of the bookmark ids, to get the 3 most recently bookmarked items
  const variables = query === QUERY_TYPES.VOUCHERS ? { ids } : { ids: ids.slice(0, 3) };

  if (query === QUERY_TYPES.EVENT_RECORDS) {
    variables.onlyUniqEvents = true;
  }

  const refreshTime = useRefreshTime('bookmarks', REFRESH_INTERVALS.BOOKMARKS);

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  const { loading, data } = useQuery(getQuery(query), {
    fetchPolicy,
    variables
  });

  const onPressShowMore = useCallback(
    () =>
      navigation.navigate(ScreenName.BookmarkCategory, {
        suffix,
        query,
        queryVariables: variables,
        title: sectionTitle,
        categoryTitleDetail
      }),
    [navigation, suffix]
  );

  useEffect(() => {
    if (!loading)
      setConnectionState((state) => {
        const newState = { ...state };
        newState[bookmarkKey] = !!data;
        return newState;
      });
  }, [data, bookmarkKey, loading, setConnectionState]);

  return (
    <DataListSection
      buttonTitle={texts.bookmarks.showAll}
      limit={variables?.ids.length}
      loading={loading}
      navigate={onPressShowMore}
      navigation={navigation}
      query={query}
      queryVariables={variables}
      sectionData={data}
      sectionTitle={sectionTitle}
      sectionTitleDetail={categoryTitleDetail}
      showButton={ids.length > 3}
    />
  );
};
