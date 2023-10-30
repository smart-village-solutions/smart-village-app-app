import React from 'react';
import { StyleSheet } from 'react-native';

import { colors, normalize, texts } from '../../config';
import { BoldText, RegularText } from '../Text';
import { Wrapper, WrapperRow } from '../Wrapper';

import { SUEStatus, StatusTypes } from './SUEStatus';

export const SUEStatuses = ({ status }: { status: string }) => {
  return (
    <>
      <Wrapper>
        <BoldText>{texts.sue.currentStatus}</BoldText>
        <WrapperRow style={styles.wrapper}>
          <SUEStatus
            status={StatusTypes.InBearbeitung}
            containerStyle={{
              ...styles.status,
              ...(status !== StatusTypes.InBearbeitung ? styles.statusNotCurrent : undefined)
            }}
            backgroundColors=""
            textColors=""
          />
          <RegularText lighter>—</RegularText>
          <SUEStatus
            status={StatusTypes.Offen}
            containerStyle={{
              ...styles.status,
              ...(status !== StatusTypes.Offen ? styles.statusNotCurrent : undefined)
            }}
            backgroundColors=""
            textColors=""
          />
          <RegularText lighter>—</RegularText>
          <SUEStatus
            status={StatusTypes.Unbearbeitet}
            containerStyle={{
              ...styles.status,
              ...(status !== StatusTypes.Unbearbeitet ? styles.statusNotCurrent : undefined)
            }}
            backgroundColors=""
            textColors=""
          />
        </WrapperRow>
      </Wrapper>
    </>
  );
};

const styles = StyleSheet.create({
  status: {
    margin: 0
  },
  statusNotCurrent: {
    backgroundColor: colors.gray20
  },
  wrapper: {
    alignItems: 'center',
    marginTop: normalize(10)
  }
});
