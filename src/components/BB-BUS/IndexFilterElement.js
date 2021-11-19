import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import styled from 'styled-components/native';

import { colors } from '../../config';
import { WrapperVertical } from '../Wrapper';

export const IndexFilterWrapper = styled.View`
  border-bottom-width: ${StyleSheet.hairlineWidth};
  border-bottom-color: ${colors.shadow};
`;

export const IndexFilterElement = ({ children, selected }) => (
  <WrapperVertical>
    <View style={selected ? styles.underline : undefined}>{children}</View>
  </WrapperVertical>
);

IndexFilterElement.propTypes = {
  children: PropTypes.node.isRequired,
  selected: PropTypes.bool.isRequired
};

const styles = StyleSheet.create({
  underline: {
    borderBottomColor: colors.primary,
    borderBottomWidth: 1
  }
});
