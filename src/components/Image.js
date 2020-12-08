import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { CacheManager } from 'react-native-expo-image-cache';
import { Image as RNEImage } from 'react-native-elements';

import { colors } from '../config';
import { imageHeight, imageWidth } from '../helpers';
import { SettingsContext } from '../SettingsProvider';
import { ImageRights } from './ImageRights';

export const Image = ({ source, style, PlaceholderContent }) => {
  const [uri, setUri] = useState(null);
  const { globalSettings } = useContext(SettingsContext);

  // if there is a source.uri to fetch, do it with the CacheManager and set the local path to show.
  // if there is no uri, the source itself should be already a local path, so set it immediately.
  useEffect(() => {
    // to fix the warning:
    // "Can't perform a React state update on an unmounted component.
    //  This is a no-op, but it indicates a memory leak in your application.
    //  To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function."
    // -> https://juliangaramendy.dev/use-promise-subscription/
    let mounted = true;

    source.uri
      ? CacheManager.get(source.uri)
          .getPath()
          .then((path) => mounted && setUri(path))
          .catch((err) => console.warn('An error occurred with cache management for an image', err))
      : mounted && setUri(source);

    return () => (mounted = false);
  }, [source, setUri]);

  if (!globalSettings.showImageRights || !source.copyright) {
    return (
      <RNEImage
        source={uri ? (source.uri ? { uri } : uri) : null}
        style={style}
        PlaceholderContent={PlaceholderContent}
        placeholderStyle={{ backgroundColor: colors.transparent }}
        accessible={!!source.captionText}
        accessibilityLabel={source.captionText}
      />
    );
  }

  return (
    <View>
      <RNEImage
        source={uri ? (source.uri ? { uri } : uri) : null}
        style={style}
        PlaceholderContent={PlaceholderContent}
        placeholderStyle={{ backgroundColor: colors.transparent }}
        accessible={!!source.captionText}
        accessibilityLabel={source.captionText}
      />
      <ImageRights imageRights={source.copyright} />
    </View>
  );
};

Image.propTypes = {
  source: PropTypes.oneOfType([PropTypes.object, PropTypes.number]).isRequired,
  style: PropTypes.object,
  PlaceholderContent: PropTypes.object
};

Image.defaultProps = {
  style: {
    alignSelf: 'center',
    height: imageHeight(imageWidth()),
    width: imageWidth()
  },
  PlaceholderContent: <ActivityIndicator color={colors.accent} />
};
