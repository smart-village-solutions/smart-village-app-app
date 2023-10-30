import _camelCase from 'lodash/camelCase';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';

import { SettingsContext } from '../../SettingsProvider';
import { normalize } from '../../config';
import { RegularText } from '../Text';
import { Wrapper } from '../Wrapper';

export const SueStatus = ({ status }: { status: string }) => {
  const { globalSettings } = useContext(SettingsContext);
  const { appDesignSystem = {} } = globalSettings;
  const { sueStatus = {} } = appDesignSystem;
  const {
    containerStyle = {},
    textStyle = {},
    statusViewColors = {},
    statusTextColors = {}
  } = sueStatus;

  const camelCaseStatus = _camelCase(status);

  const backgroundColor = statusViewColors?.[camelCaseStatus];
  const textColor = statusTextColors?.[camelCaseStatus];

  return (
    <Wrapper style={[styles.container, !!containerStyle && containerStyle, { backgroundColor }]}>
      <RegularText style={[!!textStyle && textStyle, { color: textColor }]} smallest>
        {status}
      </RegularText>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    borderRadius: normalize(40),
    justifyContent: 'center',
    margin: normalize(10)
  }
});
