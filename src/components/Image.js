import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { CacheManager } from 'react-native-expo-image-cache';
import { Image as RNEImage } from 'react-native-elements';

import { colors } from '../config';
import { imageHeight, imageWidth } from '../helpers';

export const Image = ({ source, style, PlaceholderContent }) => {
  const [uri, setUri] = useState(null);

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
      : mounted && setUri(source);

    return () => (mounted = false);
  }, []);

  // TODO: is there a performance issue here? when logging here, there is a lot going on even
  //       when nothing is done in the app by the user
  // console.log('source', source);
  // console.log('uri', uri);

  return (
    <RNEImage
      source={uri ? (source.uri ? { uri } : uri) : null}
      style={style}
      PlaceholderContent={PlaceholderContent}
      placeholderStyle={{ backgroundColor: colors.transparent }}
    />
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
    height: imageHeight(),
    width: imageWidth()
  },
  PlaceholderContent: <ActivityIndicator color={colors.accent} />
};
