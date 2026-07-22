import React from 'react';
import 'react-native';

import { normalize } from '../config';
import { useThemeStyles } from '../hooks/useThemeStyles';

import { HeadlineText } from './Text';
import { Wrapper } from './Wrapper';

export const GroupedSectionHeader = ({ item }) => {
  const styles = useThemeStyles(createStyles);
  return (
    <Wrapper style={styles.header}>
      <HeadlineText biggest>{item}</HeadlineText>
    </Wrapper>
  );
};

const createStyles = (colors) => ({
  header: {
    backgroundColor: colors.surface,
    paddingBottom: normalize(4),
    paddingTop: normalize(24)
  }
});
