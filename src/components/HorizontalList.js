import PropTypes from 'prop-types';
import React from 'react';
import { FlatList } from 'react-native';

import { useRenderItem } from '../hooks';

const keyExtractor = (item, index) => `index${index}-id${item.id}`;

export const HorizontalList = ({ navigation, data, query }) => {
  const renderItem = useRenderItem(query, navigation, { horizontal: true });

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
  query: PropTypes.string
};
