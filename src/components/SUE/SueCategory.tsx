import React from 'react';
import { StyleSheet } from 'react-native';
import { Divider } from 'react-native-elements';

import { momentFormat } from '../../helpers';
import { BoldText, RegularText } from '../Text';
import { Wrapper, WrapperRow, WrapperVertical } from '../Wrapper';

export const SueCategory = ({
  serviceName,
  requestedDateTime
}: {
  serviceName: string;
  requestedDateTime: string;
}) => {
  return (
    <Wrapper style={styles.noPaddingTop}>
      <WrapperVertical>
        <WrapperRow spaceBetween>
          <BoldText small>{serviceName}</BoldText>
          <RegularText small>{momentFormat(requestedDateTime)}</RegularText>
        </WrapperRow>
      </WrapperVertical>
      <Divider />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  noPaddingTop: {
    paddingTop: 0
  }
});
