import React, { useCallback, useContext } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { colors, consts, texts } from '../../config';
import { parseListItemsFromQuery } from '../../helpers';
import { getQuery, QUERY_TYPES } from '../../queries';
import { SettingsContext } from '../../SettingsProvider';
import { Button } from '../Button';
import { ListComponent } from '../ListComponent';
import { LoadingContainer } from '../LoadingContainer';
import { Title, TitleContainer } from '../Title';
import { Touchable } from '../Touchable';
import { Wrapper } from '../Wrapper';

type HeaderProps = {
  categoryTitle: string;
  onPress: () => void;
}

type Props = {
  categoryId?: number;
  ids: string[];
  navigation: NavigationScreenProp<any>;
  query: string;
  sectionTitle?: string;
}

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

const SectionHeader = ({ categoryTitle, onPress }: HeaderProps) => {

  return (
    <TitleContainer>
      <Touchable onPress={onPress}>
        <Title accessibilityLabel={`${categoryTitle} (Überschrift) (Taste)`}>
          {categoryTitle}
        </Title>
      </Touchable>
    </TitleContainer>
  );
};

const isHorizontal = (query: string, listTypesSettings: any) => {
  switch (query) {
  case QUERY_TYPES.TOURS:
    return listTypesSettings[QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS] === consts.LIST_TYPES.CARD_LIST;
  case QUERY_TYPES.POINTS_OF_INTEREST:
    return listTypesSettings[QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS] === consts.LIST_TYPES.CARD_LIST;
  default:
    return listTypesSettings[query] === consts.LIST_TYPES.CARD_LIST;
  }
};

export const BookmarkSection = ({categoryId, ids, navigation, query, sectionTitle}: Props) => {
  const { listTypesSettings } = useContext(SettingsContext);
  const { loading, data } = useQuery(getQuery(query), { variables: { ids, limit: 3 } });

  const onPressShowMore = useCallback(() =>
    navigation.navigate('BookmarkCategory', { categoryId, query, title: sectionTitle }),
  [navigation, categoryId]);

  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  const listData = parseListItemsFromQuery(query, data, true);

  const horizontal = isHorizontal(query, listTypesSettings);

  return (
    <View>
      <SectionHeader
        categoryTitle={sectionTitle || getTitle(query)}
        onPress={onPressShowMore}
      />
      <ListComponent
        data={listData}
        navigation={navigation}
        query={query}
        horizontal={horizontal}
      />
      {
        ids.length > 3 ?
          (<Wrapper>
            <Button title={texts.bookmarks.showAll}
              onPress={onPressShowMore}
            />
          </Wrapper>
          ) : null
      }
    </View>
  );
};
