import React, { useCallback, useContext, useEffect } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { colors, consts, texts } from '../../config';
import { graphqlFetchPolicy, parseListItemsFromQuery } from '../../helpers';
import { useRefreshTime } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { SettingsContext } from '../../SettingsProvider';
import { Button } from '../Button';
import { ListComponent } from '../ListComponent';
import { LoadingContainer } from '../LoadingContainer';
import { SectionHeader } from '../SectionHeader';
import { Wrapper } from '../Wrapper';

const { LIST_TYPES, REFRESH_INTERVALS } = consts;

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

const getTitle = (itemType: string) => {
  switch (itemType) {
    case QUERY_TYPES.NEWS_ITEMS:
      return texts.homeCategoriesNews.categoryTitle;
    case QUERY_TYPES.POINTS_OF_INTEREST:
      return texts.categoryTitles.pointsOfInterest;
    case QUERY_TYPES.TOURS:
      return texts.categoryTitles.tours;
    case QUERY_TYPES.EVENT_RECORDS:
      return texts.homeTitles.events;
    default:
      return itemType;
  }
};

const isHorizontal = (query: string, listTypesSettings: Record<string, unknown>) => {
  switch (query) {
    case QUERY_TYPES.TOURS:
    case QUERY_TYPES.POINTS_OF_INTEREST:
      return listTypesSettings[QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS] === LIST_TYPES.CARD_LIST;
    default:
      return listTypesSettings[query] === LIST_TYPES.CARD_LIST;
  }
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
  const { listTypesSettings } = useContext(SettingsContext);
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

  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  if (!data) return null;

  const listData = parseListItemsFromQuery(query, data, ids.length > 3, categoryTitleDetail);

  const horizontal = isHorizontal(query, listTypesSettings);

  return (
    <View>
      <SectionHeader title={sectionTitle || getTitle(query)} onPress={onPressShowMore} />
      <ListComponent
        data={listData}
        navigation={navigation}
        query={query}
        horizontal={horizontal}
      />
      {ids.length > 3 ? (
        <Wrapper>
          <Button title={texts.bookmarks.showAll} onPress={onPressShowMore} />
        </Wrapper>
      ) : null}
    </View>
  );
};
