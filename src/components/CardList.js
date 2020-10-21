import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
import { ActivityIndicator, FlatList } from 'react-native';

import { colors, normalize } from '../config';
import { CardListItem } from './CardListItem';
import { WrapperWithOrientation } from './Wrapper';
import { OrientationContext } from '../OrientationProvider';

export const CardList = ({ data, navigation, horizontal, refreshControl }) => {
  const [listEndReached, setListEndReached] = useState(false);
  const { orientation, dimensions } = useContext(OrientationContext);

  const keyExtractor = (item, index) => `index${index}-id${item.id}`;

  if (horizontal) {
    return (
      <FlatList
        keyExtractor={keyExtractor}
        data={data}
        renderItem={({ item }) => (
          <CardListItem
            navigation={navigation}
            horizontal={horizontal}
            orientation={orientation}
            dimensions={dimensions}
            item={item}
          />
        )}
        showsHorizontalScrollIndicator={false}
        horizontal
      />
    );
  }

  return (
    <WrapperWithOrientation orientation={orientation}>
      <FlatList
        keyExtractor={keyExtractor}
        data={data}
        renderItem={({ item }) => (
          <CardListItem
            navigation={navigation}
            horizontal={horizontal}
            item={item}
            orientation={orientation}
            dimensions={dimensions}
          />
        )}
        ListFooterComponent={
          data.length > 10 &&
          !listEndReached && (
            <ActivityIndicator color={colors.accent} style={{ margin: normalize(14) }} />
          )
        }
        onEndReached={() => setListEndReached(true)}
        refreshControl={refreshControl}
      />
    </WrapperWithOrientation>
  );
};

CardList.propTypes = {
  navigation: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  horizontal: PropTypes.bool,
  refreshControl: PropTypes.object
};

CardList.defaultProps = {
  horizontal: false
};
