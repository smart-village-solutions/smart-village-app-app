import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList } from 'react-native';

import { colors, normalize } from '../config';
import { TextListItem } from './TextListItem';

export const TextList = ({
  data,
  navigation,
  noSubtitle,
  query,
  fetchMoreData,
  ListHeaderComponent,
  refreshControl
}) => {
  const [listEndReached, setListEndReached] = useState(false);

  const keyExtractor = (item, index) => `index${index}-id${item.id}`;

  const onEndReached = async () => {
    if (fetchMoreData) {
      // if there is a pagination, the end of the list is reached, when no more data is returned
      // from partially fetching, so we need to check the the data to determine the lists end
      const { data: moreData } = await fetchMoreData();

      setListEndReached(!moreData[query].length);
    } else {
      setListEndReached(true);
    }
  };

  return (
    <FlatList
      ListHeaderComponent={ListHeaderComponent}
      keyExtractor={keyExtractor}
      data={data}
      renderItem={({ item }) => (
        <TextListItem navigation={navigation} noSubtitle={noSubtitle} item={item} />
      )}
      ListFooterComponent={
        data.length > 10 &&
        !listEndReached && (
          <ActivityIndicator color={colors.accent} style={{ margin: normalize(14) }} />
        )
      }
      onEndReachedThreshold={0.5}
      onEndReached={onEndReached}
      refreshControl={refreshControl}
    />
  );
};

TextList.propTypes = {
  navigation: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  noSubtitle: PropTypes.bool,
  query: PropTypes.string,
  fetchMoreData: PropTypes.func,
  ListHeaderComponent: PropTypes.object,
  refreshControl: PropTypes.object
};

TextList.defaultProps = {
  noSubtitle: false
};
