import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Icon, normalize, texts } from '../../config';
import { VolunteerReportTarget } from '../../types';
import { useTheme } from '../../hooks/useTheme';

import { useVolunteerReport } from './VolunteerReportContext';

export const VolunteerReportAction = ({ target }: { target: VolunteerReportTarget }) => {
  const { colors } = useTheme();
  const { enabled, openReport } = useVolunteerReport();

  if (!enabled) return null;

  return (
    <TouchableOpacity
      accessibilityHint={texts.volunteer.report.actionHint}
      accessibilityLabel={texts.volunteer.report.action(target.label)}
      accessibilityRole="button"
      onPress={() => openReport(target)}
      style={styles.button}
    >
      <Icon.Flag color={colors.darkText} size={normalize(20)} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: normalize(44),
    minWidth: normalize(44)
  }
});
