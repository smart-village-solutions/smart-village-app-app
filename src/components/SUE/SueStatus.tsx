import _upperFirst from 'lodash/upperFirst';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';

import { ConfigurationsContext } from '../../ConfigurationsProvider';
import { Icon, colors, device, normalize } from '../../config';
import { BoldText } from '../Text';
import { WrapperRow } from '../Wrapper';

/* eslint-disable complexity */
export const SueStatus = ({
  disabled,
  iconName,
  isFilter,
  small = false,
  status
}: {
  disabled?: boolean;
  iconName?: string;
  isFilter?: boolean;
  small?: boolean;
  status: string;
}) => {
  const { appDesignSystem = {} } = useContext(ConfigurationsContext);
  const { sueStatus = {} } = appDesignSystem;
  const {
    containerStyle = {},
    statusTextColors = {},
    statusTextColorsFilter = {},
    statusViewColors = {},
    statusViewColorsFilter = {},
    textStyle = {}
  } = sueStatus;

  const backgroundColor =
    isFilter && disabled
      ? statusViewColorsFilter?.disabled
      : isFilter
      ? statusViewColorsFilter?.enabled
      : disabled
      ? statusViewColors?.disabled
      : statusViewColors?.[status];

  const borderColor = isFilter && disabled ? colors.placeholder : colors.primary;

  const textColor =
    isFilter && disabled
      ? statusTextColorsFilter?.disabled
      : isFilter
      ? statusTextColorsFilter?.enabled
      : disabled
      ? statusTextColors?.disabled
      : statusTextColors?.[status];

  const statusIconName = `Sue${_upperFirst(iconName)}${small ? 'Small' : ''}`;
  const StatusIcon = Icon[statusIconName as keyof typeof Icon];

  return (
    <WrapperRow
      style={[
        styles.container,
        !!containerStyle && containerStyle,
        small && styles.smallContainer,
        { backgroundColor, borderColor },
        isFilter && styles.filterContainer
      ]}
    >
      {!!iconName && (
        <StatusIcon
          accessibilityLabel={status}
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
/* eslint-enable complexity */

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
  filterContainer: {
    borderRadius: normalize(8),
    borderWidth: normalize(1),
    height: normalize(32),
    width: device.width * 0.3
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
