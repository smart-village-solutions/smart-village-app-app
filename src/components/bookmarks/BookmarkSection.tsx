import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useContext, useEffect } from 'react';
import { useQuery } from 'react-apollo';

import { consts, texts } from '../../config';
import { graphqlFetchPolicy } from '../../helpers';
import { useRefreshTime } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery } from '../../queries';
import { DataListSection } from '../DataListSection';
import { WrapperVertical } from '../Wrapper';

const { REFRESH_INTERVALS } = consts;

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
        suffix,
        query,
        title: sectionTitle,
        categoryTitleDetail,
        listType
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
    <WrapperVertical>
      <DataListSection
        buttonTitle={texts.bookmarks.showAll}
        loading={loading}
        navigate={onPressShowMore}
        navigation={navigation}
        listType={listType}
        query={query}
        sectionData={data}
        sectionTitle={sectionTitle}
        sectionTitleDetail={categoryTitleDetail}
        showButton={ids.length > 3}
      />
    </WrapperVertical>
  );
};
