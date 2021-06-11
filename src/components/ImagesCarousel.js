import PropTypes from 'prop-types';
import Carousel from 'react-native-snap-carousel';
import React, { useCallback, useContext } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Query } from 'react-apollo';

import { colors } from '../config';
import { imageWidth, isActive, shareMessage } from '../helpers';
import { getQuery } from '../queries';
import { ImagesCarouselItem } from './ImagesCarouselItem';
import { LoadingContainer } from './LoadingContainer';
import { OrientationContext } from '../OrientationProvider';

export const ImagesCarousel = ({ data, navigation, fetchPolicy, aspectRatio }) => {
  const { dimensions } = useContext(OrientationContext);
  const itemWidth = imageWidth();

  const renderItem = useCallback(
    ({ item }) => {
      const { routeName, params } = item.picture || {};

      // params are available, but missing `shareContent` and `details`
      // -> we want to add `shareContent` and `details` to the `params`,
      // if we have `queryVariables` with an `id`
      if (routeName && params?.query && params?.queryVariables?.id) {
        const id = params.queryVariables.id;
        const query = params.query;

        return (
          <Query query={getQuery(query)} variables={{ id }} fetchPolicy={fetchPolicy}>
            {({ data, loading }) => {
              if (loading) {
                return (
                  <LoadingContainer>
                    <ActivityIndicator color={colors.accent} />
                  </LoadingContainer>
                );
              }

              const details = data && data[query];

              if (!details) return null;

              // extend the item.picture with new params data containing shareContent and details
              item.picture = {
                ...item.picture,
                params: {
                  ...params,
                  shareContent: { message: shareMessage(details, query) },
                  details
                }
              };

              return (
                <ImagesCarouselItem
                  navigation={navigation}
                  source={item.picture}
                  message={item.message}
                  containerStyle={styles.imageContainer}
                  aspectRatio={aspectRatio}
                  refreshInterval={item.refreshInterval}
                />
              );
            }}
          </Query>
        );
      }

      return (
        <TouchableOpacity accessibilityLiveRegion="polite" accessibilityLabel="Bilderkarussell">
          <ImagesCarouselItem
            navigation={navigation}
            source={item.picture}
            message={item.message}
            containerStyle={styles.imageContainer}
            aspectRatio={aspectRatio}
            refreshInterval={item.refreshInterval}
          />
        </TouchableOpacity>
      );
    },
    [navigation, fetchPolicy, aspectRatio]
  );

  // filter data for present items and items with active date/time periods
  const carouselData = data.filter((item) => item && isActive(item));

  // if there is one entry in the data, we do not want to render a whole carousel, we than just
  // need the one item to render
  if (carouselData.length === 1) {
    return renderItem({ item: carouselData[0] });
  }

  return (
    <Carousel
      data={carouselData}
      renderItem={renderItem}
      sliderWidth={dimensions.width}
      itemWidth={itemWidth}
      inactiveSlideScale={1}
      autoplay
      loop
      autoplayDelay={0}
      autoplayInterval={4000}
      containerCustomStyle={styles.center}
    />
  );
};

const styles = StyleSheet.create({
  center: {
    alignSelf: 'center'
  },
  imageContainer: {
    alignSelf: 'center'
  }
});

ImagesCarousel.propTypes = {
  data: PropTypes.array.isRequired,
  navigation: PropTypes.object,
  fetchPolicy: PropTypes.string,
  aspectRatio: PropTypes.object
};
