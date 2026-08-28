import { useIsFocused } from 'expo-router/react-navigation';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Query } from 'react-apollo';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Easing } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';

import { consts, Icon, normalize, texts } from '../config';
import { graphqlFetchPolicy, imageHeight, imageWidth, isActive, shareMessage } from '../helpers';
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

const MAX_DOT_PAGINATION_ITEMS = 10;

/* eslint-disable complexity */
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
  const { showNavigationButtons = false, showPagination = false } = sliderSettings;
  const refreshTime = useRefreshTime(refreshTimeKey);
  const [isPaused, setIsPaused] = useState(false);
  const [carouselImageIndex, setCarouselImageIndex] = useState(0);
  const carouselRef = useRef(null);

  const isFocused = useIsFocused();

  const showPreviousItem = useCallback(() => {
    carouselRef.current?.prev();
  }, []);

  const showNextItem = useCallback(() => {
    carouselRef.current?.next();
  }, []);

  const shouldShowNavigationButtons = showNavigationButtons && !isDisturber;
  const shouldShowPauseButton = showSliderPauseButton && !isDisturber && !isReduceMotionEnabled;
  const shouldShowPagination = showPagination && !isDisturber;

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
    [centerOffset, styles.imageContainer]
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
    ({ height = itemHeight, item, onContentHeightChange, refreshInterval }) => {
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
                  onContentHeightChange={onContentHeightChange}
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
          onContentHeightChange={onContentHeightChange}
          refreshInterval={item.refreshInterval || refreshInterval}
          source={item.picture}
          style={{ height, width: itemWidth }}
        />
      );
    },
    [
      navigation,
      fetchPolicy,
      aspectRatio,
      isImageFullWidth,
      carouselItemContainerStyle,
      colors.refreshControl
    ]
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
    <View style={[styles.carouselContainer, { height: itemHeight }]}>
      <Carousel
        ref={carouselRef}
        autoPlay={isFocused && !isPaused && !isReduceMotionEnabled}
        autoPlayInterval={autoplayInterval || sliderSettings.autoplayInterval || 4000}
        data={carouselData}
        defaultIndex={0}
        itemWidth={itemWidth}
        loop
        onSnapToItem={setCarouselImageIndex}
        renderItem={({ item }) =>
          renderItem({ item, refreshInterval: sliderSettings.refreshInterval })
        }
        style={[styles.carousel, { height: itemHeight, width: dimensions.width }]}
        withAnimation={withAnimation}
      />

      {shouldShowPagination && (
        <CarouselPagination
          activeIndex={carouselImageIndex}
          itemCount={carouselData.length}
          styles={styles}
        />
      )}

      {(shouldShowNavigationButtons || shouldShowPauseButton) && (
        <CarouselControls
          colors={colors}
          horizontalPosition={horizontalPosition}
          isCopyrighted={isCopyrighted}
          isPaused={isPaused}
          onNext={showNextItem}
          onPrevious={showPreviousItem}
          setIsPaused={setIsPaused}
          showNavigationButtons={shouldShowNavigationButtons}
          showPauseButton={shouldShowPauseButton}
          size={sizeSliderPauseButton}
          styles={styles}
          verticalPosition={verticalPosition}
        />
      )}
    </View>
  );
};
/* eslint-enable complexity */

export const CarouselPagination = ({ activeIndex, itemCount, styles }) => {
  const normalizedIndex = ((activeIndex % itemCount) + itemCount) % itemCount;
  const shouldShowDots = itemCount <= MAX_DOT_PAGINATION_ITEMS;

  return (
    <View
      accessible
      accessibilityLabel={`Bild ${normalizedIndex + 1} von ${itemCount}`}
      style={styles.pagination}
    >
      {shouldShowDots ? (
        Array.from({ length: itemCount }, (_, index) => (
          <View
            key={index}
            style={[styles.paginationDot, index === normalizedIndex && styles.paginationDotActive]}
          />
        ))
      ) : (
        <Text style={styles.paginationText}>{`${normalizedIndex + 1} / ${itemCount}`}</Text>
      )}
    </View>
  );
};

const CarouselControls = ({
  colors,
  horizontalPosition,
  isCopyrighted,
  isPaused,
  onNext,
  onPrevious,
  setIsPaused,
  showNavigationButtons,
  showPauseButton,
  size,
  styles,
  verticalPosition
}) => (
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
        onPrevious,
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
        onNext,
        size,
        styles
      )}
  </View>
);

CarouselControls.propTypes = {
  colors: PropTypes.object.isRequired,
  horizontalPosition: PropTypes.string.isRequired,
  isCopyrighted: PropTypes.bool.isRequired,
  isPaused: PropTypes.bool.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  setIsPaused: PropTypes.func.isRequired,
  showNavigationButtons: PropTypes.bool.isRequired,
  showPauseButton: PropTypes.bool.isRequired,
  size: PropTypes.number.isRequired,
  styles: PropTypes.object.isRequired,
  verticalPosition: PropTypes.string.isRequired
};

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
  carousel: {
    flex: 0,
    height: '100%'
  },
  carouselContainer: {
    alignSelf: 'center',
    width: '100%'
  },
  center: {
    alignSelf: 'center'
  },
  imageContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    overflow: 'hidden',
    position: 'relative',
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
  },
  pagination: {
    alignSelf: 'center',
    backgroundColor: colors.overlayRgba,
    borderRadius: normalize(12),
    bottom: normalize(12),
    flexDirection: 'row',
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(6),
    position: 'absolute',
    zIndex: 1
  },
  paginationDot: {
    backgroundColor: colors.surface,
    borderRadius: normalize(3),
    height: normalize(6),
    marginHorizontal: normalize(3),
    opacity: 0.5,
    width: normalize(6)
  },
  paginationDotActive: {
    opacity: 1,
    width: normalize(16)
  },
  paginationText: {
    color: colors.surface,
    fontSize: normalize(13),
    fontVariant: ['tabular-nums'],
    lineHeight: normalize(16),
    minWidth: normalize(42),
    textAlign: 'center'
  }
});

CarouselPagination.propTypes = {
  activeIndex: PropTypes.number.isRequired,
  itemCount: PropTypes.number.isRequired,
  styles: PropTypes.object.isRequired
};

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
