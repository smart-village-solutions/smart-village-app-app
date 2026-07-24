import React from 'react';
import { StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';

import { colors, normalize } from '../config';

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
      accessible={false}
      containerStyle={styles.switchContainer}
      onPress={onToggle}
      delayPressIn={0}
      Component={Touchable}
      importantForAccessibility="no"
    >
      <ListItem.Content>
        <TextComponent small>{label}</TextComponent>
      </ListItem.Content>

      <Switch accessibilityLabel={label} switchValue={!!value} toggleSwitch={onToggle} />
    </ListItem>
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    backgroundColor: colors.transparent,
    padding: 0,
    paddingVertical: normalize(12)
  }
});
