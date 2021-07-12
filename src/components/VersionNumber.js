import React from 'react';
import { StyleSheet } from 'react-native';

import appJson from '../../app.json';
import { consts, colors, normalize } from '../config';
import { RegularText } from './Text.js';
import { Wrapper } from './Wrapper.js';

export const VersionNumber = () => {
  return (
    <Wrapper>
      <RegularText
        small
        style={styles.version}
        accessibilityLabel={`${consts.a11yLabel.appVersion} ${appJson.expo.version}`}
      >
        Version: {appJson.expo.version}
      </RegularText>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  version: {
    color: colors.shadow,
    fontSize: normalize(11),
    textAlign: 'center'
  }
});
