import React from 'react';
import { StyleSheet } from 'react-native';

import { RegularText } from '../Text';
import { Wrapper } from '../Wrapper';

export const SueAddress = ({ address }: { address: string }) => {
  return (
    <Wrapper style={styles.noPaddingTop}>
      <RegularText small>{address}</RegularText>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  noPaddingTop: {
    paddingTop: 0
  }
});
