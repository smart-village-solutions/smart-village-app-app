import { Image as ExpoImage } from 'expo-image';
import type { ImageSource } from 'expo-image';
import { Grayscale } from 'react-native-color-matrix-image-filters';
import React, { useContext, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AccessibilityContext } from '../AccessibilityProvider';
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
  captionText?: string;
  copyright?: string;
};

type ImageProps = {
  aspectRatio?: { width: number; height: number };
  borderRadius?: number;
  button?: TImageButton;
  buttons?: TImageButton[];
  containerStyle?: object | object[];
  FallbackContent?: React.ReactNode;
  imageRightsPosition?: 'inside-bottom-right' | 'outside-bottom';
  isImageFullWidth?: boolean;
  message?: string;
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
  aspectRatio,
  borderRadius = 0,
  button,
  buttons = [],
  containerStyle,
  FallbackContent: fallbackContent,
  imageRightsPosition,
  isImageFullWidth,
  message,
  PlaceholderContent: placeholderContent,
  placeholderStyle: placeholderStyleProp,
  refreshInterval,
  resizeMode = 'cover',
  source: sourceProp,
  style
}: ImageProps) => {
  const { colors: colors } = useTheme();

  const styles = useThemeStyles(createStyles);
  const PlaceholderContent =
    placeholderContent === undefined ? (
      <ActivityIndicator color={colors.refreshControl} />
    ) : (
      placeholderContent
    );
  const placeholderStyle = placeholderStyleProp || styles.placeholderStyle;

  const { isGrayscaleEnabled } = useContext(AccessibilityContext);
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

  const defaultImageStyle = stylesForImage(aspectRatio, isImageFullWidth).defaultStyle;

  const imageStyle = useMemo(
    () => [style || defaultImageStyle, { borderRadius }],
    [style, defaultImageStyle, borderRadius]
  );

  if (typeof source !== 'number' && source?.uri === NO_IMAGE.uri) return null;

  const sourceMetadata = typeof sourceProp === 'number' ? undefined : sourceProp;
  const showImageRights = !!globalSettings?.showImageRights && !!sourceMetadata?.copyright;
  const showChildren = !!message || !!button || showImageRights;
  const showFallback = hasError && fallbackContent !== undefined;

  const imageElement = hasRenderableSource ? (
    <ExpoImage
      source={source}
      style={imageStyle}
      contentFit={resizeMode}
      accessible={!!sourceMetadata?.captionText}
      accessibilityLabel={`${sourceMetadata?.captionText ? sourceMetadata.captionText : ''} ${
        device.platform === 'ios' ? consts.a11yLabel.image : ''
      }`}
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
      {isGrayscaleEnabled ? <Grayscale>{imageElement}</Grayscale> : imageElement}

      {(loading || showFallback || showChildren) && (
        <View style={styles.overlayFill} pointerEvents="box-none">
          {loading && (
            <View style={[styles.overlayFill, styles.loadingStyle]}>{PlaceholderContent}</View>
          )}
          {showFallback && (
            <View style={[styles.overlayFill, styles.loadingStyle]}>{fallbackContent}</View>
          )}
          {showChildren && (
            <View style={[styles.overlayFill, styles.contentContainerStyle]}>
              {!!message && <ImageMessage message={message} />}
              {!!button && <ImageButton button={button} />}
              {!!buttons?.length &&
                buttons.map((button, index) => (
                  <ImageButton key={`${button.title}-${index}`} button={button} />
                ))}
              {!imageRightsPosition && showImageRights && (
                <ImageRights imageRights={sourceMetadata?.copyright || ''} />
              )}
            </View>
          )}
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
  contentContainerStyle: {
    height: '100%',
    justifyContent: 'flex-end'
  },

  loadingStyle: {
    alignItems: 'center',
    justifyContent: 'center'
  },

  overlayFill: {
    ...StyleSheet.absoluteFillObject
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
