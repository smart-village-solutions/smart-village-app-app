import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, consts, Icon, normalize } from '../config';
import { openLink } from '../helpers';

import { RegularText } from './Text';
import { WrapperRow } from './Wrapper';

export const Link = ({ url, description, openWebScreen }) => (
  <TouchableOpacity
    onPress={() => openLink(url, openWebScreen)}
    accessibilityLabel={`(${description}) ${consts.a11yLabel.link}`}
  >
    <WrapperRow>
      <Icon.Link color={colors.primary} style={styles.icon} />
      <View style={styles.textContainer}>
        <RegularText primary>{description}</RegularText>
      </View>
    </WrapperRow>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  icon: {
    marginRight: normalize(5),
    marginTop: normalize(3)
  },
  textContainer: {
    flex: 1,
    minWidth: 0
  }
});

Link.propTypes = {
  url: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  openWebScreen: PropTypes.func
};
