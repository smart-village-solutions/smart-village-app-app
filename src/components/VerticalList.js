import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, FlatList } from 'react-native';

import { colors, normalize } from '../config';
import { useRenderItem } from '../hooks';

import { BackToTop } from './BackToTop';

const keyExtractor = (item, index) => `index${index}-id${item.id}`;

const MAX_INITIAL_NUM_TO_RENDER = 20;

export const VerticalList = ({
  navigation,
  data,
  noSubtitle,
  query,
  fetchMoreData,
  ListHeaderComponent,
  showBackToTop,
  refreshControl
}) => {
  const flatListRef = useRef();
  const [listEndReached, setListEndReached] = useState(false);

  const renderItem = useRenderItem(query, navigation, { noSubtitle });

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
      ref={flatListRef}
      keyExtractor={keyExtractor}
      data={data}
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={() => {
        if (data.length >= MAX_INITIAL_NUM_TO_RENDER) {
          if (!listEndReached) {
            return <ActivityIndicator color={colors.accent} style={{ margin: normalize(14) }} />;
          } else if (listEndReached && showBackToTop) {
            return (
              <BackToTop
                onPress={() =>
                  flatListRef.current.scrollToIndex({
                    index: 0,
                    viewPosition: 1,
                    animated: true
                  })
                }
              />
            );
          } else {
            return null;
          }
        } else {
          return null;
        }
      }}
      initialNumToRender={
        data.length < MAX_INITIAL_NUM_TO_RENDER ? data.length : MAX_INITIAL_NUM_TO_RENDER
      }
      onEndReachedThreshold={0.5}
      onEndReached={onEndReached}
      refreshControl={refreshControl}
    />
  );
};

VerticalList.propTypes = {
  navigation: PropTypes.object,
  data: PropTypes.array,
  noSubtitle: PropTypes.bool,
  ListHeaderComponent: PropTypes.object,
  showBackToTop: PropTypes.bool,
  leftImage: PropTypes.bool,
  query: PropTypes.string,
  fetchMoreData: PropTypes.func,
  refreshControl: PropTypes.object
};

VerticalList.defaultProps = {
  noSubtitle: false,
  leftImage: false
};
