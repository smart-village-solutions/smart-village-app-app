import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Icon, normalize, texts } from '../../config';
import { VolunteerReportTarget } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { RegularText } from '../Text';

import { useVolunteerReport } from './VolunteerReportContext';

export const VolunteerReportAction = ({
  target,
  variant = 'icon',
  withSeparator = false
}: {
  target: VolunteerReportTarget;
  variant?: 'icon' | 'text';
  withSeparator?: boolean;
}) => {
  const { colors } = useTheme();
  const { enabled, openReport } = useVolunteerReport();

  if (!enabled) return null;

  const action = (
    <TouchableOpacity
      accessibilityHint={texts.volunteer.report.actionHint}
      accessibilityLabel={texts.volunteer.report.action(target.label)}
      accessibilityRole="button"
      hitSlop={normalize(12)}
      onPress={() => openReport(target)}
      style={variant === 'icon' ? styles.iconButton : undefined}
    >
      {variant === 'icon' ? (
        <Icon.Flag color={colors.darkText} size={normalize(20)} />
      ) : (
        <RegularText small>{texts.volunteer.report.label}</RegularText>
      )}
    </TouchableOpacity>
  );

  return withSeparator ? (
    <>
      <RegularText small> • </RegularText>
      {action}
    </>
  ) : (
    action
  );
};

const styles = StyleSheet.create({
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: normalize(44),
    minWidth: normalize(44)
  }
});
