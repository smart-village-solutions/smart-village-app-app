import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, FlatList } from 'react-native';

import { colors, normalize } from '../config';

import { BackToTop } from './BackToTop';
import { TextListItem } from './TextListItem';

const keyExtractor = (item, index) => `index${index}-id${item.id}`;

export const TextList = ({
  navigation,
  data,
  noSubtitle,
  leftImage,
  query,
  fetchMoreData,
  ListHeaderComponent,
  showBackToTop,
  refreshControl
}) => {
  const flatListRef = useRef();
  const [listEndReached, setListEndReached] = useState(false);

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
      renderItem={({ item }) => <TextListItem {...{ navigation, item, noSubtitle, leftImage }} />}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={() => {
        if (data.length > 10) {
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
      initialNumToRender={data.length < 20 ? data.length : 20}
      onEndReachedThreshold={0.5}
      onEndReached={onEndReached}
      refreshControl={refreshControl}
    />
  );
};

TextList.propTypes = {
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

TextList.defaultProps = {
  noSubtitle: false,
  leftImage: false
};
