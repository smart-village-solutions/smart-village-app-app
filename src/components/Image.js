import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Image as RNEImage } from 'react-native-elements';
import { CacheManager } from 'react-native-expo-image-cache';

import { ConfigurationsContext } from '../ConfigurationsProvider';
import { SettingsContext } from '../SettingsProvider';
import { colors, consts, device } from '../config';
import { imageHeight, imageWidth } from '../helpers';
import { useInterval } from '../hooks/TimeHooks';

import { ImageButton } from './ImageButton';
import { ImageMessage } from './ImageMessage';
import { ImageRights } from './ImageRights';

const addQueryParam = (url, param) => {
  if (!url?.length) return;

  if (url.endsWith('/')) {
    url = url.slice(0, url.length - 1);
  }

  return url.includes('?') ? `${url}&${param}` : `${url}?${param}`;
};

const NO_IMAGE = { uri: 'NO_IMAGE' };

/* eslint-disable complexity */
export const Image = ({
  aspectRatio,
  borderRadius = 0,
  button,
  childrenContainerStyle,
  containerStyle,
  imageRightsPosition,
  message,
  PlaceholderContent = <ActivityIndicator color={colors.refreshControl} />,
  placeholderStyle = styles.placeholderStyle,
  refreshInterval,
  resizeMode = 'cover',
  source: sourceProp,
  style
}) => {
  const [source, setSource] = useState(null);
  const { globalSettings } = useContext(SettingsContext);
  const timestamp = useInterval(refreshInterval);
  const { sueConfig = {} } = useContext(ConfigurationsContext);
  const { apiConfig = {} } = sueConfig;
  const { apiKey = '' } = apiConfig[apiConfig?.whichApi] || apiConfig;

  // only use cache when refreshInterval is undefined
  // if there is a source.uri to fetch, do it with the CacheManager and set the local path to show.
  // if there is no uri, the source itself should be already a local path, so set it immediately.
  useEffect(() => {
    // to fix the warning:
    // "Can't perform a React state update on an unmounted component.
    //  This is a no-op, but it indicates a memory leak in your application.
    //  To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function."
    // -> https://juliangaramendy.dev/use-promise-subscription/
    let mounted = true;

    //  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label#using_a_labeled_block_with_break
    effect: {
      if (sourceProp.uri) {
        sourceProp.uri = sourceProp.uri.trim?.();
      }

      // we do not want the refreshInterval or the caching to affect required static images or local images
      if (!sourceProp.uri || sourceProp.uri.startsWith('file:///')) {
        setSource(sourceProp);

        break effect;
      }

      if (refreshInterval !== undefined) {
        setSource({
          uri: addQueryParam(sourceProp.uri, `svaRefreshCount=${timestamp}`)
        });

        // we do not want to use the cache when the refreshInterval is defined and can return immediately
        break effect;
      }

      // we needed this control to solve the problem of image not loading on android devices in development environment
      if (__DEV__ && device.platform === 'android') {
        setSource({ uri: sourceProp.uri });

        break effect;
      }

      const cacheOptions = {
        headers: {
          ...(sourceProp.headers || {}),
          ...(apiKey ? { api_key: apiKey } : {})
        }
      };

      sourceProp.uri
        ? CacheManager.get(sourceProp.uri, cacheOptions)
            .getPath()
            .then((path) => {
              mounted && setSource({ uri: path ?? NO_IMAGE.uri });
            })
            .catch((err) => {
              console.warn(
                'An error occurred with cache management for an image',
                sourceProp.uri,
                err
              );
              mounted && setSource(NO_IMAGE);
            })
        : mounted && setSource(NO_IMAGE);
    }

    return () => (mounted = false);
  }, [timestamp, refreshInterval, sourceProp, setSource]);

  if (source?.uri === NO_IMAGE.uri) return null;

  const showImageRights = !!globalSettings?.showImageRights && !!sourceProp?.copyright;
  const showChildren = !!message || !!button || showImageRights;

  return (
    <View>
      <RNEImage
        source={source}
        childrenContainerStyle={childrenContainerStyle || stylesForImage(aspectRatio).defaultStyle}
        containerStyle={containerStyle}
        style={style}
        PlaceholderContent={PlaceholderContent}
        placeholderStyle={placeholderStyle}
        accessible={!!sourceProp?.captionText}
        accessibilityLabel={`${sourceProp?.captionText ? sourceProp.captionText : ''} ${
          device.platform === 'ios' ? consts.a11yLabel.image : ''
        }`}
        resizeMode={resizeMode}
        borderRadius={borderRadius}
      >
        {showChildren && (
          <View style={styles.contentContainerStyle}>
            {!!message && <ImageMessage message={message} />}
            {!!button && <ImageButton button={button} />}
            {!imageRightsPosition && showImageRights && (
              <ImageRights imageRights={sourceProp.copyright} />
            )}
          </View>
        )}
      </RNEImage>
      {!!imageRightsPosition && showImageRights && (
        <ImageRights imageRights={sourceProp.copyright} imageRightsPosition={imageRightsPosition} />
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
  placeholderStyle: {
    backgroundColor: colors.transparent,
    flex: 1
  }
});

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that eslint warning */
// we need to call the default styles in a method to ensure correct defaults for image aspect ratio,
// which could be overwritten bei server global settings. otherwise (as default prop) the style
// would be set before the overwriting occurred.
const stylesForImage = (aspectRatio) => {
  const width = imageWidth();

  return StyleSheet.create({
    defaultStyle: {
      height: imageHeight(width, aspectRatio),
      width
    }
  });
};
/* eslint-enable react-native/no-unused-styles */

Image.propTypes = {
  aspectRatio: PropTypes.object,
  borderRadius: PropTypes.number,
  button: PropTypes.object,
  childrenContainerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  containerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  imageRightsPosition: PropTypes.string,
  message: PropTypes.string,
  PlaceholderContent: PropTypes.object,
  placeholderStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  refreshInterval: PropTypes.number,
  resizeMode: PropTypes.string,
  source: PropTypes.oneOfType([PropTypes.object, PropTypes.number]).isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
};
