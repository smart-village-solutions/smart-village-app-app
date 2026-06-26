import { useIsFocused } from '@react-navigation/native';
import _filter from 'lodash/filter';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Easing } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';

import { colors, Icon, normalize } from '../config';
import { imageHeight, imageWidth } from '../helpers';
import { OrientationContext } from '../OrientationProvider';
import { SettingsContext } from '../SettingsProvider';

import { Image } from './Image';
import { MediaItem } from './MediaSection';
import { WrapperHorizontal } from './Wrapper';

type MediaContent = {
  contentType: string;
  id: string;
  sourceUrl?: {
    id?: string;
    url?: string;
  };
  copyright?: string;
  captionText?: string;
};

type MediaCarouselProps = {
  autoplayInterval?: number;
  mediaContents?: MediaContent[];
};

const MediaCarouselItem = ({
  containerStyle,
  item
}: {
  containerStyle?: object;
  item: MediaContent;
}) => {
  if (item.contentType === 'image' || item.contentType === 'thumbnail') {
    return (
      <Image
        source={{ uri: item.sourceUrl?.url ?? '' }}
        containerStyle={[styles.imageContainer, containerStyle]}
      />
    );
  }

  // video or audio – render via MediaItem (same look as MediaSection)
  return (
    <WrapperHorizontal style={containerStyle}>
      <MediaItem mediaContent={item} />
    </WrapperHorizontal>
  );
};

export const MediaCarousel = ({ autoplayInterval, mediaContents }: MediaCarouselProps) => {
  const { dimensions } = useContext(OrientationContext);
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { sliderPauseButton = {}, sliderSettings = {} } = settings as {
    sliderPauseButton?: Record<string, unknown>;
    sliderSettings?: Record<string, unknown>;
  };
  const {
    horizontalPosition = 'right',
    show: showSliderPauseButton = false,
    size: sizeSliderPauseButton = 25,
    verticalPosition = 'bottom'
  } = sliderPauseButton as {
    horizontalPosition?: string;
    show?: boolean;
    size?: number;
    verticalPosition?: string;
  };

  const [isPaused, setIsPaused] = useState(false);
  const [, setCarouselIndex] = useState(0);

  const isFocused = useIsFocused();

  const filteredContents = _filter(
    mediaContents,
    (mc: MediaContent) =>
      (mc.contentType === 'image' ||
        mc.contentType === 'thumbnail' ||
        mc.contentType === 'video' ||
        mc.contentType === 'audio') &&
      !!mc.sourceUrl?.url
  );

  const itemWidth = imageWidth();
  const itemHeight = Math.max(imageHeight(itemWidth), normalize(210));
  const centerOffset = Math.max((dimensions.width - itemWidth) / 2, 0);
  const carouselItemContainerStyle = useMemo(
    () => ({
      marginLeft: centerOffset
    }),
    [centerOffset]
  );
  const withAnimation = useMemo(
    () => ({
      type: 'timing' as const,
      config: {
        duration: 850,
        easing: Easing.inOut(Easing.cubic)
      }
    }),
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: unknown }) => (
      <MediaCarouselItem containerStyle={carouselItemContainerStyle} item={item as MediaContent} />
    ),
    [carouselItemContainerStyle]
  );

  if (!filteredContents?.length) return null;

  // Single item – render directly without carousel wrapper
  if (filteredContents.length === 1) {
    return <MediaCarouselItem item={filteredContents[0]} />;
  }

  // Check for copyright to adjust pause button position
  const isCopyrighted = filteredContents.some(
    (item) => item.contentType === 'image' && !!item.copyright
  );

  return (
    <View>
      <Carousel
        autoPlay={isFocused && !isPaused}
        autoPlayInterval={autoplayInterval || (sliderSettings.autoplayInterval as number) || 4000}
        data={filteredContents}
        defaultIndex={0}
        itemWidth={itemWidth}
        loop
        onSnapToItem={setCarouselIndex}
        renderItem={renderItem}
        style={[styles.center, { height: itemHeight, width: dimensions.width }]}
        vertical={false}
        withAnimation={withAnimation}
      />

      {showSliderPauseButton &&
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
  horizontalPosition: string,
  isCopyrighted: boolean,
  isPaused: boolean,
  setIsPaused: (paused: boolean) => void,
  size: number,
  verticalPosition: string
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
