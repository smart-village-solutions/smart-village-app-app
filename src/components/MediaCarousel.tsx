import { useIsFocused } from 'expo-router/react-navigation';
import _filter from 'lodash/filter';
import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Easing } from 'react-native-reanimated';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';

import { consts, Icon, normalize, texts } from '../config';
import { imageHeight, imageWidth } from '../helpers';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { AccessibilityContext } from '../AccessibilityProvider';
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
  const styles = useThemeStyles(createStyles);
  if (item.contentType === 'image' || item.contentType === 'thumbnail') {
    const imageContainerStyle = containerStyle
      ? [styles.imageContainer, containerStyle]
      : styles.imageContainer;

    return (
      <Image source={{ uri: item.sourceUrl?.url ?? '' }} containerStyle={imageContainerStyle} />
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
  const styles = useThemeStyles(createStyles);
  const { dimensions } = useContext(OrientationContext);
  const { isReduceMotionEnabled } = useContext(AccessibilityContext);
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
  const carouselRef = useRef<ICarouselInstance>(null);

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
    (info: { item: unknown }) => {
      const mediaContent = info.item as MediaContent;

      return <MediaCarouselItem containerStyle={carouselItemContainerStyle} item={mediaContent} />;
    },
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
        ref={carouselRef}
        autoPlay={isFocused && !isPaused && !isReduceMotionEnabled}
        autoPlayInterval={autoplayInterval || (sliderSettings.autoplayInterval as number) || 4000}
        data={filteredContents}
        defaultIndex={0}
        itemWidth={itemWidth}
        loop
        renderItem={renderItem}
        style={[styles.center, { height: itemHeight, width: dimensions.width }]}
        vertical={false}
        withAnimation={withAnimation}
      />

      {showSliderPauseButton &&
        !isReduceMotionEnabled &&
        pauseButton(
          horizontalPosition,
          isCopyrighted,
          isPaused,
          setIsPaused,
          sizeSliderPauseButton,
          verticalPosition,
          styles
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
  verticalPosition: string,
  styles: ReturnType<typeof createStyles>
) => (
  <TouchableOpacity
    activeOpacity={0.8}
    accessibilityLabel={
      isPaused
        ? `${texts.accessibilityLabels.actions.startPlayback} ${consts.a11yLabel.button}`
        : `${texts.accessibilityLabels.actions.pausePlayback} ${consts.a11yLabel.button}`
    }
    accessibilityRole="button"
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

const createStyles = (colors) => ({
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
