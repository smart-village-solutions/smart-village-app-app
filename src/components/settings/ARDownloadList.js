import React from 'react';
import { FlatList } from 'react-native';

import { texts } from '../../config';
import { QUERY_TYPES } from '../../queries';
import { ARDownloadListItem } from '../ARDownloadListItem';

const renderItem = ({ item }) => <ARDownloadListItem item={item} />;

export const ARDownloadList = () => {
  const data = [
    {
      title: texts.settingsTitles.arListTitle,
      queryType: QUERY_TYPES.AR_DOWNLOAD_LIST
    }
  ];

  return <FlatList data={data} renderItem={renderItem} keyExtractor={(item) => item.queryType} />;
};
