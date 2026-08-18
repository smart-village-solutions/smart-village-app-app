import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { normalize } from '../config';
import { useTheme } from '../hooks/useTheme';

export const LoadingContainer = ({ children, web }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.loadingContainer, web && styles.webPosition, web && styles.webBackground]}>
      {children}
    </View>
  );
};

/* eslint-disable react-native/no-unused-styles */
const createStyles = (colors) =>
  StyleSheet.create({
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
    },
    webBackground: {
      backgroundColor: colors.surface
    }
  });
/* eslint-enable react-native/no-unused-styles */

LoadingContainer.propTypes = {
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  web: PropTypes.bool
};
