import { useIsFocused } from '@react-navigation/native';
import _filter from 'lodash/filter';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Carousel from 'react-native-snap-carousel';

import { colors, Icon, normalize } from '../config';
import { imageWidth } from '../helpers';
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

const MediaCarouselItem = ({ item }: { item: MediaContent }) => {
  if (item.contentType === 'image' || item.contentType === 'thumbnail') {
    return (
      <Image source={{ uri: item.sourceUrl?.url ?? '' }} containerStyle={styles.imageContainer} />
    );
  }

  // video or audio – render via MediaItem (same look as MediaSection)
  return (
    <WrapperHorizontal>
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const carouselRef = useRef<any>(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused && !isPaused) {
      carouselRef.current?.startAutoplay();
    } else {
      carouselRef.current?.stopAutoplay();
    }
  }, [isFocused, isPaused]);

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

  const renderItem = useCallback(
    ({ item }: { item: unknown }) => <MediaCarouselItem item={item as MediaContent} />,
    []
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
        autoplay
        autoplayDelay={0}
        autoplayInterval={autoplayInterval || (sliderSettings.autoplayInterval as number) || 4000}
        containerCustomStyle={styles.center}
        data={filteredContents}
        firstItem={0}
        inactiveSlideOpacity={1}
        inactiveSlideScale={1}
        itemWidth={itemWidth}
        loop
        loopClonesPerSide={1}
        onScrollIndexChanged={setCarouselIndex}
        ref={carouselRef}
        renderItem={renderItem}
        sliderWidth={dimensions.width}
        useScrollView
        vertical={false}
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
