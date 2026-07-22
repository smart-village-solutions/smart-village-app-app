import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';

import { BoldText } from '../../Text';
import { Wrapper } from '../../Wrapper';
import { useThemeStyles } from '../../../hooks/useThemeStyles';

export const ConsulSummary = ({ summary }) => {
  const styles = useThemeStyles(createStyles);
  return (
    <Wrapper>
      <View style={styles.textContainer}>
        <BoldText small>{summary}</BoldText>
      </View>
    </Wrapper>
  );
};

const createStyles = (colors) => ({
  textContainer: {
    borderLeftColor: colors.placeholder,
    borderLeftWidth: 0.5,
    paddingHorizontal: 10
  }
});

ConsulSummary.propTypes = {
  summary: PropTypes.string
};
