import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { consts, texts } from '../config';
import { parseListItemsFromQuery } from '../helpers';
import { QUERY_TYPES } from '../queries';
import { SettingsContext } from '../SettingsProvider';
import { ListComponent } from './ListComponent';
import { SectionHeader } from './SectionHeader';

const { LIST_TYPES } = consts;

type Props = {
  sectionData: [];
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

// TODO: copied from BookmarkSection -> avoid duplicate content
const isHorizontal = (query: string, listTypesSettings: Record<string, unknown>) => {
  switch (query) {
    case QUERY_TYPES.TOURS:
    case QUERY_TYPES.POINTS_OF_INTEREST:
      return listTypesSettings[QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS] === LIST_TYPES.CARD_LIST;
    default:
      return listTypesSettings[query] === LIST_TYPES.CARD_LIST;
  }
};

export const CrossDataSection = ({
  sectionData,
  sectionTitle,
  sectionTitleDetail,
  query,
  navigation
}: Props) => {
  const { listTypesSettings } = useContext(SettingsContext);

  if (!sectionData) return null;

  const listData = parseListItemsFromQuery(
    query,
    { [query]: sectionData },
    sectionData.length > 3,
    sectionTitleDetail
  );

  const horizontal = isHorizontal(query, listTypesSettings);

  return (
    <View>
      <SectionHeader title={sectionTitle || getTitle(query)} />
      <ListComponent
        data={listData}
        navigation={navigation}
        query={query}
        horizontal={horizontal}
      />
    </View>
  );
};

const styles = StyleSheet.create({});
