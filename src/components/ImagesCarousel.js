import { useIsFocused } from '@react-navigation/native';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Query } from 'react-apollo';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import Carousel from 'react-native-snap-carousel';

import { consts, Icon, normalize, texts } from '../config';
import { graphqlFetchPolicy, imageWidth, isActive, shareMessage } from '../helpers';
import { useRefreshTime } from '../hooks';
import { useTheme } from '../hooks/useTheme';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { AccessibilityContext } from '../AccessibilityProvider';
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
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const { dimensions } = useContext(OrientationContext);
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { isReduceMotionEnabled } = useContext(AccessibilityContext);
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { sliderPauseButton = {}, sliderSettings = {} } = settings;
  const {
    horizontalPosition = 'right',
    show: showSliderPauseButton = false,
    size: sizeSliderPauseButton = 25,
    verticalPosition = 'bottom'
  } = sliderPauseButton;
  const { showNavigationButtons = false } = sliderSettings;
  const refreshTime = useRefreshTime(refreshTimeKey);
  const [isPaused, setIsPaused] = useState(false);
  const [, setCarouselImageIndex] = useState(0);

  const carouselRef = useRef();
  const isFocused = useIsFocused();

  const showPreviousItem = useCallback(() => {
    carouselRef.current?.snapToPrev();
  }, []);

  const showNextItem = useCallback(() => {
    carouselRef.current?.snapToNext();
  }, []);

  useEffect(() => {
    if (!isFocused || isReduceMotionEnabled) {
      carouselRef.current?.stopAutoplay();
      return;
    }

    carouselRef.current?.startAutoplay();
  }, [isFocused, isReduceMotionEnabled]);

  useEffect(() => {
    if (isReduceMotionEnabled) {
      carouselRef.current?.stopAutoplay();
      return;
    }

    isPaused ? carouselRef.current?.stopAutoplay() : carouselRef.current?.startAutoplay();
  }, [isPaused, isReduceMotionEnabled]);

  const shouldShowNavigationButtons = showNavigationButtons && !isDisturber;
  const shouldShowPauseButton = showSliderPauseButton && !isDisturber && !isReduceMotionEnabled;

  const fetchPolicy = graphqlFetchPolicy({
    isConnected,
    isMainserverUp,
    refreshTime
  });
  const itemWidth = imageWidth(isImageFullWidth);

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
                  aspectRatio={aspectRatio}
                  button={item.button}
                  buttons={item.buttons}
                  containerStyle={styles.imageContainer}
                  isImageFullWidth={isImageFullWidth}
                  message={item.message}
                  navigation={navigation}
                  refreshInterval={item.refreshInterval || refreshInterval}
                  source={item.picture}
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
          containerStyle={styles.imageContainer}
          isImageFullWidth={isImageFullWidth}
          message={item.message}
          navigation={navigation}
          refreshInterval={item.refreshInterval || refreshInterval}
          source={item.picture}
        />
      );
    },
    [navigation, fetchPolicy, aspectRatio, isImageFullWidth, colors.refreshControl, styles]
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
        autoplay={!isReduceMotionEnabled}
        autoplayDelay={0}
        autoplayInterval={autoplayInterval || sliderSettings.autoplayInterval || 4000}
        containerCustomStyle={styles.center}
        data={carouselData}
        enableMomentum
        firstItem={-carouselData.length}
        inactiveSlideOpacity={1}
        inactiveSlideScale={1}
        itemWidth={itemWidth}
        loop
        loopClonesPerSide={carouselData.length}
        onScrollIndexChanged={setCarouselImageIndex}
        ref={carouselRef}
        removeClippedSubviews={false}
        renderItem={({ item }) =>
          renderItem({ item, refreshInterval: sliderSettings.refreshInterval })
        }
        sliderWidth={dimensions.width}
      />

      {(shouldShowNavigationButtons || shouldShowPauseButton) &&
        carouselControls(
          horizontalPosition,
          isCopyrighted,
          isPaused,
          shouldShowNavigationButtons,
          shouldShowPauseButton,
          showNextItem,
          showPreviousItem,
          setIsPaused,
          sizeSliderPauseButton,
          verticalPosition,
          colors,
          styles
        )}
    </View>
  );
};

const carouselControls = (
  horizontalPosition,
  isCopyrighted,
  isPaused,
  showNavigationButtons,
  showPauseButton,
  showNextItem,
  showPreviousItem,
  setIsPaused,
  size,
  verticalPosition,
  colors,
  styles
) => (
  <View
    pointerEvents="box-none"
    style={[
      styles.carouselControls,
      {
        [horizontalPosition]: normalize(12),
        [verticalPosition]: isCopyrighted ? normalize(36) : normalize(12)
      }
    ]}
  >
    {showNavigationButtons &&
      navigationButton(
        texts.accessibilityLabels.actions.previousCarouselItem,
        <Icon.ArrowLeft color={colors.darkText} size={normalize(size)} />,
        showPreviousItem,
        size,
        styles
      )}
    {showPauseButton && (
      <TouchableOpacity
        activeOpacity={0.8}
        accessibilityLabel={
          isPaused
            ? `${texts.accessibilityLabels.actions.startPlayback} ${consts.a11yLabel.button}`
            : `${texts.accessibilityLabels.actions.pausePlayback} ${consts.a11yLabel.button}`
        }
        accessibilityRole="button"
        style={[styles.controlButton, controlButtonSize(size)]}
        onPress={() => setIsPaused(!isPaused)}
      >
        {isPaused ? <Icon.Play size={normalize(size)} /> : <Icon.Pause size={normalize(size)} />}
      </TouchableOpacity>
    )}
    {showNavigationButtons &&
      navigationButton(
        texts.accessibilityLabels.actions.nextCarouselItem,
        <Icon.ArrowRight color={colors.darkText} size={normalize(size)} />,
        showNextItem,
        size,
        styles
      )}
  </View>
);

const navigationButton = (accessibilityLabel, icon, onPress, size, styles) => (
  <TouchableOpacity
    activeOpacity={0.8}
    accessibilityLabel={`${accessibilityLabel} ${consts.a11yLabel.button}`}
    accessibilityRole="button"
    onPress={onPress}
    style={[styles.controlButton, controlButtonSize(size)]}
  >
    {icon}
  </TouchableOpacity>
);

const controlButtonSize = (size) => ({
  borderRadius: normalize(size * 2),
  padding: normalize(size / 2)
});

const createStyles = (colors) => ({
  center: {
    alignSelf: 'center'
  },
  imageContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%'
  },
  carouselControls: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: normalize(4),
    position: 'absolute',
    zIndex: 1
  },
  controlButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.surface,
    justifyContent: 'center'
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
