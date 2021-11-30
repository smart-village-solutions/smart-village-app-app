import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { CacheManager } from 'react-native-expo-image-cache';
import { Image as RNEImage } from 'react-native-elements';

import { consts, colors } from '../config';
import { imageHeight, imageWidth } from '../helpers';
import { SettingsContext } from '../SettingsProvider';
import { useInterval } from '../hooks/TimeHooks';

import { ImageMessage } from './ImageMessage';
import { ImageRights } from './ImageRights';

const addQueryParam = (url, param) => {
  if (!url?.length) return;

  if (url.endsWith('/')) {
    url = url.slice(0, url.length - 1);
  }

  return url.includes('?') ? `${url}&${param}` : `${url}?${param}`;
};

export const Image = ({
  message,
  style,
  containerStyle,
  PlaceholderContent,
  aspectRatio,
  resizeMode,
  borderRadius,
  refreshInterval,
  ...props
}) => {
  const [source, setSource] = useState(null);
  const { globalSettings } = useContext(SettingsContext);
  const timestamp = useInterval(refreshInterval);

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
      // we do not want the refreshInterval or the caching to affect required static images or local images
      if (!props.source.uri || props.source.uri.startsWith('file:///')) {
        setSource(props.source);

        break effect;
      }

      if (refreshInterval !== undefined) {
        setSource({
          uri: addQueryParam(props.source.uri, `svaRefreshCount=${timestamp}`)
        });

        // we do not want to use the cache when the refreshInterval is defined and can return immediately
        break effect;
      }

      props.source.uri
        ? CacheManager.get(props.source.uri)
            .getPath()
            .then((path) => {
              mounted && setSource({ uri: path });
            })
            .catch((err) => {
              console.warn(
                'An error occurred with cache management for an image',
                props.source.uri,
                err
              );
              mounted && setSource(props.source);
            })
        : mounted && setSource(props.source);
    }

    return () => (mounted = false);
  }, [timestamp, refreshInterval, props.source, setSource]);

  return (
    <View>
      <RNEImage
        source={source}
        style={style || stylesForImage(aspectRatio).defaultStyle}
        containerStyle={containerStyle}
        PlaceholderContent={PlaceholderContent}
        placeholderStyle={{ backgroundColor: colors.transparent }}
        accessible={!!props.source?.captionText}
        accessibilityLabel={`${props.source.captionText ? props.source.captionText : ''} ${
          consts.a11yLabel.image
        }`}
        resizeMode={resizeMode}
        borderRadius={borderRadius}
      >
        {!!message && <ImageMessage message={message} />}
        {!!globalSettings?.showImageRights && !!props.source?.copyright && (
          <ImageRights imageRights={props.source.copyright} />
        )}
      </RNEImage>
    </View>
  );
};

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
  source: PropTypes.oneOfType([PropTypes.object, PropTypes.number]).isRequired,
  message: PropTypes.string,
  containerStyle: PropTypes.object,
  style: PropTypes.object,
  PlaceholderContent: PropTypes.object,
  aspectRatio: PropTypes.object,
  resizeMode: PropTypes.string,
  borderRadius: PropTypes.number,
  refreshInterval: PropTypes.number
};

Image.defaultProps = {
  PlaceholderContent: <ActivityIndicator color={colors.accent} />,
  resizeMode: 'cover',
  borderRadius: 0
};
