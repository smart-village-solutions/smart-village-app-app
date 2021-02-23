import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../config';
import { parseListItemsFromQuery } from '../helpers';
import { QUERY_TYPES } from '../queries';
import { ListComponent } from './ListComponent';
import { SectionHeader } from './SectionHeader';

type Props = {
  sectionData: unknown[];
  sectionTitle?: string;
  sectionTitleDetail?: string;
  query: string;
  navigation: NavigationScreenProp<never>;
};

// TODO: copied from BookmarkSection -> avoid duplicate content
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

export const CrossDataSection = ({
  sectionData,
  sectionTitle,
  sectionTitleDetail,
  query,
  navigation
}: Props) => {
  if (!sectionData) return null;

  const listData = parseListItemsFromQuery(
    query,
    { [query]: sectionData },
    sectionData.length > 3,
    sectionTitleDetail
  );

  return (
    <View>
      <SectionHeader title={sectionTitle || getTitle(query)} />
      <ListComponent data={listData} navigation={navigation} query={query} />
    </View>
  );
};

const styles = StyleSheet.create({});
