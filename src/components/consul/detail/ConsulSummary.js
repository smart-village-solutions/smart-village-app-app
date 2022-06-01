import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '../../../config';
import { BoldText } from '../../Text';
import { Wrapper } from '../../Wrapper';

export const ConsulSummary = ({ summary }) => {
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
    borderLeftColor: colors.placeholder,
    borderLeftWidth: 0.5,
    paddingHorizontal: 10
  }
});

ConsulSummary.propTypes = {
  summary: PropTypes.string
};
