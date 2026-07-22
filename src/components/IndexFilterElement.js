import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import styled from 'styled-components/native';

import { lightColors } from '../config/colors';
import { useThemeStyles } from '../hooks/useThemeStyles';

import { WrapperVertical } from './Wrapper';

export const IndexFilterWrapper = styled.View`
  border-bottom-width: ${StyleSheet.hairlineWidth};
  border-bottom-color: ${(props) => props.theme?.shadow || lightColors.shadow};
`;

export const IndexFilterElement = ({ children, selected }) => {
  const styles = useThemeStyles(createStyles);

  return (
    <WrapperVertical>
      <View style={selected ? styles.underline : undefined}>{children}</View>
    </WrapperVertical>
  );
};

const createStyles = (colors) => ({
  underline: {
    borderBottomColor: colors.primary,
    borderBottomWidth: 1
  }
});

IndexFilterElement.propTypes = {
  children: PropTypes.node.isRequired,
  selected: PropTypes.bool.isRequired
};
