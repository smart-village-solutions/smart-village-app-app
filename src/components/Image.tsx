import { Image as ExpoImage } from 'expo-image';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ConfigurationsContext } from '../ConfigurationsProvider';
import { SettingsContext } from '../SettingsProvider';
import { colors, consts, device } from '../config';
import { imageHeight, imageWidth } from '../helpers';
import { useInterval } from '../hooks/TimeHooks';

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
  message,
  PlaceholderContent = <ActivityIndicator color={colors.refreshControl} />,
  placeholderStyle = styles.placeholderStyle,
  refreshInterval,
  resizeMode = 'cover',
  source: sourceProp,
  style
}: ImageProps) => {
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(true);

  const { globalSettings } = useContext(SettingsContext);
  const timestamp = useInterval(refreshInterval);
  const { sueConfig = {} } = useContext(ConfigurationsContext);
  const { apiConfig = {} } = sueConfig;
  const { apiKey = '' } = apiConfig[apiConfig?.whichApi] || apiConfig;

  useEffect(() => {
    let mounted = true;

    const next = typeof sourceProp === 'object' ? { ...sourceProp } : sourceProp;

    if (next?.uri) next.uri = next.uri.trim?.();

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

  if (source?.uri === NO_IMAGE.uri) return null;

  const showImageRights = !!globalSettings?.showImageRights && !!sourceProp?.copyright;
  const showChildren = !!message || !!button || showImageRights;
  const defaultImageStyle = stylesForImage(aspectRatio).defaultStyle;

  const imageStyle = useMemo(
    () => [style || defaultImageStyle, { borderRadius }],
    [style, defaultImageStyle, borderRadius]
  );

  return (
    <View style={[containerStyle, placeholderStyle]}>
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
              {showImageRights && <ImageRights imageRights={sourceProp.copyright} />}
            </View>
          )}
        </View>
      )}
    </View>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
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
const stylesForImage = (aspectRatio?: { width: number; height: number }) => {
  const width = imageWidth();
  return StyleSheet.create({
    defaultStyle: {
      height: imageHeight(width, aspectRatio),
      width
    }
  });
};
/* eslint-enable react-native/no-unused-styles */
