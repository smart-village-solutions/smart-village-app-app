import { Image as ExpoImage } from 'expo-image';
import type { ImageContentPosition, ImageSource } from 'expo-image';
import React, { useContext, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ConfigurationsContext } from '../ConfigurationsProvider';
import { SettingsContext } from '../SettingsProvider';
import { consts, device } from '../config';
import { imageHeight, imageWidth } from '../helpers';
import { useInterval } from '../hooks/TimeHooks';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useTheme } from '../hooks/useTheme';

import { ImageButton, TImageButton } from './ImageButton';
import { ImageMessage } from './ImageMessage';
import { ImageRights } from './ImageRights';

const addQueryParam = (url, param) => {
  if (!url?.length) return;
  if (url.endsWith('/')) url = url.slice(0, url.length - 1);
  return url.includes('?') ? `${url}&${param}` : `${url}?${param}`;
};

const NO_IMAGE = { uri: 'NO_IMAGE' };

type AppImageSource = ImageSource & {
  accessibilityLabel?: string;
  captionText?: string;
  copyright?: string;
};

type ImageProps = {
  accessible?: boolean;
  aspectRatio?: { width: number; height: number };
  borderRadius?: number;
  button?: TImageButton;
  buttons?: TImageButton[];
  containerStyle?: object | object[];
  FallbackContent?: React.ReactNode;
  imageRightsPosition?: 'inside-bottom-right' | 'outside-bottom';
  isImageFullWidth?: boolean;
  message?: string;
  contentPosition?: ImageContentPosition;
  onContentHeightChange?: (height: number) => void;
  PlaceholderContent?: React.ReactNode;
  placeholderStyle?: object | object[];
  refreshInterval?: number;
  resizeMode?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  source: AppImageSource | number;
  style?: object | object[];
};

type ImageLoadState = {
  hasError: boolean;
  key: string;
  loading: boolean;
};

