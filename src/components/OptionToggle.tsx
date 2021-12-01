import React from 'react';
import { StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';

import { colors, consts, device, normalize } from '../config';

import { Switch } from './Switch';
import { BoldText, RegularText } from './Text';
import { Touchable } from './Touchable';

type Props = {
  label: string;
  onToggle: () => void;
  value?: boolean;
  options?: {
    bold?: boolean;
  };
};

// TODO: reuse this component for WasteReminderSettings and SettingsToggle
export const OptionToggle = ({ label, onToggle, value, options }: Props) => {
  const TextComponent = options?.bold ? BoldText : RegularText;
  return (
    <ListItem
      title={<TextComponent>{label}</TextComponent>}
      bottomDivider
      containerStyle={styles.switchContainer}
      rightIcon={<Switch switchValue={!!value} toggleSwitch={onToggle} />}
      onPress={onToggle}
      delayPressIn={0}
      Component={Touchable}
      accessibilityLabel={`(${label}) ${consts.a11yLabel.button}`}
    />
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    backgroundColor: colors.transparent,
    paddingVertical: device.platform === 'ios' ? normalize(12) : normalize(3.85)
  }
});
