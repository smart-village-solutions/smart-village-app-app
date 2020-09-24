import PropTypes from 'prop-types';
import Carousel from 'react-native-snap-carousel';
import React from 'react';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { Query } from 'react-apollo';

import { colors, device } from '../config';
import { shareMessage } from '../helpers';
import { getQuery } from '../queries';
import { Image } from './Image';
import { LoadingContainer } from './LoadingContainer';

const TouchableImage = ({ navigation, item }) => {
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
      <Image source={item.picture} />
    </TouchableOpacity>
  );
};

TouchableImage.propTypes = {
  navigation: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired
};


export const ImagesCarousel = ({ data, navigation, fetchPolicy }) => {
  const renderItem = ({ item }) => {
    const { routeName, params } = item.picture;

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

              return <TouchableImage navigation={navigation} item={item} />;
            }}
          </Query>
        );
      } else {
        return <TouchableImage navigation={navigation} item={item} />;
      }
    } else {
      return <Image source={item.picture} />;
    }
  };

  return (
    <Carousel
      data={data}
      renderItem={renderItem}
      sliderWidth={device.width}
      itemWidth={device.width}
      inactiveSlideScale={1}
      autoplay
      loop
      autoplayDelay={0}
      autoplayInterval={4000}
    />
  );
};

ImagesCarousel.propTypes = {
  data: PropTypes.array.isRequired,
  navigation: PropTypes.object,
  fetchPolicy: PropTypes.string
};
