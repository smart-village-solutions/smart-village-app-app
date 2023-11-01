import _upperFirst from 'lodash/upperFirst';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';

import { SettingsContext } from '../../SettingsProvider';
import { Icon, normalize } from '../../config';
import { BoldText, RegularText } from '../Text';
import { WrapperRow } from '../Wrapper';

export const SueStatus = ({
  disabled,
  iconName,
  small = false,
  status
}: {
  disabled?: boolean;
  iconName?: string;
  small?: boolean;
  status: string;
}) => {
  const { globalSettings } = useContext(SettingsContext);
  const { appDesignSystem = {} } = globalSettings;
  const { sueStatus = {} } = appDesignSystem;
  const {
    containerStyle = {},
    textStyle = {},
    statusViewColors = {},
    statusTextColors = {}
  } = sueStatus;

  const backgroundColor = disabled ? statusViewColors?.disabled : statusViewColors?.[status];
  const textColor = disabled ? statusTextColors?.disabled : statusTextColors?.[status];
  const statusIconName = `Sue${_upperFirst(iconName)}${small ? 'Small' : ''}`;
  const StatusIcon = Icon[statusIconName as keyof typeof Icon];

  return (
    <WrapperRow
      style={[
        styles.container,
        !!containerStyle && containerStyle,
        small && styles.smallContainer,
        { backgroundColor }
      ]}
    >
      {!!iconName && (
        <StatusIcon
          color={textColor}
          size={small ? normalize(12) : normalize(16)}
          style={small ? styles.smallMarginRight : styles.marginRight}
        />
      )}
      <BoldText
        smallest
        style={[!!textStyle && textStyle, small && styles.smallFontSize, { color: textColor }]}
      >
        {status}
      </BoldText>
    </WrapperRow>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    borderRadius: normalize(22),
    justifyContent: 'center',
    marginBottom: normalize(14),
    marginRight: normalize(14),
    marginTop: normalize(7),
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(4)
  },
  smallContainer: {
    borderRadius: normalize(28),
    marginBottom: 0,
    marginRight: 0,
    marginTop: 0
  },
  marginRight: {
    marginRight: normalize(6)
  },
  smallFontSize: {
    fontSize: normalize(9)
  },
  smallMarginRight: {
    marginRight: normalize(4)
  }
});
