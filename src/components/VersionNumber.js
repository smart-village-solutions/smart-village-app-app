import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';

import appJson from '../../app.json';
import { AccessibilityContext } from '../AccessibilityProvider';
import { colors, consts, device, normalize } from '../config';

import { RegularText } from './Text.js';
import { Wrapper } from './Wrapper.js';

export const VersionNumber = () => {
  const { isReduceTransparencyEnabled } = useContext(AccessibilityContext);
  const buildNumber =
    device.platform === 'ios' ? appJson.expo.ios.buildNumber : appJson.expo.android.versionCode;

  return (
    <Wrapper>
      <RegularText
        small
        style={[styles.version, isReduceTransparencyEnabled && styles.accessibilityColor]}
        accessibilityLabel={`${consts.a11yLabel.appVersion} ${appJson.expo.version}`}
      >
        Version: {appJson.expo.version} (build: {buildNumber} - OTA: {appJson.expo.otaVersion})
      </RegularText>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  accessibilityColor: {
    color: colors.darkText
  },
  version: {
    color: colors.shadow,
    fontSize: normalize(11),
    textAlign: 'center'
  }
});
