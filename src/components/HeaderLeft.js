import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, consts, normalize } from '../config';
import { arrowLeft } from '../icons';
import { Icon } from './Icon';

export const HeaderLeft = ({ navigation }) => (
  <View>
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      accessibilityLabel={consts.a11yLabel.backIcon}
      accessibilityHint={consts.a11yLabel.backIconHint}
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
