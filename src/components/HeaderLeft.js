import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, normalize } from '../config';
import { arrowLeft } from '../icons';

import { Icon } from './Icon';

export const HeaderLeft = ({ navigation }) => (
  <View>
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      accessibilityLabel="Zurück Taste"
      accessibilityHint="Navigieren zurück zur vorherigen Seite"
    >
      <Icon xml={arrowLeft(colors.lightestText)} style={styles.icon} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(14)
  }
});

HeaderLeft.propTypes = {
  navigation: PropTypes.object.isRequired
};
