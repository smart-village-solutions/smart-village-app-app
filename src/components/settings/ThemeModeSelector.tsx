import React from 'react';

import { texts } from '../../config';
import { ThemeMode } from '../../types/Theme';

import { SettingsRadioGroup } from './SettingsRadioGroup';

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
  <SettingsRadioGroup
    title={texts.settingsContents.accessibility.theme.title}
    description={texts.settingsContents.accessibility.theme.description}
    options={THEME_MODE_OPTIONS}
    onChange={onChange}
    value={value}
  />
);
