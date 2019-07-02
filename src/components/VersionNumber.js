import React from 'react';
import { StyleSheet } from 'react-native';

import appJson from '../../app.json';
import { colors, normalize } from '../config';
import { RegularText } from './Text.js';
import { WrapperNoFlex } from './Wrapper.js';

export const VersionNumber = () => {
  return (
    <WrapperNoFlex>
      <RegularText small style={styles.version}>
        Version: {appJson.expo.version}
      </RegularText>
    </WrapperNoFlex>
  );
};

const styles = StyleSheet.create({
  version: {
    color: colors.shadow,
    fontSize: normalize(11),
    textAlign: 'center'
  }
});
