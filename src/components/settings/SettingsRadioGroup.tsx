import React from 'react';
import { View } from 'react-native';
import { ListItem } from 'react-native-elements';

import { normalize } from '../../config';
import { Radiobutton } from '../Radiobutton';
import { BoldText, RegularText } from '../Text';
import { useThemeStyles } from '../../hooks/useThemeStyles';

type Props<Value extends string> = {
  title: string;
  description?: string;
  options: ReadonlyArray<{ label: string; value: Value }>;
  onChange: (value: Value) => void;
  value: Value;
  disabled?: boolean;
};

export const SettingsRadioGroup = <Value extends string>({
  title,
  description,
  options,
  onChange,
  value,
  disabled
}: Props<Value>) => {
  const styles = useThemeStyles(createStyles);

  return (
    <ListItem accessible={false} containerStyle={styles.container} importantForAccessibility="no">
      <ListItem.Content>
        <BoldText small>{title}</BoldText>
        {description && <RegularText small>{description}</RegularText>}

        <View accessibilityLabel={title} accessibilityRole="radiogroup" style={styles.radioGroup}>
          {options.map((option) => (
            <Radiobutton
              key={option.value}
              containerStyle={styles.radio}
              disabled={disabled}
              onPress={() => onChange(option.value)}
              selected={value === option.value}
              title={option.label}
            />
          ))}
        </View>
      </ListItem.Content>
    </ListItem>
  );
};

const createStyles = (colors) => ({
  container: {
    backgroundColor: colors.transparent,
    paddingHorizontal: 0,
    paddingVertical: normalize(10)
  },

  radio: {
    backgroundColor: colors.transparent
  },

  radioGroup: {
    marginTop: normalize(8),
    width: '100%'
  }
});
