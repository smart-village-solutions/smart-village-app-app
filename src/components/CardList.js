import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';

import { colors, consts, normalize } from '../config';
import { CardListItem } from './CardListItem';
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
            item={item}
            orientation={orientation}
            dimensions={dimensions}
          />
        )}
        showsHorizontalScrollIndicator={false}
        horizontal
      />
    );
  }

  return (
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
      style={stylesWithProps({ orientation, dimensions }).wrapper}
      contentContainerStyle={styles.center}
    />
  );
};

const styles = StyleSheet.create({
  center: {
    alignSelf: 'center'
  }
});

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */
const stylesWithProps = ({ orientation, dimensions }) => {
  const needLandscapeWrapper =
    orientation === 'landscape' || dimensions.width > consts.DIMENSIONS.FULL_SCREEN_MAX_WIDTH;

  if (needLandscapeWrapper) {
    return StyleSheet.create({
      wrapper: {
        paddingHorizontal: '15%'
      }
    });
  }

  return StyleSheet.create({
    wrapper: {
      paddingHorizontal: 0
    }
  });
};
/* eslint-enable react-native/no-unused-styles */

CardList.propTypes = {
  navigation: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  horizontal: PropTypes.bool,
  refreshControl: PropTypes.object
};

CardList.defaultProps = {
  horizontal: false
};
