import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { colors, normalize } from '../config';
import { openLink } from '../helpers';
import { link } from '../icons';
import { Icon } from './Icon';
import { RegularText } from './Text';
import { WrapperRow } from './Wrapper';

export const Link = ({ url, title }) => (
  <TouchableOpacity onPress={() => openLink(url)}>
    <WrapperRow>
      <Icon icon={link(colors.secondary)} style={styles.icon} />
      <RegularText link>{title}</RegularText>
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
  title: PropTypes.string.isRequired
};
