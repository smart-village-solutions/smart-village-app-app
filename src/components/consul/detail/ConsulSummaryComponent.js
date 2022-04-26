import PropTypes from 'prop-types';
import React from 'react';
import { View, StyleSheet } from 'react-native';

import { colors } from '../../../config';
import { BoldText } from '../../Text';
import { Wrapper } from '../../Wrapper';

export const ConsulSummaryComponent = ({ summary }) => {
  return (
    <Wrapper>
      <View style={styles.textContainer}>
        <BoldText small>{summary}</BoldText>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  textContainer: {
    borderLeftWidth: 0.5,
    borderLeftColor: colors.placeholder,
    paddingHorizontal: 10
  }
});

ConsulSummaryComponent.propTypes = {
  summary: PropTypes.string
};
