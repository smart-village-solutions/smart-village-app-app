import React, { useCallback, useContext, useEffect } from 'react';
import { useQuery } from 'react-apollo';
import { NavigationScreenProp } from 'react-navigation';

import { consts, texts } from '../../config';
import { graphqlFetchPolicy } from '../../helpers';
import { useRefreshTime } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery } from '../../queries';
import { DataListSection } from '../DataListSection';

const { REFRESH_INTERVALS } = consts;

type Props = {
  categoryId?: number;
  categoryTitleDetail?: string;
  ids: string[];
  bookmarkKey: string;
  navigation: NavigationScreenProp<never>;
  query: string;
  sectionTitle?: string;
  setConnectionState: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
};

export const BookmarkSection = ({
  categoryId,
  categoryTitleDetail,
  ids,
  bookmarkKey,
  navigation,
  query,
  sectionTitle,
  setConnectionState
}: Props) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);

  const refreshTime = useRefreshTime('bookmarks', REFRESH_INTERVALS.BOOKMARKS);

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  // slice the first 3 entries off of the bookmark ids, to get the 3 most recently bookmarked items
  const { loading, data } = useQuery(getQuery(query), {
    fetchPolicy,
    variables: { ids: ids.slice(0, 3) }
  });

  const onPressShowMore = useCallback(
    () =>
      navigation.navigate('BookmarkCategory', {
        categoryId,
        query,
        title: sectionTitle,
        categoryTitleDetail
      }),
    [navigation, categoryId]
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
      loading={loading}
      navigation={navigation}
      query={query}
      buttonTitle={texts.bookmarks.showAll}
      navigate={onPressShowMore}
      sectionData={data}
      sectionTitleDetail={categoryTitleDetail}
      sectionTitle={sectionTitle}
      showButton={ids.length > 3}
    />
  );
};
