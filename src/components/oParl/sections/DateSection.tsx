import React from 'react';
import { StyleSheet, View } from 'react-native';

import { normalize, texts } from '../../../config';
import { momentFormat } from '../../../helpers';
import { BoldText, RegularText } from '../../Text';
import { WrapperRow } from '../../Wrapper';

type Props = {
  endDate?: Date;
  startDate?: Date;
  withTime?: boolean;
};

const { dateSection } = texts.oparl;

export const DateSection = ({ endDate, startDate, withTime }: Props) => {
  if (!endDate && !startDate) {
    return null;
  }

  const formatString = withTime ? 'DD.MM.YYYY HH:mm:ss [Uhr]' : 'DD.MM.YYYY';

  const now = new Date().valueOf();
  const alreadyEnded = (endDate?.valueOf() || 0) < now;
  const alreadyStarted = (startDate?.valueOf() || 0) < now;

  return (
    <View style={styles.marginTop}>
      {!!startDate && (
        <WrapperRow>
          <BoldText>{alreadyStarted ? dateSection.started : dateSection.starts}</BoldText>
          <RegularText>{momentFormat(startDate.valueOf(), formatString, 'x')}</RegularText>
        </WrapperRow>
      )}
      {!!endDate && (
        <WrapperRow>
          <BoldText>{alreadyEnded ? dateSection.ended : dateSection.ends}</BoldText>
          <RegularText>{momentFormat(endDate.valueOf(), formatString, 'x')}</RegularText>
        </WrapperRow>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  marginTop: {
    marginTop: normalize(12)
  }
});
