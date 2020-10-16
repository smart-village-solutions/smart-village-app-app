import PropTypes from 'prop-types';
import Carousel from 'react-native-snap-carousel';
import React, { useContext } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Query } from 'react-apollo';

import { colors } from '../config';
import { imageHeight, shareMessage } from '../helpers';
import { getQuery } from '../queries';
import { Image } from './Image';
import { LoadingContainer } from './LoadingContainer';
import { OrientationContext } from '../OrientationProvider';

const TouchableImage = ({ navigation, item, children }) => {
  const { routeName, params } = item.picture;

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate({
          routeName,
          params
        })
      }
      activeOpacity={0.8}
    >
      {children}
    </TouchableOpacity>
  );
};

TouchableImage.propTypes = {
  navigation: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired
};

export const ImagesCarousel = ({ data, navigation, fetchPolicy }) => {
  const { orientation, dimensions } = useContext(OrientationContext);

  const renderItem = ({ item }) => {
    const { routeName, params } = item.picture;

    // special image width for carousel, to be not full width on landscape
    const width = orientation === 'landscape' ? dimensions.height : dimensions.width;
    const imageStyle = {
      height: imageHeight(width),
      width
    };

    if (routeName && params) {
      // params are available, but missing `shareContent` and `details`
      // -> we want to add `shareContent` and `details` to the `params`,
      // if we have `queryVariables` with an `id`
      if (params.query && params.queryVariables && params.queryVariables.id) {
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
                <TouchableImage navigation={navigation} item={item}>
                  <Image source={item.picture} style={imageStyle} />
                </TouchableImage>
              );
            }}
          </Query>
        );
      } else {
        return (
          <TouchableImage navigation={navigation} item={item}>
            <Image source={item.picture} style={imageStyle} />
          </TouchableImage>
        );
      }
    } else {
      return <Image source={item.picture} style={imageStyle} />;
    }
  };

  return (
    <Carousel
      data={data}
      renderItem={renderItem}
      sliderWidth={dimensions.width}
      itemWidth={orientation === 'landscape' ? dimensions.height : dimensions.width}
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
  }
});

ImagesCarousel.propTypes = {
  data: PropTypes.array.isRequired,
  navigation: PropTypes.object,
  fetchPolicy: PropTypes.string
};
