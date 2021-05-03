import React from 'react';
import { StyleSheet, View } from 'react-native';

import { normalize, texts } from '../../../config';
import { momentFormat } from '../../../helpers';
import { BoldText, RegularText } from '../../Text';
import { WrapperWrap } from '../../Wrapper';

type Props = {
  created?: number;
  modified?: number;
  deleted?: boolean;
};

const { modifiedSection } = texts.oparl;

const formatDate = (date: number) => momentFormat(date, 'DD.MM.YYYY HH:mm:ss [Uhr]', 'x');

export const ModifiedSection = ({ created, modified, deleted }: Props) => {
  if (!created && !modified) {
    return null;
  }

  return (
    <View style={styles.marginTop}>
      {!!created && (
        <WrapperWrap>
          <BoldText>{modifiedSection.created}</BoldText>
          <RegularText>{formatDate(created)}</RegularText>
        </WrapperWrap>
      )}
      {!!modified && (
        <WrapperWrap>
          <BoldText>{modifiedSection.modified}</BoldText>
          <RegularText>{formatDate(modified)}</RegularText>
        </WrapperWrap>
      )}
      {deleted && <RegularText>{modifiedSection.deleted}</RegularText>}
    </View>
  );
};

const styles = StyleSheet.create({
  marginTop: {
    marginTop: normalize(12)
  }
});
