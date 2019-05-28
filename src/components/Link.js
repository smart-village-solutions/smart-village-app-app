import PropTypes from 'prop-types';
import React from 'react';

import { Linking, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';

import { link } from '../icons';
import { colors } from '../config';
import { Icon } from './Icon';

const LinkStyle = styled.Text`
  color: ${colors.secondary};
  font-family: titillium-web-bold;
`;

export const Link = ({ url, title }) => (
  <TouchableOpacity onPress={() => Linking.openURL(url)}>
    <View style={{ flexDirection: 'row' }}>
      <LinkStyle>{title}</LinkStyle>
      <Icon icon={link(colors.secondary)} style={{ marginLeft: 5 }} />
    </View>
  </TouchableOpacity>
);

Link.propTypes = {
  url: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};
