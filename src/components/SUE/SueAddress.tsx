import React from 'react';
import { StyleSheet } from 'react-native';

import { RegularText } from '../Text';
import { Wrapper } from '../Wrapper';

export const SueAddress = ({ address }: { address: string }) => {
  return (
    <Wrapper style={styles.noPadding}>
      <RegularText small>{address}</RegularText>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  noPadding: {
    paddingBottom: 0
  }
});
