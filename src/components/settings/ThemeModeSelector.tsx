import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ListItem } from 'react-native-elements';

import { colors, normalize, texts } from '../../config';
import { ThemeMode } from '../../types/Theme';
import { Radiobutton } from '../Radiobutton';
import { BoldText, RegularText } from '../Text';

type Props = {
  onChange: (mode: ThemeMode) => void;
  value: ThemeMode;
};

const THEME_MODE_OPTIONS: Array<{ label: string; value: ThemeMode }> = [
  { label: texts.settingsContents.accessibility.theme.light, value: 'light' },
  { label: texts.settingsContents.accessibility.theme.dark, value: 'dark' },
  { label: texts.settingsContents.accessibility.theme.system, value: 'system' }
];

export const ThemeModeSelector = ({ onChange, value }: Props) => (
  <ListItem accessible={false} containerStyle={styles.container} importantForAccessibility="no">
    <ListItem.Content>
      <BoldText small>{texts.settingsContents.accessibility.theme.title}</BoldText>
      <RegularText small>{texts.settingsContents.accessibility.theme.description}</RegularText>

      <View
        accessibilityLabel={texts.settingsContents.accessibility.theme.title}
        accessibilityRole="radiogroup"
        style={styles.radioGroup}
      >
        {THEME_MODE_OPTIONS.map((option) => (
          <Radiobutton
            key={option.value}
            containerStyle={styles.radio}
            onPress={() => onChange(option.value)}
            selected={value === option.value}
            title={option.label}
          />
        ))}
      </View>
    </ListItem.Content>
  </ListItem>
);

const styles = StyleSheet.create({
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
