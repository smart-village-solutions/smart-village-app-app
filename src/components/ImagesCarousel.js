import { useIsFocused } from '@react-navigation/native';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Query } from 'react-apollo';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Easing } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';

import { colors, Icon, normalize } from '../config';
import { graphqlFetchPolicy, imageHeight, imageWidth, isActive, shareMessage } from '../helpers';
import { useRefreshTime } from '../hooks';
import { NetworkContext } from '../NetworkProvider';
import { OrientationContext } from '../OrientationProvider';
import { getQuery } from '../queries';
import { SettingsContext } from '../SettingsProvider';

import { ImagesCarouselItem } from './ImagesCarouselItem';
import { LoadingContainer } from './LoadingContainer';

export const ImagesCarousel = ({
  aspectRatio,
  autoplayInterval,
  data,
  isDisturber,
  isImageFullWidth,
  navigation,
  refreshTimeKey
}) => {
  const { dimensions } = useContext(OrientationContext);
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { sliderPauseButton = {}, sliderSettings = {} } = settings;
  const {
    horizontalPosition = 'right',
    show: showSliderPauseButton = false,
    size: sizeSliderPauseButton = 25,
    verticalPosition = 'bottom'
  } = sliderPauseButton;
  const refreshTime = useRefreshTime(refreshTimeKey);
  const [isPaused, setIsPaused] = useState(false);
  const [, setCarouselImageIndex] = useState(0);

  const isFocused = useIsFocused();

  const shouldShowPauseButton = showSliderPauseButton && !isDisturber;

  const fetchPolicy = graphqlFetchPolicy({
    isConnected,
    isMainserverUp,
    refreshTime
  });
  const itemWidth = imageWidth(isImageFullWidth);
  const itemHeight = imageHeight(itemWidth, aspectRatio);
  const centerOffset = Math.max((dimensions.width - itemWidth) / 2, 0);
  const carouselItemContainerStyle = useMemo(
    () => StyleSheet.flatten([styles.imageContainer, { marginLeft: centerOffset }]),
    [centerOffset]
  );
  const withAnimation = useMemo(
    () => ({
      type: 'timing',
      config: {
        duration: 850,
        easing: Easing.inOut(Easing.cubic)
      }
    }),
    []
  );

  const renderItem = useCallback(
    ({ item, refreshInterval }) => {
      const { routeName: name, params } = item.picture || {};

      // params are available, but missing `shareContent` and `details`
      // -> we want to add `shareContent` and `details` to the `params`,
      // if we have `queryVariables` with an `id`
      if (name && params?.query && params?.queryVariables?.id) {
        const id = params.queryVariables.id;
        const query = params.query;

        return (
          <Query query={getQuery(query)} variables={{ id }} fetchPolicy={fetchPolicy}>
            {({ data, loading }) => {
              if (loading) {
                return (
                  <LoadingContainer>
                    <ActivityIndicator color={colors.refreshControl} />
                  </LoadingContainer>
                );
              }

              const details = data && data[query];

              if (!details) return null;

              const source = {
                ...item.picture,
                params: {
                  ...params,
                  shareContent: { message: shareMessage(details, query) },
                  details
                }
              };

              return (
                <ImagesCarouselItem
                  aspectRatio={aspectRatio}
                  button={item.button}
                  buttons={item.buttons}
                  containerStyle={carouselItemContainerStyle}
                  isImageFullWidth={isImageFullWidth}
                  message={item.message}
                  navigation={navigation}
                  refreshInterval={item.refreshInterval || refreshInterval}
                  source={source}
                />
              );
            }}
          </Query>
        );
      }

      return (
        <ImagesCarouselItem
          aspectRatio={aspectRatio}
          button={item.button}
          buttons={item.buttons}
          containerStyle={carouselItemContainerStyle}
          isImageFullWidth={isImageFullWidth}
          message={item.message}
          navigation={navigation}
          refreshInterval={item.refreshInterval || refreshInterval}
          source={item.picture}
        />
      );
    },
    [navigation, fetchPolicy, aspectRatio, isImageFullWidth, carouselItemContainerStyle]
  );

  if (!data || data.length === 0) return null;

  // filter data for present items and items with active date/time periods
  const carouselData = data.filter((item) => item && isActive(item));

  // if there is one entry in the data, we do not want to render a whole carousel, we than just
  // need the one item to render
  if (carouselData.length === 1) {
    return renderItem({ item: carouselData[0] });
  }

  // to change the style of the pause button, the images in the slider are checked for copyright
  const isCopyrighted = data.some((item) => item.picture?.copyright);

  return (
    <View>
      <Carousel
        autoPlay={isFocused && !isPaused}
        autoPlayInterval={autoplayInterval || sliderSettings.autoplayInterval || 4000}
        data={carouselData}
        defaultIndex={0}
        itemWidth={itemWidth}
        loop
        onSnapToItem={setCarouselImageIndex}
        renderItem={({ item }) =>
          renderItem({ item, refreshInterval: sliderSettings.refreshInterval })
        }
        style={[styles.center, { height: itemHeight, width: dimensions.width }]}
        withAnimation={withAnimation}
      />

      {shouldShowPauseButton &&
        pauseButton(
          horizontalPosition,
          isCopyrighted,
          isPaused,
          setIsPaused,
          sizeSliderPauseButton,
          verticalPosition
        )}
    </View>
  );
};

const pauseButton = (
  horizontalPosition,
  isCopyrighted,
  isPaused,
  setIsPaused,
  size,
  verticalPosition
) => (
  <TouchableOpacity
    activeOpacity={0.8}
    style={[
      styles.pauseButton,
      {
        [horizontalPosition]: normalize(12),
        [verticalPosition]: isCopyrighted ? normalize(36) : normalize(12),
        borderRadius: normalize(size * 2),
        padding: normalize(size / 2)
      }
    ]}
    onPress={() => setIsPaused(!isPaused)}
  >
    {isPaused ? <Icon.Play size={normalize(size)} /> : <Icon.Pause size={normalize(size)} />}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  center: {
    alignSelf: 'center'
  },
  imageContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%'
  },
  pauseButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.surface,
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 1
  }
});

ImagesCarousel.propTypes = {
  aspectRatio: PropTypes.object,
  autoplay: PropTypes.bool,
  autoplayInterval: PropTypes.number,
  data: PropTypes.array.isRequired,
  isDisturber: PropTypes.bool,
  isImageFullWidth: PropTypes.bool,
  navigation: PropTypes.object,
  refreshTimeKey: PropTypes.string
};
