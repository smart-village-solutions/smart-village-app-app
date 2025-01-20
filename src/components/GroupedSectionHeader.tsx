import React from 'react';
import { StyleSheet } from 'react-native';

import { colors, normalize } from '../config';

import { HeadlineText } from './Text';
import { Wrapper } from './Wrapper';

export const GroupedSectionHeader = ({ item }) => {
  return (
    <Wrapper style={styles.header}>
      <HeadlineText biggest>{item}</HeadlineText>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    paddingBottom: normalize(4),
    paddingTop: normalize(24)
  }
});
