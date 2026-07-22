import { Image as ExpoImage } from 'expo-image';
import { Grayscale } from 'react-native-color-matrix-image-filters';
import React, { useContext, useEffect, useMemo, useState } from 'react';
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

type ImageProps = {
  aspectRatio?: { width: number; height: number };
  borderRadius?: number;
  button?: TImageButton;
  buttons?: TImageButton[];
  containerStyle?: object | object[];
  imageRightsPosition?: 'inside-bottom-right' | 'outside-bottom';
  isImageFullWidth?: boolean;
  message?: string;
  PlaceholderContent?: React.ReactNode;
  placeholderStyle?: object | object[];
  refreshInterval?: number;
  resizeMode?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  source: { uri: string; headers?: object } | number;
  style?: object | object[];
};

/* eslint-disable complexity */
export const Image = ({
  aspectRatio,
  borderRadius = 0,
  button,
  buttons = [],
  containerStyle,
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
  const PlaceholderContent = placeholderContent || (
    <ActivityIndicator color={colors.refreshControl} />
  );
  const placeholderStyle = placeholderStyleProp || styles.placeholderStyle;
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(true);

  const { isGrayscaleEnabled } = useContext(AccessibilityContext);
  const { globalSettings } = useContext(SettingsContext);
  const timestamp = useInterval(refreshInterval);
  const { sueConfig = {} } = useContext(ConfigurationsContext);
  const { apiConfig = {} } = sueConfig;
  const { apiKey = '' } = apiConfig[apiConfig?.whichApi] || apiConfig;

  useEffect(() => {
    let mounted = true;

    const next =
      typeof sourceProp === 'object' && sourceProp.uri
        ? { ...sourceProp, uri: sourceProp.uri.trim?.() }
        : sourceProp;

    if (!next?.uri || next.uri.startsWith('file:///') || typeof next === 'number') {
      mounted && setSource(next);
      return () => (mounted = false);
    }

    const uriWithTick =
      refreshInterval !== undefined
        ? addQueryParam(next.uri, `svaRefreshCount=${timestamp}`)
        : next.uri;

    const headers = {
      ...(next.headers || {}),
      ...(apiKey ? { api_key: apiKey } : {})
    };

    mounted && setSource({ uri: uriWithTick, headers });

    return () => {
      mounted = false;
    };
  }, [timestamp, refreshInterval, sourceProp, apiKey]);

  const defaultImageStyle = stylesForImage(aspectRatio, isImageFullWidth).defaultStyle;

  const imageStyle = useMemo(
    () => [style || defaultImageStyle, { borderRadius }],
    [style, defaultImageStyle, borderRadius]
  );

  if (source?.uri === NO_IMAGE.uri) return null;

  const showImageRights = !!globalSettings?.showImageRights && !!sourceProp?.copyright;
  const showChildren = !!message || !!button || showImageRights;

  const imageElement = (
    <ExpoImage
      source={source}
      style={imageStyle}
      contentFit={resizeMode}
      accessible={!!sourceProp?.captionText}
      accessibilityLabel={`${sourceProp?.captionText ? sourceProp.captionText : ''} ${
        device.platform === 'ios' ? consts.a11yLabel.image : ''
      }`}
      onLoadStart={() => setLoading(true)}
      onLoadEnd={() => setLoading(false)}
    />
  );

  return (
    <View style={[containerStyle, placeholderStyle]}>
      {isGrayscaleEnabled ? <Grayscale>{imageElement}</Grayscale> : imageElement}

      {(loading || showChildren) && (
        <View style={styles.overlayFill} pointerEvents="box-none">
          {loading && (
            <View style={[styles.overlayFill, styles.loadingStyle]}>{PlaceholderContent}</View>
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
                <ImageRights imageRights={sourceProp.copyright} />
              )}
            </View>
          )}
        </View>
      )}
      {!!imageRightsPosition && showImageRights && (
        <ImageRights imageRights={sourceProp.copyright} imageRightsPosition={imageRightsPosition} />
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
