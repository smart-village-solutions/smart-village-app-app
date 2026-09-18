import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { Icon, normalize, texts } from '../config';
import { VolunteerReportTarget } from '../types';
import { useTheme } from '../hooks/useTheme';

import { HeaderIconButton } from './HeaderIconButton';
import { useVolunteerReport } from './volunteer/VolunteerReportContext';

export const ReportHeader = ({
  style,
  target
}: {
  style?: StyleProp<ViewStyle>;
  target: VolunteerReportTarget;
}) => {
  const { colors } = useTheme();
  const { enabled, openReport } = useVolunteerReport();

  if (!enabled) return null;

  return (
    <HeaderIconButton
      accessibilityHint={texts.volunteer.report.actionHint}
      accessibilityLabel={texts.volunteer.report.action(target.label)}
      onPress={() => openReport(target)}
      style={style}
    >
      <Icon.Flag color={colors.darkText} size={normalize(22)} />
    </HeaderIconButton>
  );
};
