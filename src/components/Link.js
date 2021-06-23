import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { colors, normalize } from '../config';
import { openLink } from '../helpers';
import { link } from '../icons';

import { Icon } from './Icon';
import { RegularText } from './Text';
import { WrapperRow } from './Wrapper';

export const Link = ({ url, description, openWebScreen }) => (
  <TouchableOpacity
    onPress={() => openLink(url, openWebScreen)}
    accessibilityLabel={`${description} (Taste)`}
  >
    <WrapperRow>
      <Icon xml={link(colors.secondary)} style={styles.icon} />
      <RegularText primary>{description}</RegularText>
    </WrapperRow>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  icon: {
    marginRight: normalize(5),
    marginTop: normalize(3)
  }
});

Link.propTypes = {
  url: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  openWebScreen: PropTypes.func
};
