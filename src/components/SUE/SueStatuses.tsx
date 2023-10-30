import _camelCase from 'lodash/camelCase';
import React, { Fragment, useContext } from 'react';
import { StyleSheet } from 'react-native';

import { SettingsContext } from '../../SettingsProvider';
import { normalize, texts } from '../../config';
import { BoldText, RegularText } from '../Text';
import { Wrapper, WrapperRow } from '../Wrapper';

import { SueStatus } from './SueStatus';

export const SueStatuses = ({ status }: { status: string }) => {
  const { globalSettings } = useContext(SettingsContext);
  const { appDesignSystem = {} } = globalSettings;
  const { sueStatus = {} } = appDesignSystem;
  const { statuses } = sueStatus;

  if (!statuses?.length) return null;

  return (
    <Wrapper>
      <BoldText>{texts.sue.currentStatus}</BoldText>
      <WrapperRow style={styles.wrapper}>
        {statuses?.map((item: string, index: number) => (
          <Fragment key={index}>
            <SueStatus
              key={item}
              status={item}
              disabled={_camelCase(item) !== _camelCase(status)}
            />
            {index < statuses.length - 1 && <RegularText lighter>—</RegularText>}
          </Fragment>
        ))}
      </WrapperRow>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginTop: normalize(10)
  }
});