/* eslint-disable complexity */
export const Image = ({
  accessible,
  aspectRatio,
  borderRadius = 0,
  button,
  buttons = [],
  containerStyle,
  FallbackContent: fallbackContent,
  imageRightsPosition,
  isImageFullWidth,
  message,
  contentPosition,
  onContentHeightChange,
  PlaceholderContent: placeholderContent,
  placeholderStyle: placeholderStyleProp,
  refreshInterval,
  resizeMode = 'cover',
  source: sourceProp,
  style
}: ImageProps) => {
  const { colors: colors } = useTheme();

  const [contentHeight, setContentHeight] = useState(0);

  const styles = useThemeStyles(createStyles);
  const PlaceholderContent =
    placeholderContent === undefined ? (
      <ActivityIndicator color={colors.refreshControl} />
    ) : (
      placeholderContent
    );
  const placeholderStyle = placeholderStyleProp || styles.placeholderStyle;

  const { globalSettings } = useContext(SettingsContext);
  const timestamp = useInterval(refreshInterval);
  const { sueConfig = {} } = useContext(ConfigurationsContext);
  const { apiConfig = {} } = sueConfig;
  const { apiKey = '' } = apiConfig[apiConfig?.whichApi] || apiConfig;

  const source = useMemo(() => {
    const next =
      typeof sourceProp !== 'number' && sourceProp.uri
        ? { ...sourceProp, uri: sourceProp.uri.trim?.() }
        : sourceProp;

    if (typeof next === 'number' || !next.uri || next.uri.startsWith('file:///')) {
      return next;
    }

    const uriWithTick =
      refreshInterval !== undefined
        ? addQueryParam(next.uri, `svaRefreshCount=${timestamp}`)
        : next.uri;

    const headers = {
      ...(next.headers || {}),
      ...(apiKey ? { api_key: String(apiKey) } : {})
    };

    return { ...next, uri: uriWithTick, headers };
  }, [timestamp, refreshInterval, sourceProp, apiKey]);

  const hasRenderableSource =
    typeof source === 'number' || (typeof source?.uri === 'string' && source.uri.trim().length > 0);
  const sourceKey =
    typeof source === 'number'
      ? `asset:${source}`
      : `${source?.uri || ''}:${JSON.stringify(source?.headers || {})}`;
  const [loadState, setLoadState] = useState<ImageLoadState>(() => ({
    hasError: !hasRenderableSource,
    key: sourceKey,
    loading: hasRenderableSource
  }));
  const currentLoadState =
    loadState.key === sourceKey
      ? loadState
      : { hasError: !hasRenderableSource, key: sourceKey, loading: hasRenderableSource };
  const { hasError, loading } = currentLoadState;

  const sourceMetadata = typeof sourceProp === 'number' ? undefined : sourceProp;
  const configuredAccessibilityLabel =
    typeof sourceMetadata?.accessibilityLabel === 'string'
      ? sourceMetadata.accessibilityLabel.trim()
      : sourceMetadata?.captionText?.trim();
  const isImageAccessible = accessible ?? !!configuredAccessibilityLabel;
  const accessibilityLabel =
    isImageAccessible && configuredAccessibilityLabel
      ? `${configuredAccessibilityLabel}${
          device.platform === 'ios' ? ` ${consts.a11yLabel.image}` : ''
        }`
      : undefined;
  const showImageRights = !!globalSettings?.showImageRights && !!sourceMetadata?.copyright;
  const additionalButtons = buttons.filter(
    (item) => !button || item.routeName !== button.routeName || item.title !== button.title
  );
  const showChildren = !!message || !!button || !!additionalButtons.length || showImageRights;
  const showFallback = hasError && fallbackContent !== undefined;
  const defaultImageStyle = stylesForImage(aspectRatio, isImageFullWidth).defaultStyle;

  const imageStyle = useMemo(
    () => [style || defaultImageStyle, { borderRadius }],
    [style, defaultImageStyle, borderRadius]
  );
  const imageDimensions = useMemo(() => {
    const { height, width } = StyleSheet.flatten(imageStyle);

    return { height, width };
  }, [imageStyle]);
  const overlayStyle = [styles.overlayFill, imageDimensions];

  if (typeof source !== 'number' && source?.uri === NO_IMAGE.uri) return null;

  const imageElement = hasRenderableSource ? (
    <ExpoImage
      source={source}
      style={imageStyle}
      contentFit={resizeMode}
      contentPosition={contentPosition}
      accessible={isImageAccessible}
      accessibilityElementsHidden={!isImageAccessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={isImageAccessible ? 'image' : undefined}
      importantForAccessibility={isImageAccessible ? 'yes' : 'no'}
      onLoadStart={() => {
        setLoadState({ hasError: false, key: sourceKey, loading: true });
      }}
      onError={() => {
        setLoadState({ hasError: true, key: sourceKey, loading: false });
      }}
      onLoadEnd={() =>
        setLoadState((state) => ({
          hasError: state.key === sourceKey && state.hasError,
          key: sourceKey,
          loading: false
        }))
      }
    />
  ) : null;

  return (
    <View style={[containerStyle, placeholderStyle]}>
      {imageElement}

      {loading && (
        <View style={[overlayStyle, styles.loadingStyle]} pointerEvents="none">
          {PlaceholderContent}
        </View>
      )}
      {showFallback && (
        <View style={[overlayStyle, styles.loadingStyle]}>{fallbackContent}</View>
      )}
      {showChildren && (
        <View style={[overlayStyle, styles.contentContainerStyle]} pointerEvents="box-none">
          <View
            style={[
              styles.content,
              { top: Math.max(imageDimensions.height - contentHeight, 0) }
            ]}
            onLayout={({ nativeEvent }) => {
              const nextContentHeight = nativeEvent.layout.height;

              if (nextContentHeight === contentHeight) return;

              setContentHeight(nextContentHeight);
              onContentHeightChange?.(nextContentHeight);
            }}
          >
            {!!message && <ImageMessage message={message} />}
            {!!button && <ImageButton button={button} />}
            {!!additionalButtons.length &&
              additionalButtons.map((button, index) => (
                <ImageButton key={`${button.title}-${index}`} button={button} />
              ))}
            {!imageRightsPosition && showImageRights && (
              <ImageRights imageRights={sourceMetadata?.copyright || ''} />
            )}
          </View>
        </View>
      )}
      {!!imageRightsPosition && showImageRights && (
        <ImageRights
          imageRights={sourceMetadata?.copyright || ''}
          imageRightsPosition={imageRightsPosition}
        />
      )}
    </View>
  );
};
/* eslint-enable complexity */

const createStyles = (colors) => ({
  content: {
    left: 0,
    position: 'absolute',
    right: 0
  },
  contentContainerStyle: {
    zIndex: 1
  },

  loadingStyle: {
    alignItems: 'center',
    justifyContent: 'center'
  },

  overlayFill: {
    left: 0,
    position: 'absolute',
    top: 0,
    zIndex: 1
  },

  placeholderStyle: {
    backgroundColor: colors.transparent
  }
});

/* eslint-disable react-native/no-unused-styles */
const stylesForImage = (
  aspectRatio?: { width: number; height: number },
  isImageFullWidth?: boolean
) => {
  const width = imageWidth(isImageFullWidth);

  return StyleSheet.create({
    defaultStyle: {
      height: imageHeight(width, aspectRatio),
      width
    }
  });
};
/* eslint-enable react-native/no-unused-styles */
