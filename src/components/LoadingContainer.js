import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { normalize } from '../config';

export const LoadingContainer = ({ children }) => (
  <View style={styles.loadingContainer}>{children}</View>
);

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: normalize(14)
  }
});

LoadingContainer.propTypes = {
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
};
