import PropTypes from 'prop-types';
import React from 'react';
import { FlatList } from 'react-native';

import { useRenderItem } from '../hooks';

const keyExtractor = (item) => `${item.params?.query || 'item'}-${item.id}`;

export const HorizontalList = ({ navigation, data, query, listType }) => {
  const renderItem = useRenderItem(query, navigation, { horizontal: true, listType });

  return (
    <FlatList
      keyExtractor={keyExtractor}
      data={data}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      horizontal
    />
  );
};

HorizontalList.propTypes = {
  navigation: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  listType: PropTypes.string,
  query: PropTypes.string
};
