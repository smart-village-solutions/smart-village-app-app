import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { colors, texts } from '../config';
import { parseListItemsFromQuery } from '../helpers';
import { QUERY_TYPES } from '../queries';
import { Button } from './Button';
import { ListComponent } from './ListComponent';
import { LoadingContainer } from './LoadingContainer';
import { SectionHeader } from './SectionHeader';
import { Wrapper } from './Wrapper';

type Props = {
  buttonTitle?: string;
  limit?: number;
  loading: boolean;
  navigate?: () => void;
  sectionData?: unknown[];
  sectionTitle?: string;
  sectionTitleDetail?: string;
  showButton?: boolean;
  query: string;
  navigation: NavigationScreenProp<never>;
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

export const DataListSection = ({
  buttonTitle,
  limit = 3,
  loading,
  navigate,
  sectionData,
  sectionTitle,
  sectionTitleDetail,
  showButton,
  query,
  navigation
}: Props) => {
  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  const listData = parseListItemsFromQuery(query, sectionData, true, sectionTitleDetail);

  if (!listData?.length) return null;

  return (
    <View>
      <SectionHeader onPress={navigate} title={sectionTitle ?? getTitle(query)} />
      <ListComponent data={listData.slice(0, limit)} navigation={navigation} query={query} />
      {!!buttonTitle && !!navigate && showButton && (
        <Wrapper>
          <Button title={buttonTitle} onPress={navigate} />
        </Wrapper>
      )}
    </View>
  );
};
