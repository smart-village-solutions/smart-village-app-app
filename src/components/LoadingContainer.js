import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { normalize } from '../config';

export const LoadingContainer = ({ children, containerStyle, web }) => (
  <View style={[styles.loadingContainer, web && styles.webPosition, containerStyle]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: normalize(14)
  },
  // for WebView an additional style is necessary currently
  // https://github.com/react-native-community/react-native-webview/issues/1031
  webPosition: {
    position: 'absolute',
    height: '100%',
    width: '100%'
  }
});

LoadingContainer.propTypes = {
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  containerStyle: PropTypes.object,
  web: PropTypes.bool
};
