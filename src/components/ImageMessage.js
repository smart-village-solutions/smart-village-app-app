import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { normalize } from '../config';

import { HtmlView } from './HtmlView';

export const ImageMessage = ({ message }) => (
  <View style={styles.containerStyle}>
    <HtmlView html={message} />
  </View>
);

const styles = StyleSheet.create({
  containerStyle: {
    bottom: normalize(24),
    marginLeft: normalize(14),
    marginRight: normalize(14)
  }
});

ImageMessage.propTypes = {
  message: PropTypes.string.isRequired
};
