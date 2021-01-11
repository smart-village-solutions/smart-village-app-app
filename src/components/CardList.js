import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';

import { colors, consts, normalize } from '../config';
import { CardListItem } from './CardListItem';
import { OrientationContext } from '../OrientationProvider';

const keyExtractor = (item, index) => `index${index}-id${item.id}`;

export const CardList = ({
  navigation,
  data,
  horizontal,
  query,
  fetchMoreData,
  ListHeaderComponent,
  refreshControl
}) => {
  const [listEndReached, setListEndReached] = useState(false);
  const { orientation, dimensions } = useContext(OrientationContext);

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
      ListHeaderComponent={ListHeaderComponent}
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
      onEndReachedThreshold={0.5}
      onEndReached={onEndReached}
      refreshControl={refreshControl}
      style={stylesWithProps({ orientation, dimensions }).wrapper}
      contentContainerStyle={styles.center}
    />
  );
};

const styles = StyleSheet.create({
  center: {
    alignSelf: 'center',
    width: '100%'
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
  query: PropTypes.string,
  fetchMoreData: PropTypes.func,
  ListHeaderComponent: PropTypes.object,
  refreshControl: PropTypes.object
};

CardList.defaultProps = {
  horizontal: false
};
