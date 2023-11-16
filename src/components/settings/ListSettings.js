import React, { useContext } from 'react';
import { FlatList } from 'react-native';

import { texts } from '../../config';
import { QUERY_TYPES } from '../../queries';
import { SettingsContext } from '../../SettingsProvider';
import { ListSettingsItem } from '../ListSettingsItem';

const renderItem = ({ item }) => <ListSettingsItem item={item} />;
const keyExtractor = (item) => item.queryType;

export const ListSettings = () => {
  const categoriesNews = useContext(SettingsContext).globalSettings?.sections?.categoriesNews ?? [
    {
      categoryTitle: texts.settingsTitles.listLayouts.newsItemsTitle
    }
  ];
  const data = [
    {
      title: categoriesNews.map((categoryNews) => categoryNews.categoryTitle).join(', '),
      queryType: QUERY_TYPES.NEWS_ITEMS
    },
    {
      title: texts.settingsTitles.listLayouts.eventRecordsTitle,
      queryType: QUERY_TYPES.EVENT_RECORDS
    },
    {
      title: texts.settingsTitles.listLayouts.pointsOfInterestAndToursTitle,
      queryType: QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS
    }
  ];

  return <FlatList data={data} keyExtractor={keyExtractor} renderItem={renderItem} />;
};
