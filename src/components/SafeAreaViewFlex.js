import PropTypes from 'prop-types';
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

export const SafeAreaViewFlex = ({ children }) => (
  <SafeAreaView style={styles.flex}>{children}</SafeAreaView>
);

const styles = StyleSheet.create({
  flex: {
    flex: 1
  }
});

SafeAreaViewFlex.propTypes = {
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
};
